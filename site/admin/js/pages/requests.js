/* ==========================================================================
   Requests: the inbox.

   Filters narrow the ledger; a row opens the drawer. The open request is
   part of the URL (#/requests/142), so a job can be linked to and a reload
   lands back on it.
   ========================================================================== */

import { api, conn } from '../api.js';
import { requestLedger } from '../ledger.js';
import { openRequestDrawer } from '../requestDrawer.js';
import { replaceHash } from '../router.js';
import { icon } from '../icons.js';
import {
    el, esc, STATUSES, CATEGORIES, emptyState, skeletonRows, debounce, toast, demoBanner
} from '../ui.js';
import { t } from '../i18n.js';

export function render(params) {
    const page = el('div');
    let drawer = null;
    let openId = params && params.id ? Number(params.id) : null;
    let items = [];

    const filters = { q: '', status: 'all', category: 'all', from: '', to: '' };

    page.innerHTML = `
        ${conn.mode === 'demo' ? demoBanner() : ''}

        <div class="view-head">
            <div>
                <h1>${esc(t('title.requests'))}</h1>
                <p>${esc(t('req.subtitle'))}</p>
            </div>
            <div class="view-head-actions">
                <button type="button" class="btn btn-ghost" data-refresh>${icon('refresh')} ${esc(t('req.refresh'))}</button>
            </div>
        </div>

        <div class="filters">
            <div class="search-field">
                <span class="search-icon">${icon('search')}</span>
                <input class="input" type="search" name="q" placeholder="${esc(t('req.search'))}"
                       aria-label="${esc(t('req.searchAria'))}">
            </div>

            <select class="select select-sm" name="status" aria-label="${esc(t('req.filterStatus'))}">
                <option value="all">${esc(t('req.anyStatus'))}</option>
                ${STATUSES.map(s => `<option value="${esc(s.id)}">${esc(s.label)}</option>`).join('')}
            </select>

            <select class="select select-sm" name="category" aria-label="${esc(t('req.filterService'))}">
                <option value="all">${esc(t('req.anyService'))}</option>
                ${CATEGORIES.map(c => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('')}
            </select>

            <input class="input select-sm" type="date" name="from" aria-label="${esc(t('req.from'))}" style="width:auto">
            <input class="input select-sm" type="date" name="to" aria-label="${esc(t('req.to'))}" style="width:auto">

            <button type="button" class="filter-clear" data-clear hidden>${esc(t('req.clear'))}</button>
            <span class="result-count" data-count></span>
        </div>

        <div data-results></div>
    `;

    const results = page.querySelector('[data-results]');
    const countEl = page.querySelector('[data-count]');
    const clearBtn = page.querySelector('[data-clear]');

    function anyFilterSet() {
        return filters.q !== '' || filters.status !== 'all'
            || filters.category !== 'all' || filters.from !== '' || filters.to !== '';
    }

    async function load() {
        results.replaceChildren(skeletonRows(6));
        try {
            const data = await api.listRequests(filters);
            items = data.items || [];
            countEl.textContent = t('req.count', { n: data.total });
            clearBtn.hidden = !anyFilterSet();

            if (!items.length) {
                results.replaceChildren(anyFilterSet()
                    ? emptyState({
                        iconName: 'search',
                        title: t('req.noMatchTitle'),
                        body: t('req.noMatchBody'),
                        actionLabel: t('req.clear'),
                        onAction: clearFilters
                    })
                    : emptyState({
                        iconName: 'inbox',
                        title: t('req.emptyTitle'),
                        body: t('req.emptyBody')
                    }));
                return;
            }

            results.replaceChildren(requestLedger(items, open, openId));
        } catch (err) {
            results.replaceChildren(el('div', 'login-error', esc(err.message)));
        }
    }

    function clearFilters() {
        filters.q = '';
        filters.status = 'all';
        filters.category = 'all';
        filters.from = '';
        filters.to = '';
        page.querySelector('[name="q"]').value = '';
        page.querySelector('[name="status"]').value = 'all';
        page.querySelector('[name="category"]').value = 'all';
        page.querySelector('[name="from"]').value = '';
        page.querySelector('[name="to"]').value = '';
        load();
    }

    function open(id) {
        if (drawer) drawer.close();
        openId = Number(id);
        replaceHash(`/requests/${id}`);
        markOpenRow();

        drawer = openRequestDrawer(id, {
            onChange: () => {
                window.dispatchEvent(new CustomEvent('admin:data-changed'));
                load();
            },
            onClose: () => {
                drawer = null;
                openId = null;
                replaceHash('/requests');
                markOpenRow();
            }
        });
    }

    function markOpenRow() {
        page.querySelectorAll('.ledger tbody tr').forEach((tr, i) => {
            tr.classList.toggle('is-open', items[i] && Number(items[i].id) === openId);
        });
    }

    /* --- Wiring --------------------------------------------------------- */

    const runSearch = debounce(() => load());

    page.querySelector('[name="q"]').addEventListener('input', e => {
        filters.q = e.target.value.trim();
        runSearch();
    });

    ['status', 'category', 'from', 'to'].forEach(name => {
        page.querySelector(`[name="${name}"]`).addEventListener('change', e => {
            filters[name] = e.target.value;
            load();
        });
    });

    clearBtn.addEventListener('click', clearFilters);
    page.querySelector('[data-refresh]').addEventListener('click', () => {
        load();
        toast(t('req.refreshed'));
    });

    /* Deep links and in-section navigation. */
    page.onParams = next => {
        const id = next && next.id ? Number(next.id) : null;
        if (id && id !== openId) open(id);
        if (!id && drawer) drawer.close();
    };

    page.destroy = () => { if (drawer) drawer.close(); };

    load().then(() => { if (openId) open(openId); });

    return page;
}



