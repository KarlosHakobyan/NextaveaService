/* ==========================================================================
   Request drawer: one job, everything about it, and the actions on it.

   The pipeline rail at the top is the main control: five stages, click one
   to move the job there. It is the same device that renders as a stamp in
   the ledger, so status reads the same way whether you are scanning or
   working.

   The map is read-only here. Where the pin sits was the client's decision on
   the public form; this view exists to tell the operator where to go.
   ========================================================================== */

import { api } from './api.js';
import {
    el, esc, STATUSES, statusMeta, categoryLabel, money, refNumber,
    formatDate, formatDateTime, relative, slotLabel, toast, confirmAction
} from './ui.js';
import { icon } from './icons.js';
import { t } from './i18n.js';
import { record, ACTIONS } from './audit.js';

const LEAFLET_CSS = '../assets/vendor/leaflet/leaflet.css';
const LEAFLET_JS  = '../assets/vendor/leaflet/leaflet.js';

let leafletPromise = null;

function loadLeaflet() {
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
        if (window.L) { resolve(window.L); return; }

        if (!document.querySelector('link[data-leaflet-admin]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = LEAFLET_CSS;
            link.setAttribute('data-leaflet-admin', '');
            document.head.appendChild(link);
        }

        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.onload = () => resolve(window.L);
        script.onerror = () => reject(new Error('Leaflet failed to load'));
        document.head.appendChild(script);
    });
    return leafletPromise;
}

/* -------------------------------------------------------------------------- */

function pipelineHtml(current) {
    const currentIndex = STATUSES.findIndex(s => s.id === current);
    return `
        <div class="pipeline" role="group" aria-label="${esc(t('drw.statusGroup'))}">
            ${STATUSES.map((s, i) => {
                const isCurrent = s.id === current;
                // "Cancelled" sits outside the forward run: it is never
                // "reached" on the way to done, only landed on.
                const isReached = s.id !== 'cancelled' && current !== 'cancelled' && i <= currentIndex;
                const classes = ['pipe-step'];
                if (isReached) classes.push('is-reached');
                if (isCurrent) classes.push('is-current');
                return `
                    <button type="button" class="${classes.join(' ')}"
                            data-status="${esc(s.id)}"
                            style="--stage-color:${s.color};--stage-bg:${s.bg}"
                            aria-pressed="${isCurrent}">
                        ${esc(s.label)}
                    </button>
                `;
            }).join('')}
        </div>
    `;
}

function detailsHtml(r) {
    const wanted = r.preferredDate
        ? `${esc(formatDate(r.preferredDate))} · ${esc(slotLabel(r.preferredTime) || '—')}`
        : t('drw.notSpecified');

    return `
        <dl class="dl">
            <dt>${esc(t('drw.phone'))}</dt>
            <dd><a class="section-link" href="tel:${esc(String(r.phone).replace(/\s/g, ''))}">${esc(r.phone)}</a></dd>

            <dt>${esc(t('drw.service'))}</dt>
            <dd>${esc(categoryLabel(r.serviceType))}</dd>

            <dt>${esc(t('drw.address'))}</dt>
            <dd>${esc(r.address) || `<span class="is-empty">${esc(t('drw.notGiven'))}</span>`}</dd>

            <dt>${esc(t('drw.wanted'))}</dt>
            <dd>${wanted}</dd>

            <dt>${esc(t('drw.received'))}</dt>
            <dd>${esc(formatDateTime(r.createdAt))} <span style="color:var(--text-3)">· ${esc(relative(r.createdAt))}</span></dd>

            <dt>${esc(t('drw.details'))}</dt>
            <dd>${r.message ? esc(r.message) : `<span class="is-empty">${esc(t('drw.nothingAdded'))}</span>`}</dd>
        </dl>
    `;
}

function notesHtml(notes) {
    if (!notes || !notes.length) {
        return `<p class="field-hint" style="margin:0">${esc(t('drw.noNotes'))}</p>`;
    }
    return `
        <ul class="note-list">
            ${notes.map(n => `
                <li>
                    <div class="note-meta">${esc(n.author || t('drw.operator'))} · ${esc(formatDateTime(n.createdAt))}</div>
                    <div class="note-body">${esc(n.text)}</div>
                </li>
            `).join('')}
        </ul>
    `;
}

/* -------------------------------------------------------------------------- */

/**
 * Opens the drawer for one request.
 * @param {number} id
 * @param {{ onChange:Function, onClose:Function }} handlers
 * @returns {{ close:Function }}
 */
export function openRequestDrawer(id, { onChange, onClose } = {}) {
    const previousFocus = document.activeElement;
    let map = null;
    let closed = false;

    const scrim = el('div', 'drawer-scrim');
    const drawer = el('aside', 'drawer');
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', `Request ${refNumber(id)}`);

    drawer.innerHTML = `
        <div class="drawer-head">
            <div>
                <p class="eyebrow">${esc(t('drw.loading'))}</p>
                <h2>${esc(refNumber(id))}</h2>
            </div>
            <button type="button" class="btn btn-icon drawer-close" aria-label="${esc(t('drw.close'))}">${icon('close')}</button>
        </div>
        <div class="drawer-body">
            <div class="skeleton" style="width:100%;height:52px"></div>
            <div class="skeleton" style="width:70%"></div>
            <div class="skeleton" style="width:90%"></div>
        </div>
    `;

    function close() {
        if (closed) return;
        closed = true;
        document.removeEventListener('keydown', onKey);
        if (map) { map.remove(); map = null; }
        scrim.remove();
        drawer.remove();
        if (previousFocus && previousFocus.focus) previousFocus.focus();
        if (onClose) onClose();
    }

    function onKey(e) {
        if (e.key === 'Escape') close();
    }

    scrim.addEventListener('click', close);
    drawer.querySelector('.drawer-close').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.append(scrim, drawer);
    drawer.querySelector('.drawer-close').focus();

    /* ---------------------------------------------------------------------- */

    async function load() {
        let request;
        try {
            request = await api.getRequest(id);
        } catch (err) {
            drawer.querySelector('.drawer-body').innerHTML =
                `<div class="login-error">${esc(err.message)}</div>`;
            return;
        }
        if (closed) return;
        paint(request);
    }

    function paint(r) {
        const quote = money(r.quotedPrice);
        const status = statusMeta(r.status);

        drawer.innerHTML = `
            <div class="drawer-head">
                <div>
                    <p class="eyebrow">${esc(refNumber(r.id))} · ${esc(status.label)}</p>
                    <h2>${esc(r.name)}</h2>
                </div>
                <button type="button" class="btn btn-icon drawer-close" aria-label="${esc(t('drw.close'))}">${icon('close')}</button>
            </div>

            <div class="drawer-body">
                <div>
                    <p class="panel-title" style="margin-bottom:var(--s3)">${esc(t('drw.status'))}</p>
                    ${pipelineHtml(r.status)}
                </div>

                <div class="panel">
                    <p class="panel-title">${esc(t('drw.request'))}</p>
                    ${detailsHtml(r)}
                </div>

                <div class="panel">
                    <p class="panel-title">${esc(t('drw.location'))}</p>
                    <div class="drawer-map" data-map></div>
                    ${(r.lat && r.lng)
                        ? `<p class="coords">${Number(r.lat).toFixed(5)}, ${Number(r.lng).toFixed(5)}
                             · <a class="section-link" target="_blank" rel="noopener"
                                  href="https://www.openstreetmap.org/?mlat=${encodeURIComponent(r.lat)}&mlon=${encodeURIComponent(r.lng)}#map=17/${encodeURIComponent(r.lat)}/${encodeURIComponent(r.lng)}">${esc(t('drw.openInMaps'))}</a></p>`
                        : ''}
                </div>

                <div class="panel">
                    <p class="panel-title">${esc(t('drw.quote'))}</p>
                    <div class="field-row">
                        <label class="field">
                            <span class="field-label">${esc(t('drw.quotedPrice'))}</span>
                            <input class="input input-data" type="number" min="0" step="5"
                                   name="quotedPrice" value="${r.quotedPrice ?? ''}" placeholder="0">
                        </label>
                        <div class="field" style="display:flex;align-items:flex-end">
                            <button type="button" class="btn btn-ghost" data-save-quote>${esc(t('drw.saveQuote'))}</button>
                        </div>
                    </div>
                    <p class="field-hint">${esc(t('drw.quoteHint', { value: quote || t('drw.notQuoted') }))}</p>
                </div>

                <div class="panel">
                    <p class="panel-title">${esc(t('drw.notes'))}</p>
                    <div data-notes>${notesHtml(r.notes)}</div>
                    <div style="margin-top:var(--s4)">
                        <label class="field">
                            <span class="field-label">${esc(t('drw.addNoteLabel'))}</span>
                            <textarea class="textarea" name="note" rows="2"
                                      placeholder="${esc(t('drw.notePlaceholder'))}"></textarea>
                        </label>
                        <button type="button" class="btn btn-ghost btn-sm" style="margin-top:var(--s2)" data-add-note>${esc(t('drw.addNote'))}</button>
                    </div>
                </div>
            </div>

            <div class="drawer-foot">
                <a class="btn btn-primary" href="tel:${esc(String(r.phone).replace(/\s/g, ''))}">${icon('phone')} ${esc(t('drw.call', { name: r.name.split(' ')[0] }))}</a>
                <span class="spacer"></span>
                <button type="button" class="btn btn-danger" data-delete>${icon('trash')} ${esc(t('drw.delete'))}</button>
            </div>
        `;

        drawer.querySelector('.drawer-close').addEventListener('click', close);
        wireActions(r);
        mountMap(r);
    }

    function wireActions(r) {
        // --- Pipeline -----------------------------------------------------
        drawer.querySelectorAll('.pipe-step').forEach(btn => {
            btn.addEventListener('click', async () => {
                const next = btn.dataset.status;
                if (next === r.status) return;
                drawer.querySelectorAll('.pipe-step').forEach(b => { b.disabled = true; });
                try {
                    const updated = await api.updateRequest(r.id, { status: next });
                    record(ACTIONS.REQUEST_STATUS, {
                        target: refNumber(r.id), targetId: r.id,
                        detail: { from: r.status, to: next }
                    });
                    toast(t('drw.marked', { ref: refNumber(r.id), status: statusMeta(next).label.toLowerCase() }));
                    if (onChange) onChange(updated);
                    paint(updated);
                } catch (err) {
                    toast(err.message, 'error');
                    drawer.querySelectorAll('.pipe-step').forEach(b => { b.disabled = false; });
                }
            });
        });

        // --- Quote --------------------------------------------------------
        const quoteInput = drawer.querySelector('input[name="quotedPrice"]');
        const saveQuote = drawer.querySelector('[data-save-quote]');
        saveQuote.addEventListener('click', async () => {
            const raw = quoteInput.value.trim();
            const value = raw === '' ? null : Number(raw);
            if (value !== null && (!Number.isFinite(value) || value < 0)) {
                toast(t('drw.priceError'), 'error');
                quoteInput.focus();
                return;
            }
            saveQuote.disabled = true;
            try {
                const updated = await api.updateRequest(r.id, { quotedPrice: value });
                record(value === null ? ACTIONS.REQUEST_QUOTE_CLEAR : ACTIONS.REQUEST_QUOTE, {
                    target: refNumber(r.id), targetId: r.id, detail: { amount: value }
                });
                toast(t('drw.quoteSaved'));
                if (onChange) onChange(updated);
                paint(updated);
            } catch (err) {
                toast(err.message, 'error');
                saveQuote.disabled = false;
            }
        });

        // --- Notes --------------------------------------------------------
        const noteInput = drawer.querySelector('textarea[name="note"]');
        const addNote = drawer.querySelector('[data-add-note]');
        addNote.addEventListener('click', async () => {
            const text = noteInput.value.trim();
            if (!text) { noteInput.focus(); return; }
            addNote.disabled = true;
            try {
                await api.addNote(r.id, text);
                record(ACTIONS.REQUEST_NOTE, { target: refNumber(r.id), targetId: r.id });
                const updated = await api.getRequest(r.id);
                toast(t('drw.noteAdded'));
                if (onChange) onChange(updated);
                paint(updated);
            } catch (err) {
                toast(err.message, 'error');
                addNote.disabled = false;
            }
        });

        // --- Delete -------------------------------------------------------
        drawer.querySelector('[data-delete]').addEventListener('click', () => {
            confirmAction({
                title: t('drw.deleteTitle', { ref: refNumber(r.id) }),
                message: t('drw.deleteBody', { name: r.name }),
                confirmLabel: t('drw.deleteConfirm'),
                onConfirm: async () => {
                    await api.deleteRequest(r.id);
                    record(ACTIONS.REQUEST_DELETE, { target: refNumber(r.id), targetId: r.id });
                    toast(t('drw.deleted', { ref: refNumber(r.id) }));
                    if (onChange) onChange(null);
                    close();
                }
            });
        });
    }

    function mountMap(r) {
        const host = drawer.querySelector('[data-map]');
        if (!host) return;

        if (!r.lat || !r.lng) {
            host.innerHTML = `<div class="drawer-map-fallback">${esc(t('drw.noPin'))}</div>`;
            return;
        }

        loadLeaflet().then(L => {
            if (closed || !host.isConnected) return;
            map = L.map(host, {
                center: [Number(r.lat), Number(r.lng)],
                zoom: 16,
                scrollWheelZoom: false,
                attributionControl: true
            });
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap'
            }).addTo(map);
            L.marker([Number(r.lat), Number(r.lng)], {
                icon: L.divIcon({
                    className: 'admin-pin',
                    html: '<span class="admin-pin-dot"></span>',
                    iconSize: [22, 22],
                    iconAnchor: [11, 22]
                })
            }).addTo(map);
        }).catch(() => {
            if (closed) return;
            host.innerHTML = `<div class="drawer-map-fallback">${esc(t('drw.mapFailed'))}</div>`;
        });
    }

    load();

    return { close };
}
