/* ==========================================================================
   Services & prices.

   Grouped the way the public prices page is grouped, because that is how
   they will be read. Prices are free text, not numbers: the real catalog is
   full of ranges ("30–45 €/hr") and "on estimate", and forcing them into a
   number field would lose that.
   ========================================================================== */

import { api, conn } from '../api.js';
import { icon } from '../icons.js';
import {
    el, esc, CATEGORIES, categoryLabel, emptyState, skeletonRows,
    demoBanner, openModal, confirmAction, field, readFields, toast
} from '../ui.js';
import { t } from '../i18n.js';
import { record, ACTIONS } from '../audit.js';

export function render() {
    const page = el('div');
    let services = [];

    page.innerHTML = `
        ${conn.mode === 'demo' ? demoBanner() : ''}

        <div class="view-head">
            <div>
                <h1>${esc(t('title.catalog'))}</h1>
                <p>${esc(t('cat.subtitle'))}</p>
            </div>
            <div class="view-head-actions">
                <button type="button" class="btn btn-primary" data-add>${icon('plus')} ${esc(t('cat.add'))}</button>
            </div>
        </div>

        <div class="demo-banner" style="background:var(--surface);border-left-color:var(--line-strong);color:var(--text-2)">
            ${t('cat.notice')}
        </div>

        <div data-list></div>
    `;

    const list = page.querySelector('[data-list]');
    list.replaceChildren(skeletonRows(6));

    /* --- Rendering ------------------------------------------------------ */

    function serviceRow(s) {
        const row = el('div', 'svc-row');
        row.innerHTML = `
            <div>
                <div class="svc-title">${esc(s.title)}${s.popular ? ` <span class="stamp stamp-new" style="margin-left:6px">${esc(t('cat.popularBadge'))}</span>` : ''}${s.active === false ? ` <span class="stamp stamp-cancelled" style="margin-left:6px">${esc(t('cat.hiddenBadge'))}</span>` : ''}</div>
                <div class="svc-desc">${esc(s.description)}</div>
            </div>
            <div class="svc-price">${esc(s.price)}</div>
            <div class="svc-actions">
                <button type="button" class="btn btn-icon" data-edit aria-label="${esc(t('cat.editAria', { title: s.title }))}">${icon('edit')}</button>
                <button type="button" class="btn btn-icon" data-remove aria-label="${esc(t('cat.deleteAria', { title: s.title }))}">${icon('trash')}</button>
            </div>
        `;
        row.querySelector('[data-edit]').addEventListener('click', () => editService(s));
        row.querySelector('[data-remove]').addEventListener('click', () => removeService(s));
        return row;
    }

    function paint() {
        if (!services.length) {
            list.replaceChildren(emptyState({
                iconName: 'catalog',
                title: t('cat.emptyTitle'),
                body: t('cat.emptyBody'),
                actionLabel: t('cat.add'),
                onAction: () => editService(null)
            }));
            return;
        }

        const groups = CATEGORIES.map(cat => {
            const inGroup = services.filter(s => s.category === cat.id);
            if (!inGroup.length) return null;

            const group = el('section', 'cat-group');
            group.innerHTML = `
                <div class="cat-group-head">
                    <h2>${esc(cat.label)}</h2>
                    <span class="eyebrow">${esc(t('cat.count', { n: inGroup.length }))}</span>
                </div>
            `;
            inGroup.forEach(s => group.appendChild(serviceRow(s)));
            return group;
        }).filter(Boolean);

        list.replaceChildren(...groups);
    }

    /* --- Actions -------------------------------------------------------- */

    function editService(service) {
        const isNew = !service;
        const body = el('div');
        body.append(
            field({ label: t('cat.fTitle'), name: 'title', value: service?.title || '' }),
            field({ label: t('cat.fCategory'), name: 'category', value: service?.category || 'cleaning',
                    options: CATEGORIES }),
            field({ label: t('cat.fPrice'), name: 'price', value: service?.price || '',
                    placeholder: '30–45 €/hr', hint: t('cat.priceHint') }),
            field({ label: t('cat.fDescription'), name: 'description', type: 'textarea', rows: 3,
                    value: service?.description || '',
                    placeholder: t('cat.descPlaceholder') }),
            field({ label: t('cat.fCoverage'), name: 'coverage', type: 'number',
                    value: service?.coverage ?? '', placeholder: '30',
                    hint: t('cat.coverageHint') })
        );

        const flags = el('div');
        flags.innerHTML = `
            <label class="login-remember" style="margin:var(--s4) 0 0">
                <input type="checkbox" name="popular"${service?.popular ? ' checked' : ''}>
                ${esc(t('cat.popular'))}
            </label>
            <label class="login-remember" style="margin:var(--s2) 0 0">
                <input type="checkbox" name="active"${service?.active !== false ? ' checked' : ''}>
                ${esc(t('cat.showOnSite'))}
            </label>
        `;
        body.appendChild(flags);

        openModal({
            title: isNew ? t('cat.add') : t('cat.editTitle'),
            bodyNode: body,
            confirmLabel: isNew ? t('cat.add') : t('common.save'),
            onConfirm: async (close, btn) => {
                const values = readFields(body);
                // Blank means "area does not drive this job", which is not the
                // same as zero, so it is stored as null rather than 0.
                values.coverage = values.coverage === '' ? null : Number(values.coverage);
                if (values.coverage !== null && !(values.coverage > 0)) {
                    toast(t('cat.coverageError'), 'error'); return;
                }
                if (!values.title) { toast(t('cat.needTitle'), 'error'); return; }
                if (!values.price) { toast(t('cat.needPrice'), 'error'); return; }

                btn.disabled = true;
                try {
                    const saved = isNew
                        ? await api.createService(values)
                        : await api.updateService(service.id, values);
                    record(isNew ? ACTIONS.SERVICE_CREATE : ACTIONS.SERVICE_UPDATE, {
                        target: values.title, targetId: (saved && saved.id) || service?.id
                    });
                    toast(isNew ? t('cat.added') : t('cat.saved'));
                    close();
                    load();
                } catch (err) {
                    toast(err.message, 'error');
                    btn.disabled = false;
                }
            }
        });
    }

    function removeService(service) {
        confirmAction({
            title: t('cat.deleteTitle', { title: service.title }),
            message: t('cat.deleteBody'),
            confirmLabel: t('cat.deleteConfirm'),
            onConfirm: async () => {
                await api.deleteService(service.id);
                record(ACTIONS.SERVICE_DELETE, { target: service.title, targetId: service.id });
                toast(t('cat.deleted'));
                load();
            }
        });
    }

    /* --- Load ----------------------------------------------------------- */

    async function load() {
        try {
            const data = await api.listServices();
            services = data.items || [];
            paint();
        } catch (err) {
            list.replaceChildren(el('div', 'login-error', esc(err.message)));
        }
    }

    page.querySelector('[data-add]').addEventListener('click', () => editService(null));

    load();
    return page;
}

