/* ==========================================================================
   Logs: what was done in this console, when, and by whom.

   Same ruled ledger as Requests, because it is the same kind of reading:
   scanning down a column looking for the one line that matters.

   The name against each line is self-declared. That is stated on the page
   rather than left for the operator to assume otherwise.
   ========================================================================== */

import { conn } from '../api.js';
import { listLogs, ACTION_GROUPS, operatorName } from '../audit.js';
import { navigate } from '../router.js';
import { icon } from '../icons.js';
import {
    el, esc, money, formatDateTime, relative, statusMeta,
    emptyState, skeletonRows, demoBanner, debounce
} from '../ui.js';
import { t } from '../i18n.js';

/** Renders one entry into a sentence, in the language selected now. */
export function describe(entry) {
    const d = entry.detail || {};
    const vars = {
        target: entry.target || '',
        from: d.from ? statusMeta(d.from).label : '',
        to: d.to ? statusMeta(d.to).label : '',
        amount: d.amount !== undefined && d.amount !== null ? money(d.amount) : '',
        count: d.count ?? ''
    };
    return t(`log.a.${entry.action}`, vars);
}

export function render() {
    const page = el('div');
    let entries = [];
    const filters = { q: '', user: 'all', group: 'all', from: '', to: '' };

    page.innerHTML = `
        ${conn.mode === 'demo' ? demoBanner() : ''}

        <div class="view-head">
            <div>
                <h1>${esc(t('title.logs'))}</h1>
                <p>${esc(t('log.subtitle'))}</p>
            </div>
            <div class="view-head-actions">
                <button type="button" class="btn btn-ghost" data-refresh>${icon('refresh')} ${esc(t('req.refresh'))}</button>
            </div>
        </div>

        <div data-notice></div>

        <div class="filters">
            <div class="search-field">
                <span class="search-icon">${icon('search')}</span>
                <input class="input" type="search" name="q" placeholder="${esc(t('log.search'))}"
                       aria-label="${esc(t('log.search'))}">
            </div>

            <select class="select select-sm" name="user" aria-label="${esc(t('log.filterUser'))}">
                <option value="all">${esc(t('log.anyUser'))}</option>
            </select>

            <select class="select select-sm" name="group" aria-label="${esc(t('log.filterAction'))}">
                <option value="all">${esc(t('log.anyAction'))}</option>
                ${Object.keys(ACTION_GROUPS).map(g =>
                    `<option value="${esc(g)}">${esc(t('log.group.' + g))}</option>`).join('')}
            </select>

            <input class="input select-sm" type="date" name="from" aria-label="${esc(t('req.from'))}" style="width:auto">
            <input class="input select-sm" type="date" name="to" aria-label="${esc(t('req.to'))}" style="width:auto">

            <button type="button" class="filter-clear" data-clear hidden>${esc(t('req.clear'))}</button>
            <span class="result-count" data-count></span>
        </div>

        <div data-results></div>

        <p class="field-hint" style="margin-top:var(--s4);max-width:70ch">${esc(t('log.trustNote'))}</p>
    `;

    const results  = page.querySelector('[data-results]');
    const countEl  = page.querySelector('[data-count]');
    const clearBtn = page.querySelector('[data-clear]');
    const userSel  = page.querySelector('[name="user"]');
    const noticeEl = page.querySelector('[data-notice]');

    /* Without a name every line reads "Unknown", which makes the whole page
       useless. Say so once, at the top, with the fix one click away. */
    function paintNotice() {
        if (operatorName()) { noticeEl.replaceChildren(); return; }
        const box = el('div', 'demo-banner');
        box.innerHTML = `<strong>${esc(t('log.noNameTitle'))}</strong> ${esc(t('log.noNameBody'))}`;
        const go = el('button', 'btn btn-ghost btn-sm', esc(t('log.setName')));
        go.type = 'button';
        go.style.marginTop = 'var(--s3)';
        go.addEventListener('click', () => navigate('/settings'));
        box.appendChild(go);
        noticeEl.replaceChildren(box);
    }

    function anyFilterSet() {
        return filters.q !== '' || filters.user !== 'all' || filters.group !== 'all'
            || filters.from !== '' || filters.to !== '';
    }

    function table(items) {
        const wrap = el('div', 'ledger-wrap');
        const scroll = el('div', 'ledger-scroll');
        const tbl = el('table', 'ledger log-ledger');
        tbl.innerHTML = `
            <thead><tr>
                <th scope="col">${esc(t('log.colWhen'))}</th>
                <th scope="col">${esc(t('log.colWho'))}</th>
                <th scope="col">${esc(t('log.colAction'))}</th>
            </tr></thead>
            <tbody></tbody>
        `;
        const body = tbl.querySelector('tbody');

        items.forEach(entry => {
            const tr = el('tr');
            const linkable = entry.action.startsWith('request.') && entry.targetId
                && entry.action !== 'request.delete';
            tr.innerHTML = `
                <td class="cell-when" data-label="${esc(t('log.colWhen'))}">
                    <div class="cell-stack">
                        <span>${esc(formatDateTime(entry.at))}</span>
                        <small>${esc(relative(entry.at))}</small>
                    </div>
                </td>
                <td data-label="${esc(t('log.colWho'))}">
                    <span class="log-user">${esc(entry.user || t('log.unknownUser'))}</span>
                </td>
                <td data-label="${esc(t('log.colAction'))}">
                    <span class="log-what">${esc(describe(entry))}</span>
                </td>
            `;
            if (linkable) {
                tr.classList.add('is-linkable');
                tr.tabIndex = 0;
                tr.setAttribute('role', 'button');
                const open = () => navigate(`/requests/${entry.targetId}`);
                tr.addEventListener('click', open);
                tr.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
                });
            }
            body.appendChild(tr);
        });

        scroll.appendChild(tbl);
        wrap.appendChild(scroll);
        return wrap;
    }

    function fillUsers(all) {
        const names = [...new Set(all.map(e => e.user).filter(Boolean))].sort();
        const keep = userSel.value;
        userSel.innerHTML = `<option value="all">${esc(t('log.anyUser'))}</option>`
            + names.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
        if ([...userSel.options].some(o => o.value === keep)) userSel.value = keep;
    }

    async function load() {
        results.replaceChildren(skeletonRows(6));
        paintNotice();
        try {
            const data = await listLogs(filters);
            entries = data.items || [];
            countEl.textContent = t('log.count', { n: data.total ?? entries.length });
            clearBtn.hidden = !anyFilterSet();
            if (data.users) fillUsers(data.users.map(u => ({ user: u })));

            results.replaceChildren(entries.length
                ? table(entries)
                : emptyState({
                    iconName: 'logs',
                    title: anyFilterSet() ? t('log.noMatchTitle') : t('log.emptyTitle'),
                    body: anyFilterSet() ? t('log.noMatchBody') : t('log.emptyBody'),
                    actionLabel: anyFilterSet() ? t('req.clear') : null,
                    onAction: anyFilterSet() ? clearFilters : null
                }));
        } catch (err) {
            results.replaceChildren(el('div', 'login-error', esc(err.message)));
        }
    }

    function clearFilters() {
        Object.assign(filters, { q: '', user: 'all', group: 'all', from: '', to: '' });
        page.querySelector('[name="q"]').value = '';
        userSel.value = 'all';
        page.querySelector('[name="group"]').value = 'all';
        page.querySelector('[name="from"]').value = '';
        page.querySelector('[name="to"]').value = '';
        load();
    }

    const runSearch = debounce(() => load());
    page.querySelector('[name="q"]').addEventListener('input', e => {
        filters.q = e.target.value.trim();
        runSearch();
    });
    ['user', 'group', 'from', 'to'].forEach(name => {
        page.querySelector(`[name="${name}"]`).addEventListener('change', e => {
            filters[name] = e.target.value;
            load();
        });
    });
    clearBtn.addEventListener('click', clearFilters);
    page.querySelector('[data-refresh]').addEventListener('click', load);

    load();
    return page;
}
