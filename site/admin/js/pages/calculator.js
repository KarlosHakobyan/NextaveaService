/* ==========================================================================
   Calculator: what to quote for a job of a given size.

   Pick a service, type the floor area, read the price. The working is shown
   in full rather than hidden behind a single figure, because the operator is
   about to say this number out loud to a customer and needs to see where it
   came from.

   Services priced by the hour are converted through their coverage figure
   (square metres per hour), which lives on the service in the catalog. Where
   that figure is missing, or where the price does not move with area at all,
   the calculator says so instead of inventing a number.
   ========================================================================== */

import { api, conn } from '../api.js';
import { estimate, parsePrice, KIND, BLOCKED, roundQuote } from '../pricing.js';
import { navigate } from '../router.js';
import { icon } from '../icons.js';
import {
    el, esc, CATEGORIES, categoryLabel, money, demoBanner, skeletonRows, toast
} from '../ui.js';
import { t } from '../i18n.js';

export function render() {
    const page = el('div');
    let services = [];
    let area = '';

    page.innerHTML = `
        ${conn.mode === 'demo' ? demoBanner() : ''}

        <div class="view-head">
            <div>
                <h1>${esc(t('title.calculator'))}</h1>
                <p>${esc(t('calc.subtitle'))}</p>
            </div>
        </div>

        <div class="calc-grid">
            <section class="panel">
                <p class="panel-title">${esc(t('calc.inputs'))}</p>

                <label class="field">
                    <span class="field-label">${esc(t('calc.service'))}</span>
                    <select class="select" name="service" data-service></select>
                </label>

                <label class="field">
                    <span class="field-label">${esc(t('calc.area'))}</span>
                    <input class="input input-data" type="number" name="area"
                           min="1" step="1" inputmode="numeric"
                           placeholder="85" data-area>
                    <span class="field-hint">${esc(t('calc.areaHint'))}</span>
                </label>

                <div data-coverage></div>
            </section>

            <section data-result></section>
        </div>
    `;

    const serviceSel = page.querySelector('[data-service]');
    const areaInput  = page.querySelector('[data-area]');
    const resultHost = page.querySelector('[data-result]');
    const coverHost  = page.querySelector('[data-coverage]');

    resultHost.replaceChildren(skeletonRows(2));

    /* --- Helpers -------------------------------------------------------- */

    function selected() {
        return services.find(s => String(s.id) === serviceSel.value) || null;
    }

    /** "30–35 €/h" — the rate as it will be read back to the operator. */
    function rateLabel(rate) {
        const unit = rate.kind === KIND.HOURLY ? t('calc.perHour')
                   : rate.kind === KIND.PER_AREA ? t('calc.perSqm')
                   : '';
        const span = (rate.max === null || rate.max === undefined || rate.max === rate.min)
            ? `${rate.min} €`
            : `${rate.min}–${rate.max} €`;
        return unit ? `${span}${unit}` : span;
    }

    function amount(low, high) {
        const a = money(roundQuote(low));
        const b = money(roundQuote(high));
        return a === b ? esc(a) : `${esc(a)} – ${esc(b)}`;
    }

    /* --- Rendering ------------------------------------------------------ */

    function paintCoverage(service) {
        if (!service) { coverHost.replaceChildren(); return; }
        const rate = parsePrice(service.price);
        if (rate.kind !== KIND.HOURLY) { coverHost.replaceChildren(); return; }

        const box = el('div', 'calc-coverage');
        const has = Number(service.coverage) > 0;
        box.innerHTML = `
            <span class="field-label" style="margin:0">${esc(t('calc.coverage'))}</span>
            <p class="calc-coverage-value">${has
                ? `<strong>${esc(service.coverage)}</strong> ${esc(t('calc.coverageUnit'))}`
                : `<span style="color:var(--text-3)">${esc(t('calc.coverageUnset'))}</span>`}</p>
            <p class="field-hint" style="margin-top:var(--s2)">${esc(t('calc.coverageHint'))}</p>
        `;
        const link = el('button', 'btn btn-ghost btn-sm', esc(t('calc.editInCatalog')));
        link.type = 'button';
        link.addEventListener('click', () => navigate('/catalog'));
        box.appendChild(link);
        coverHost.replaceChildren(box);
    }

    function blockedPanel(service, result) {
        const rate = result.rate;
        const messages = {
            [BLOCKED.NO_COVERAGE]: [t('calc.noCoverageTitle'), t('calc.noCoverageBody')],
            [BLOCKED.NOT_BY_AREA]: [t('calc.notByAreaTitle'), t('calc.notByAreaBody')],
            [BLOCKED.ESTIMATE]:    [t('calc.estimateTitle'),  t('calc.estimateBody')]
        };
        const [title, body] = messages[result.blocked] || [t('calc.needAreaTitle'), t('calc.needAreaBody')];

        const panel = el('section', 'panel calc-result is-blocked');
        panel.innerHTML = `
            <p class="panel-title">${esc(t('calc.result'))}</p>
            <div class="calc-blocked">
                <div class="calc-blocked-mark">${icon('calculator')}</div>
                <div>
                    <h3>${esc(title)}</h3>
                    <p>${esc(body)}</p>
                </div>
            </div>
            <dl class="dl" style="margin-top:var(--s5)">
                <dt>${esc(t('calc.catalogPrice'))}</dt>
                <dd>${esc(service.price)}</dd>
            </dl>
        `;
        // A flat or per-unit price is still the answer, just not one that
        // depends on area, so show it rather than leaving the operator empty
        // handed.
        if (result.blocked === BLOCKED.NOT_BY_AREA && rate.min !== undefined) {
            panel.querySelector('.dl').insertAdjacentHTML('beforeend', `
                <dt>${esc(t('calc.fixedPrice'))}</dt>
                <dd class="calc-total">${rate.kind === KIND.FLAT_FROM
                    ? esc(t('calc.fromAmount', { amount: money(rate.min) }))
                    : amount(rate.min, rate.max ?? rate.min)}</dd>
            `);
        }
        return panel;
    }

    function resultPanel(service, result) {
        const rate = result.rate;
        const m2 = Number(area);

        const working = rate.kind === KIND.PER_AREA
            ? t('calc.workingArea', { area: m2, rate: rateLabel(rate) })
            : t('calc.workingHours', {
                area: m2,
                coverage: service.coverage,
                hours: result.hours.toFixed(1),
                rate: rateLabel(rate)
              });

        const panel = el('section', 'panel calc-result');
        panel.innerHTML = `
            <p class="panel-title">${esc(t('calc.result'))}</p>

            <p class="calc-total">${amount(result.low, result.high)}</p>
            <p class="calc-mid">${esc(t('calc.midpoint', { amount: money(roundQuote(result.mid)) }))}</p>

            <p class="calc-working">${esc(working)}</p>

            <dl class="dl" style="margin-top:var(--s5)">
                <dt>${esc(t('calc.service'))}</dt>
                <dd>${esc(service.title)}</dd>
                <dt>${esc(t('calc.catalogPrice'))}</dt>
                <dd>${esc(service.price)}</dd>
                ${result.hours ? `
                    <dt>${esc(t('calc.hours'))}</dt>
                    <dd>${esc(result.hours.toFixed(1))} ${esc(t('calc.hoursUnit'))}</dd>` : ''}
            </dl>

            <p class="field-hint" style="margin-top:var(--s4)">${esc(t('calc.rangeNote'))}</p>
        `;

        const copy = el('button', 'btn btn-ghost btn-sm', esc(t('calc.copy')));
        copy.type = 'button';
        copy.style.marginTop = 'var(--s4)';
        copy.addEventListener('click', async () => {
            const text = `${roundQuote(result.mid)}`;
            try {
                await navigator.clipboard.writeText(text);
                toast(t('calc.copied', { amount: money(roundQuote(result.mid)) }));
            } catch {
                // Clipboard access needs a secure context; say so rather than
                // failing silently.
                toast(t('calc.copyFailed'), 'error');
            }
        });
        panel.appendChild(copy);
        return panel;
    }

    function recalculate() {
        const service = selected();
        paintCoverage(service);

        if (!service) {
            resultHost.replaceChildren(emptyPanel(t('calc.needServiceTitle'), t('calc.needServiceBody')));
            return;
        }

        const result = estimate(service, area);

        if (result.ok) {
            resultHost.replaceChildren(resultPanel(service, result));
            return;
        }
        if (result.blocked) {
            resultHost.replaceChildren(blockedPanel(service, result));
            return;
        }
        // Parseable and area-driven, but no area typed yet.
        resultHost.replaceChildren(emptyPanel(t('calc.needAreaTitle'), t('calc.needAreaBody')));
    }

    function emptyPanel(title, body) {
        const panel = el('section', 'panel calc-result is-blocked');
        panel.innerHTML = `
            <p class="panel-title">${esc(t('calc.result'))}</p>
            <div class="calc-blocked">
                <div class="calc-blocked-mark">${icon('calculator')}</div>
                <div>
                    <h3>${esc(title)}</h3>
                    <p>${esc(body)}</p>
                </div>
            </div>
        `;
        return panel;
    }

    /* --- Load ----------------------------------------------------------- */

    async function load() {
        try {
            const data = await api.listServices();
            services = (data.items || []).filter(s => s.active !== false);

            // Grouped by category, in the same order as the rest of the console.
            const groups = CATEGORIES.map(cat => {
                const inGroup = services.filter(s => s.category === cat.id);
                if (!inGroup.length) return '';
                return `<optgroup label="${esc(cat.label)}">${
                    inGroup.map(s => `<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('')
                }</optgroup>`;
            }).join('');

            serviceSel.innerHTML =
                `<option value="">${esc(t('calc.choose'))}</option>${groups}`;

            recalculate();
        } catch (err) {
            resultHost.replaceChildren(el('div', 'login-error', esc(err.message)));
        }
    }

    serviceSel.addEventListener('change', recalculate);
    areaInput.addEventListener('input', e => {
        area = e.target.value.trim();
        recalculate();
    });

    load();
    return page;
}
