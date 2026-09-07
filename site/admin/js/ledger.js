/* ==========================================================================
   The request ledger.

   One ruled table, shared by Today and Requests, so a request looks identical
   wherever it is read. Rows behave as buttons: clicking one, or pressing
   Enter on it, opens the request.
   ========================================================================== */

import { el, esc, stamp, catTag, money, refNumber, relative, formatDate, slotLabel } from './ui.js';
import { t } from './i18n.js';

const COLUMNS = () => [
    t('col.ref'), t('col.status'), t('col.client'),
    t('col.service'), t('col.address'), t('col.wanted'), t('col.quote')
];

function rowHtml(r) {
    const quote = money(r.quotedPrice);
    const wanted = r.preferredDate
        ? `<div class="cell-stack"><span>${esc(formatDate(r.preferredDate))}</span><small>${esc(slotLabel(r.preferredTime))}</small></div>`
        : `<span style="color:var(--text-3)">${esc(t('ledger.notSet'))}</span>`;

    return `
        <td class="cell-id" data-label="${esc(t('col.ref'))}">
            <div class="cell-stack">
                <span>${esc(refNumber(r.id))}</span>
                <small>${esc(relative(r.createdAt))}</small>
            </div>
        </td>
        <td data-label="${esc(t('col.status'))}">${stamp(r.status)}</td>
        <td data-label="${esc(t('col.client'))}">
            <div class="cell-stack">
                <span class="cell-name">${esc(r.name)}</span>
                <span class="cell-phone">${esc(r.phone)}</span>
            </div>
        </td>
        <td data-label="${esc(t('col.service'))}">${catTag(r.serviceType)}</td>
        <td class="cell-addr" data-label="${esc(t('col.address'))}" title="${esc(r.address)}">${esc(r.address)}</td>
        <td class="cell-when" data-label="${esc(t('col.wanted'))}">${wanted}</td>
        <td class="cell-price${quote ? '' : ' is-unset'}" data-label="${esc(t('col.quote'))}">${quote ? esc(quote) : '—'}</td>
    `;
}

/**
 * @param {Array} items
 * @param {(id:number)=>void} onOpen
 * @param {number|null} openId  the request currently shown in the drawer
 */
export function requestLedger(items, onOpen, openId = null) {
    const wrap = el('div', 'ledger-wrap');
    const scroll = el('div', 'ledger-scroll');
    const table = el('table', 'ledger');
    const columns = COLUMNS();

    table.innerHTML = `
        <thead><tr>${columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    items.forEach(r => {
        const tr = el('tr');
        tr.innerHTML = rowHtml(r);
        tr.tabIndex = 0;
        tr.setAttribute('role', 'button');
        tr.setAttribute('aria-label', t('ledger.open', { ref: refNumber(r.id), name: r.name }));
        if (Number(openId) === Number(r.id)) tr.classList.add('is-open');

        tr.addEventListener('click', () => onOpen(r.id));
        tr.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(r.id);
            }
        });

        tbody.appendChild(tr);
    });

    scroll.appendChild(table);
    wrap.appendChild(scroll);
    return wrap;
}
