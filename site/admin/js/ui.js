/* ==========================================================================
   Shared vocabulary and UI primitives.

   Everything the pages agree on lives here: the pipeline stages, the service
   categories, the formatters, and the small building blocks (toast, modal,
   empty state, stamp). Pages import; they never redefine.
   ========================================================================== */

import { icon } from './icons.js';
import { t, locale } from './i18n.js';

/* --------------------------------------------------------------------------
   Vocabulary
   The pipeline is ordered. Index position is what "reached" means on the
   pipeline rail, so the order of this array is load-bearing.
   -------------------------------------------------------------------------- */
export const STATUSES = [
    { id: 'new',       label: t('status.new'),       color: 'var(--st-new)',       bg: 'var(--st-new-bg)' },
    { id: 'contacted', label: t('status.contacted'), color: 'var(--st-contacted)', bg: 'var(--st-contacted-bg)' },
    { id: 'scheduled', label: t('status.scheduled'), color: 'var(--st-scheduled)', bg: 'var(--st-scheduled-bg)' },
    { id: 'done',      label: t('status.done'),      color: 'var(--st-done)',      bg: 'var(--st-done-bg)' },
    { id: 'cancelled', label: t('status.cancelled'), color: 'var(--st-cancelled)', bg: 'var(--st-cancelled-bg)' }
];

export const STATUS_IDS = STATUSES.map(s => s.id);

export function statusMeta(id) {
    return STATUSES.find(s => s.id === id) || STATUSES[0];
}

export const CATEGORIES = [
    { id: 'cleaning',    label: t('cat.cleaning') },
    { id: 'furniture',   label: t('cat.furniture') },
    { id: 'restoration', label: t('cat.restoration') },
    { id: 'relocation',  label: t('cat.relocation') }
];

export function categoryLabel(id) {
    const c = CATEGORIES.find(x => x.id === id);
    return c ? c.label : id || t('cat.uncategorised');
}

/* The public order form offers three windows, not clock times. */
export const TIME_SLOTS = {
    morning: '08:00–12:00',
    day:     '12:00–16:00',
    evening: '16:00–20:00'
};

export function slotLabel(id) {
    return TIME_SLOTS[id] || '';
}

/* --------------------------------------------------------------------------
   Escaping and DOM
   -------------------------------------------------------------------------- */

/** Everything that reaches innerHTML from data goes through this first. */
export function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
}

/* --------------------------------------------------------------------------
   Formatters
   -------------------------------------------------------------------------- */

export function money(value) {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return n.toLocaleString(locale(), {
        style: 'currency', currency: 'EUR',
        minimumFractionDigits: 0, maximumFractionDigits: 0
    });
}

export function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString(locale(), { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(locale(), {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
}

/** "4h ago" or "yesterday": how an operator actually thinks about an inbox. */
export function relative(iso) {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const mins = Math.round((Date.now() - then) / 60000);
    if (mins < 1) return t('time.justNow');
    if (mins < 60) return t('time.minutes', { n: mins });
    const hours = Math.round(mins / 60);
    if (hours < 24) return t('time.hours', { n: hours });
    const days = Math.round(hours / 24);
    if (days === 1) return t('time.yesterday');
    if (days < 30) return t('time.days', { n: days });
    return formatDate(iso);
}

/** Requests are shown as #0142, not as a raw database id. */
export function refNumber(id) {
    const n = Number(id);
    return Number.isFinite(n) ? `#${String(n).padStart(4, '0')}` : `#${esc(id)}`;
}

export function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

/* --------------------------------------------------------------------------
   Small components
   -------------------------------------------------------------------------- */

export function stamp(statusId) {
    const s = statusMeta(statusId);
    return `<span class="stamp stamp-${esc(s.id)}">${esc(s.label)}</span>`;
}

export function catTag(categoryId) {
    return `<span class="cat-tag cat-${esc(categoryId)}">${esc(categoryLabel(categoryId))}</span>`;
}

/**
 * Shown on every page while the API is unreachable. The console never
 * displays seeded data without saying that is what it is.
 */
export function demoBanner() {
    return `
        <div class="demo-banner">
            <strong>${esc(t('demo.title'))}</strong> ${esc(t('demo.body'))}
        </div>
    `;
}

export function emptyState({ iconName = 'inbox', title, body, actionLabel, onAction }) {
    const node = el('div', 'empty');
    node.innerHTML = `
        <div class="empty-mark">${icon(iconName)}</div>
        <h3>${esc(title)}</h3>
        <p>${esc(body)}</p>
    `;
    if (actionLabel && onAction) {
        const btn = el('button', 'btn btn-ghost', esc(actionLabel));
        btn.type = 'button';
        btn.addEventListener('click', onAction);
        node.appendChild(btn);
    }
    return node;
}

export function skeletonRows(count = 5) {
    const wrap = el('div', 'ledger-wrap');
    for (let i = 0; i < count; i++) {
        wrap.appendChild(el('div', 'skeleton-row', `
            <div class="skeleton" style="width:28%"></div>
            <div class="skeleton" style="width:62%"></div>
        `));
    }
    return wrap;
}

let toastTimer = 0;

export function toast(message, kind = 'ok') {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const node = el('div', `toast${kind === 'error' ? ' is-error' : ''}`, esc(message));
    stack.appendChild(node);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => node.remove(), 3600);
}

/**
 * A modal that owns its own focus and teardown. Returns a close() the caller
 * can use; Escape and a backdrop click also close it.
 */
export function openModal({ title, bodyNode, confirmLabel, onConfirm, danger }) {
    const previousFocus = document.activeElement;
    const scrim = el('div', 'modal-scrim');
    const modal = el('div', 'modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', title);

    modal.appendChild(el('h2', null, esc(title)));
    modal.appendChild(bodyNode);

    const actions = el('div', 'modal-actions');
    const cancel = el('button', 'btn btn-quiet', esc(t('common.cancel')));
    cancel.type = 'button';
    const confirm = el('button', `btn ${danger ? 'btn-danger' : 'btn-primary'}`, esc(confirmLabel || t('common.save')));
    confirm.type = 'button';
    actions.append(cancel, confirm);
    modal.appendChild(actions);
    scrim.appendChild(modal);

    function close() {
        document.removeEventListener('keydown', onKey);
        scrim.remove();
        if (previousFocus && previousFocus.focus) previousFocus.focus();
    }
    function onKey(e) {
        if (e.key === 'Escape') { e.stopPropagation(); close(); }
    }

    cancel.addEventListener('click', close);
    scrim.addEventListener('mousedown', e => { if (e.target === scrim) close(); });
    confirm.addEventListener('click', () => onConfirm(close, confirm));
    document.addEventListener('keydown', onKey);

    document.body.appendChild(scrim);
    const firstField = modal.querySelector('input, select, textarea');
    (firstField || confirm).focus();

    return close;
}

export function confirmAction({ title, message, confirmLabel, onConfirm }) {
    return openModal({
        title,
        bodyNode: el('p', 'login-help', esc(message)),
        confirmLabel,
        danger: true,
        onConfirm: async (close, btn) => {
            btn.disabled = true;
            try {
                await onConfirm();
                close();
            } catch (err) {
                toast(err.message, 'error');
            } finally {
                btn.disabled = false;
            }
        }
    });
}

export function field({ label, name, type = 'text', value = '', placeholder = '', hint, options, rows }) {
    const wrap = el('label', 'field');
    const id = `f-${name}-${Math.random().toString(36).slice(2, 7)}`;
    let control;

    if (options) {
        control = `<select class="select" id="${id}" name="${esc(name)}">${
            options.map(o => `<option value="${esc(o.id)}"${o.id === value ? ' selected' : ''}>${esc(o.label)}</option>`).join('')
        }</select>`;
    } else if (type === 'textarea') {
        control = `<textarea class="textarea" id="${id}" name="${esc(name)}" rows="${rows || 3}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`;
    } else {
        control = `<input class="input" id="${id}" name="${esc(name)}" type="${esc(type)}" value="${esc(value)}" placeholder="${esc(placeholder)}">`;
    }

    wrap.innerHTML = `
        <span class="field-label">${esc(label)}</span>
        ${control}
        ${hint ? `<span class="field-hint">${esc(hint)}</span>` : ''}
    `;
    wrap.setAttribute('for', id);
    return wrap;
}

/** Reads a container's inputs into a plain object keyed by name. */
export function readFields(container) {
    const out = {};
    container.querySelectorAll('[name]').forEach(input => {
        out[input.name] = input.type === 'checkbox' ? input.checked : input.value.trim();
    });
    return out;
}

export function debounce(fn, wait = 220) {
    let timer = 0;
    return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), wait);
    };
}
