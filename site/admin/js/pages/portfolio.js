/* ==========================================================================
   Portfolio.

   The order in this grid is the order on the public page, so moving an item
   is a first-class action rather than something buried in an edit form.
   Before-and-after pairs only read correctly if they stay adjacent.
   ========================================================================== */

import { api, conn, uploadImage } from '../api.js';
import { icon } from '../icons.js';
import {
    el, esc, CATEGORIES, categoryLabel, emptyState, demoBanner,
    openModal, confirmAction, field, readFields, toast
} from '../ui.js';
import { t } from '../i18n.js';
import { record, ACTIONS } from '../audit.js';

export function render() {
    const page = el('div');
    let items = [];

    page.innerHTML = `
        ${conn.mode === 'demo' ? demoBanner() : ''}

        <div class="view-head">
            <div>
                <h1>${esc(t('title.portfolio'))}</h1>
                <p>${esc(t('pf.subtitle'))}</p>
            </div>
            <div class="view-head-actions">
                <button type="button" class="btn btn-primary" data-add>${icon('upload')} ${esc(t('pf.add'))}</button>
            </div>
        </div>

        <div data-grid></div>
    `;

    const grid = page.querySelector('[data-grid]');

    function shot(item, index) {
        const card = el('article', 'shot');
        card.innerHTML = `
            <div class="shot-figure">
                <span class="shot-order">${index + 1}</span>
                <img src="${esc(item.url)}" alt="${esc(item.caption)}" loading="lazy">
            </div>
            <div class="shot-body">
                <p class="shot-caption">${esc(item.caption)}</p>
                <p class="shot-file">${esc(categoryLabel(item.category))} · ${esc(shortName(item.url))}</p>
                <div class="shot-actions">
                    <button type="button" class="btn btn-icon" data-up aria-label="${esc(t('pf.moveEarlier'))}"${index === 0 ? ' disabled' : ''}>${icon('up')}</button>
                    <button type="button" class="btn btn-icon" data-down aria-label="${esc(t('pf.moveLater'))}"${index === items.length - 1 ? ' disabled' : ''}>${icon('down')}</button>
                    <button type="button" class="btn btn-icon" data-edit aria-label="${esc(t('pf.editCaption'))}">${icon('edit')}</button>
                    <button type="button" class="btn btn-icon" data-remove aria-label="${esc(t('pf.deleteImage'))}">${icon('trash')}</button>
                </div>
            </div>
        `;

        const img = card.querySelector('img');
        img.addEventListener('error', () => {
            img.remove();
            card.querySelector('.shot-figure').insertAdjacentHTML('beforeend',
                `<div class="drawer-map-fallback">${esc(t('pf.notFound'))}</div>`);
        });

        card.querySelector('[data-up]').addEventListener('click', () => move(index, -1));
        card.querySelector('[data-down]').addEventListener('click', () => move(index, 1));
        card.querySelector('[data-edit]').addEventListener('click', () => editItem(item));
        card.querySelector('[data-remove]').addEventListener('click', () => removeItem(item));
        return card;
    }

    function paint() {
        if (!items.length) {
            grid.replaceChildren(emptyState({
                iconName: 'portfolio',
                title: t('pf.emptyTitle'),
                body: t('pf.emptyBody'),
                actionLabel: t('pf.add'),
                onAction: () => addItem()
            }));
            return;
        }
        const wrap = el('div', 'grid-auto');
        items.forEach((item, i) => wrap.appendChild(shot(item, i)));
        grid.replaceChildren(wrap);
    }

    /* --- Actions -------------------------------------------------------- */

    async function move(index, delta) {
        const target = index + delta;
        if (target < 0 || target >= items.length) return;
        const reordered = [...items];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        items = reordered;
        paint();
        try {
            await api.reorderPortfolio(items.map(i => i.id));
            record(ACTIONS.PORTFOLIO_REORDER, { detail: { count: items.length } });
        } catch (err) {
            toast(err.message, 'error');
            load();
        }
    }

    function addItem() {
        const body = el('div');

        const picker = el('label', 'field');
        picker.innerHTML = `
            <span class="field-label">${esc(t('pf.fFile'))}</span>
            <input class="input" type="file" name="file" accept="image/*">
            <span class="field-hint">${esc(t('pf.fFileHint'))}</span>
        `;

        body.append(
            picker,
            field({ label: t('pf.fPath'), name: 'url',
                    placeholder: '../assets/img/portfolio/kitchen.jpg',
                    hint: t('pf.fPathHint') }),
            field({ label: t('pf.fCaption'), name: 'caption' }),
            field({ label: t('pf.fService'), name: 'category', value: 'cleaning', options: CATEGORIES })
        );

        openModal({
            title: t('pf.add'),
            bodyNode: body,
            confirmLabel: t('pf.add'),
            onConfirm: async (close, btn) => {
                const values = readFields(body);
                const file = picker.querySelector('input[type="file"]').files[0];

                if (!file && !values.url) {
                    toast(t('pf.needFile'), 'error');
                    return;
                }
                if (!values.caption) {
                    toast(t('pf.needCaption'), 'error');
                    return;
                }

                btn.disabled = true;
                btn.textContent = file ? t('pf.uploading') : t('pf.adding');
                try {
                    const url = file ? await uploadImage(file) : values.url;
                    const created = await api.createPortfolio({
                        url, caption: values.caption, category: values.category, active: true
                    });
                    record(ACTIONS.PORTFOLIO_CREATE, {
                        target: values.caption, targetId: created && created.id
                    });
                    toast(t('pf.added'));
                    close();
                    load();
                } catch (err) {
                    toast(err.message, 'error');
                    btn.disabled = false;
                    btn.textContent = t('pf.add');
                }
            }
        });
    }

    function editItem(item) {
        const body = el('div');
        body.append(
            field({ label: t('pf.fCaption'), name: 'caption', value: item.caption }),
            field({ label: t('pf.fService'), name: 'category', value: item.category, options: CATEGORIES }),
            field({ label: t('pf.fPath'), name: 'url', value: item.url })
        );

        openModal({
            title: t('pf.editTitle'),
            bodyNode: body,
            confirmLabel: t('common.save'),
            onConfirm: async (close, btn) => {
                const values = readFields(body);
                if (!values.caption) { toast(t('pf.needCaption'), 'error'); return; }
                btn.disabled = true;
                try {
                    await api.updatePortfolio(item.id, values);
                    record(ACTIONS.PORTFOLIO_UPDATE, { target: values.caption, targetId: item.id });
                    toast(t('pf.saved'));
                    close();
                    load();
                } catch (err) {
                    toast(err.message, 'error');
                    btn.disabled = false;
                }
            }
        });
    }

    function removeItem(item) {
        confirmAction({
            title: t('pf.deleteTitle'),
            message: t('pf.deleteBody', { caption: item.caption }),
            confirmLabel: t('pf.deleteImage'),
            onConfirm: async () => {
                await api.deletePortfolio(item.id);
                record(ACTIONS.PORTFOLIO_DELETE, { target: item.caption, targetId: item.id });
                toast(t('pf.deleted'));
                load();
            }
        });
    }

    /* --- Load ----------------------------------------------------------- */

    async function load() {
        try {
            const data = await api.listPortfolio();
            items = data.items || [];
            paint();
        } catch (err) {
            grid.replaceChildren(el('div', 'login-error', esc(err.message)));
        }
    }

    page.querySelector('[data-add]').addEventListener('click', addItem);

    load();
    return page;
}

function shortName(url) {
    return String(url || '').split('/').pop().split('?')[0].slice(0, 40) || 'image';
}
