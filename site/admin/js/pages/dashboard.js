/* ==========================================================================
   Today: what needs doing.

   Deliberately not a metrics screen. The counts are a hairline tally, and
   the page proper is the work itself: the requests nobody has called yet,
   then the jobs booked for today. Anything further back lives in Requests.
   ========================================================================== */

import { api, conn } from '../api.js';
import { requestLedger } from '../ledger.js';
import { navigate } from '../router.js';
import {
    el, esc, money, emptyState, skeletonRows, demoBanner,
    categoryLabel, formatDate, todayISO
} from '../ui.js';
import { t } from '../i18n.js';

export function render() {
    const page = el('div');

    page.innerHTML = `
        ${conn.mode === 'demo' ? demoBanner() : ''}

        <div class="view-head">
            <div>
                <h1>${esc(t('title.today'))}</h1>
                <p>${esc(formatDate(todayISO()))}</p>
            </div>
        </div>

        <div class="stack-lg">
            <div data-tally></div>

            <section>
                <div class="section-head">
                    <h2>${esc(t('dash.waiting'))}</h2>
                    <a class="section-link" href="#/requests">${esc(t('dash.allRequests'))}</a>
                </div>
                <div data-new></div>
            </section>

            <section>
                <div class="section-head">
                    <h2>${esc(t('dash.booked'))}</h2>
                </div>
                <div data-today></div>
            </section>

            <section>
                <div class="section-head">
                    <h2>${esc(t('dash.byService'))}</h2>
                </div>
                <div data-mix></div>
            </section>
        </div>
    `;

    const tallyHost = page.querySelector('[data-tally]');
    const newHost   = page.querySelector('[data-new]');
    const todayHost = page.querySelector('[data-today]');
    const mixHost   = page.querySelector('[data-mix]');

    newHost.replaceChildren(skeletonRows(3));
    todayHost.replaceChildren(skeletonRows(2));

    function openRequest(id) {
        navigate(`/requests/${id}`);
    }

    function tally(stats) {
        const quoted = money(stats.quotedTotal) || '€0';
        const cells = [
            { value: stats.newToday, label: t('tally.newToday'), accent: stats.newToday > 0 },
            { value: stats.openCount, label: t('tally.openNow') },
            { value: stats.scheduledToday, label: t('tally.bookedToday') },
            { value: quoted, label: t('tally.quoted') },
            { value: stats.newThisWeek, label: t('tally.newWeek') }
        ];
        return el('div', 'tally', cells.map(c => `
            <div class="tally-cell${c.accent ? ' is-accent' : ''}">
                <span class="tally-value">${esc(c.value)}</span>
                <span class="tally-label">${esc(c.label)}</span>
            </div>
        `).join(''));
    }

    /* A second tally rather than a chart: four categories is not a data set
       that needs plotting, and the numbers are the point. */
    function mix(stats) {
        const byCategory = stats.byCategory || {};
        const total = Object.values(byCategory).reduce((a, b) => a + b, 0) || 1;
        const cells = ['cleaning', 'furniture', 'restoration', 'relocation'].map(id => {
            const count = byCategory[id] || 0;
            const share = Math.round(count / total * 100);
            // The share goes on the label line. Sitting next to the count it
            // read as a single number: 5 and 42% rendered as "542%".
            return `
                <div class="tally-cell">
                    <span class="tally-value">${count}</span>
                    <span class="tally-label">${esc(categoryLabel(id))} · ${share}%</span>
                </div>
            `;
        });
        return el('div', 'tally', cells.join(''));
    }

    async function load() {
        try {
            const [stats, newOnes, todayJobs] = await Promise.all([
                api.stats(),
                api.listRequests({ status: 'new', pageSize: 8 }),
                api.listRequests({ status: 'scheduled', pageSize: 20 })
            ]);

            tallyHost.replaceChildren(tally(stats));
            mixHost.replaceChildren(mix(stats));

            newHost.replaceChildren((newOnes.items || []).length
                ? requestLedger(newOnes.items, openRequest)
                : emptyState({
                    iconName: 'check',
                    title: t('dash.calledTitle'),
                    body: t('dash.calledBody')
                }));

            const today = todayISO();
            const booked = (todayJobs.items || []).filter(r => r.preferredDate === today);

            todayHost.replaceChildren(booked.length
                ? requestLedger(booked, openRequest)
                : emptyState({
                    iconName: 'pin',
                    title: t('dash.noneBookedTitle'),
                    body: t('dash.noneBookedBody')
                }));
        } catch (err) {
            tallyHost.replaceChildren(el('div', 'login-error', esc(err.message)));
            newHost.replaceChildren();
            todayHost.replaceChildren();
        }
    }

    load();
    return page;
}
