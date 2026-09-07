/* ==========================================================================
   Settings: connection, key, and the contract this console expects.

   The endpoint list is here on purpose: it is the shortest possible answer
   to "what do I have to build on the API side", visible from inside the
   thing that consumes it. The long version is docs/admin-api.md.
   ========================================================================== */

import { conn, retryConnection } from '../api.js';
import { getKey, maskKey, getBaseUrl, setBaseUrl, isRemembered, DEFAULT_BASE_URL } from '../auth.js';
import { resetDemoStore } from '../demo.js';
import { el, esc, demoBanner, toast, confirmAction } from '../ui.js';
import { t } from '../i18n.js';
import { record, ACTIONS, operatorName, setOperatorName } from '../audit.js';

const ENDPOINTS = [
    ['GET',    '/admin/session'],
    ['GET',    '/admin/stats'],
    ['GET',    '/admin/requests'],
    ['GET',    '/admin/requests/{id}'],
    ['PATCH',  '/admin/requests/{id}'],
    ['DELETE', '/admin/requests/{id}'],
    ['POST',   '/admin/requests/{id}/notes'],
    ['GET',    '/admin/services'],
    ['POST',   '/admin/services'],
    ['PUT',    '/admin/services/{id}'],
    ['DELETE', '/admin/services/{id}'],
    ['GET',    '/admin/portfolio'],
    ['POST',   '/admin/portfolio'],
    ['POST',   '/admin/portfolio/upload'],
    ['PUT',    '/admin/portfolio/order'],
    ['PUT',    '/admin/portfolio/{id}'],
    ['DELETE', '/admin/portfolio/{id}']
];

export function render() {
    const page = el('div');

    page.innerHTML = `
        ${conn.mode === 'demo' ? demoBanner() : ''}

        <div class="view-head">
            <div>
                <h1>${esc(t('title.settings'))}</h1>
                <p>${esc(t('set.subtitle'))}</p>
            </div>
        </div>

        <div class="settings-grid">
            <section class="panel">
                <p class="panel-title">${esc(t('set.connection'))}</p>
                <label class="field">
                    <span class="field-label">${esc(t('set.baseUrl'))}</span>
                    <input class="input input-data" name="base" value="${esc(getBaseUrl())}"
                           spellcheck="false" autocomplete="off">
                    <span class="field-hint">${t('set.baseHint', { url: esc(DEFAULT_BASE_URL) })}</span>
                </label>
                <div style="display:flex;gap:var(--s2);margin-top:var(--s4);flex-wrap:wrap">
                    <button type="button" class="btn btn-primary" data-save-base>${esc(t('set.saveUrl'))}</button>
                    <button type="button" class="btn btn-ghost" data-retry>${esc(t('set.retry'))}</button>
                </div>
                <p class="field-hint" data-conn-state style="margin-top:var(--s4)"></p>
            </section>

            <section class="panel">
                <p class="panel-title">${esc(t('set.operator'))}</p>
                <label class="field">
                    <span class="field-label">${esc(t('set.operatorName'))}</span>
                    <input class="input" name="operator" maxlength="60"
                           value="${esc(operatorName())}" placeholder="${esc(t('set.operatorPlaceholder'))}">
                    <span class="field-hint">${esc(t('set.operatorHint'))}</span>
                </label>
                <div style="margin-top:var(--s4)">
                    <button type="button" class="btn btn-primary" data-save-operator>${esc(t('set.saveOperator'))}</button>
                </div>
            </section>

            <section class="panel">
                <p class="panel-title">${esc(t('set.key'))}</p>
                <div class="key-preview">${esc(maskKey(getKey()))}</div>
                <p class="field-hint">${esc(t('set.keyHint', {
                    where: isRemembered() ? t('set.storedBrowser') : t('set.storedTab')
                }))}</p>
                <div style="display:flex;gap:var(--s2);margin-top:var(--s4);flex-wrap:wrap">
                    <button type="button" class="btn btn-ghost" data-change-key>${esc(t('set.changeKey'))}</button>
                </div>
            </section>

            <section class="panel">
                <p class="panel-title">${esc(t('set.demoTitle'))}</p>
                <p class="field-hint" style="margin-top:0">${esc(t('set.demoHint'))}</p>
                <div style="margin-top:var(--s4)">
                    <button type="button" class="btn btn-danger" data-reset-demo>${esc(t('set.reset'))}</button>
                </div>
            </section>

            <section class="panel">
                <p class="panel-title">${esc(t('set.endpoints'))}</p>
                <ul class="endpoint-list">
                    ${ENDPOINTS.map(([verb, path]) => `
                        <li>
                            <span class="endpoint-verb">${esc(verb)}</span>
                            <span class="endpoint-path">${esc(path)}</span>
                        </li>
                    `).join('')}
                </ul>
                <p class="field-hint">${t('set.endpointsHint')}</p>
            </section>
        </div>
    `;

    const connState = page.querySelector('[data-conn-state]');

    function paintConnState() {
        connState.innerHTML = conn.mode === 'live'
            ? t('set.connOk', { url: esc(getBaseUrl()) })
            : t('set.connDown', { detail: conn.lastError ? `: ${esc(conn.lastError)}` : '' });
    }
    paintConnState();

    page.querySelector('[data-save-operator]').addEventListener('click', () => {
        const name = page.querySelector('[name="operator"]').value.trim();
        setOperatorName(name);
        toast(name ? t('set.operatorSaved', { name }) : t('set.operatorCleared'));
    });

    page.querySelector('[data-save-base]').addEventListener('click', async () => {
        const value = page.querySelector('[name="base"]').value.trim();
        setBaseUrl(value);
        record(ACTIONS.SETTINGS_API_URL, { target: value });
        toast(t('set.urlSaved'));
        await tryConnect();
    });

    page.querySelector('[data-retry]').addEventListener('click', tryConnect);

    async function tryConnect() {
        const btn = page.querySelector('[data-retry]');
        btn.disabled = true;
        btn.textContent = t('set.checking');
        try {
            const mode = await retryConnection();
            toast(mode === 'live' ? t('set.connected') : t('set.stillDown'),
                  mode === 'live' ? 'ok' : 'error');
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = t('set.retry');
            paintConnState();
        }
    }

    page.querySelector('[data-change-key]').addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('admin:unauthorized'));
    });

    page.querySelector('[data-reset-demo]').addEventListener('click', () => {
        confirmAction({
            title: t('set.resetTitle'),
            message: t('set.resetBody'),
            confirmLabel: t('set.reset'),
            onConfirm: async () => {
                resetDemoStore();
                record(ACTIONS.SETTINGS_RESET_DEMO);
                toast(t('set.resetDone'));
                window.dispatchEvent(new CustomEvent('admin:reload-view'));
            }
        });
    });

    window.addEventListener('admin:connection-changed', paintConnState);
    page.destroy = () => window.removeEventListener('admin:connection-changed', paintConnState);

    return page;
}
