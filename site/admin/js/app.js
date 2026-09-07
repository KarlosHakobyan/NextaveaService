/* ==========================================================================
   index.html: the console, and nothing else.

   Signing in lives on its own page (login.html / js/login.js). This file
   never renders a form: with no key, or with a key the API rejects, it hands
   the browser to login.html and stops.
   ========================================================================== */

import { getKey, clearKey, getBaseUrl } from './auth.js';
import { verifyKey, conn, api, AuthError } from './api.js';
import { ROUTES, initRouter, navigate } from './router.js';
import { icon } from './icons.js';
import { el, esc, toast } from './ui.js';
import { initTheme, createThemeToggle } from '../../shared/theme.js';
import { t, createLangSelect, applyDocumentLang } from './i18n.js';
import { recordAndSettle, ACTIONS } from './audit.js';

const root = document.getElementById('admin-root');

/* ==========================================================================
   Leaving for the login page
   ========================================================================== */

const LOGIN_PAGE = 'login.html';

/**
 * Send the browser to the sign-in page. `reason` tells login.js what to say
 * when it gets there; the key is cleared first so login.html does not bounce
 * straight back.
 */
function goToLogin(reason) {
    clearKey();
    conn.mode = 'unknown';
    window.location.replace(`${LOGIN_PAGE}?reason=${encodeURIComponent(reason)}`);
}

/* ==========================================================================
   Shell
   ========================================================================== */

function buildRail() {
    const rail = el('nav', 'rail');
    rail.setAttribute('aria-label', t('shell.sections'));
    rail.innerHTML = `
        <div class="rail-mark">
            <strong>Nextavéa Service</strong>
            <span>${esc(t('brand.sub'))}</span>
        </div>
        <div class="rail-nav">
            ${ROUTES.map(r => `
                <a class="rail-link" href="#${r.path}" data-route="${r.id}">
                    <span class="rail-icon">${icon(r.icon)}</span>
                    ${esc(r.label)}
                    <span class="rail-count" data-rail-count="${r.id}" hidden></span>
                </a>
            `).join('')}
            <div class="rail-theme-group" data-theme-slot></div>
        </div>
        <div class="rail-foot">
            <p class="eyebrow">${esc(t('shell.signedIn'))}</p>
            <button type="button" class="rail-signout">${esc(t('shell.signOut'))}</button>
        </div>
    `;
    rail.querySelector('.rail-signout').addEventListener('click', async () => {
        // Recorded, and waited for, before the key is cleared: the write needs
        // the key, and the redirect would cancel it.
        await recordAndSettle(ACTIONS.SIGN_OUT);
        goToLogin('signedout');
    });

    const prefs = rail.querySelector('[data-theme-slot]');
    prefs.appendChild(createThemeToggle({
        className: 'rail-theme',
        labelClass: 'rail-theme-label',
        toDark: t('shell.themeDark'),
        toLight: t('shell.themeLight'),
        darkLabel: t('shell.themeLightLabel'),
        lightLabel: t('shell.themeDarkLabel')
    }));
    prefs.appendChild(createLangSelect('rail-lang'));

    return rail;
}

function connChip() {
    const live = conn.mode === 'live';
    return `
        <span class="conn-chip${live ? '' : ' is-demo'}" title="${esc(live ? getBaseUrl() : conn.lastError || t('shell.apiUnreachable'))}">
            <span class="conn-dot"></span>${esc(live ? t('shell.live') : t('shell.demo'))}
        </span>
    `;
}

function mountConsole() {
    root.setAttribute('aria-busy', 'false');

    const shell = el('div', 'shell');
    const rail = buildRail();
    const workspace = el('div', 'workspace');
    const topbar = el('div', 'topbar');
    const view = el('div', 'view');

    topbar.innerHTML = `
        <span class="topbar-title"></span>
        <span class="topbar-meta">${connChip()}</span>
    `;

    workspace.append(topbar, view);
    shell.append(rail, workspace);
    root.replaceChildren(shell);

    function markActive(route) {
        rail.querySelectorAll('.rail-link').forEach(link => {
            link.classList.toggle('is-active', link.dataset.route === route.id);
            if (link.dataset.route === route.id) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }

    const router = initRouter(view, route => {
        topbar.querySelector('.topbar-title').textContent = route.title;
        document.title = `${route.title} - ${t('title.suffix')}`;
        markActive(route);
    });

    function refreshChip() {
        topbar.querySelector('.topbar-meta').innerHTML = connChip();
    }

    /* The badge counts requests still sitting at `new`, meaning nobody has
       picked them up yet. It is deliberately not the open count: a badge on a nav item
       reads as "these need you", so it has to fall to zero as you work. Open jobs
       are a workload figure, and they appear on the Today tally with a label.

       This is the one number worth carrying across every page, so it lives
       with the shell rather than with a page. */
    async function refreshCounts() {
        try {
            const stats = await api.stats();
            const badge = rail.querySelector('[data-rail-count="requests"]');
            if (!badge) return;
            const untouched = (stats.byStatus && stats.byStatus.new) || 0;
            badge.textContent = untouched;
            const label = t('shell.badge', { n: untouched });
            badge.title = label;
            // Without this the link reads as a bare "Requests 5".
            badge.setAttribute('aria-label', label);
            badge.hidden = untouched === 0;
        } catch { /* a failed count is not worth interrupting the operator */ }
    }

    window.addEventListener('admin:connection-changed', () => { refreshChip(); refreshCounts(); });
    window.addEventListener('admin:data-changed', refreshCounts);
    window.addEventListener('admin:reload-view', () => router.refresh());

    refreshCounts();

    // Land on the section that was requested, or Today.
    if (!window.location.hash) navigate('/');
}

/* ==========================================================================
   Boot
   ========================================================================== */

window.addEventListener('admin:unauthorized', () => goToLogin('rejected'));

async function boot() {
    const key = getKey();
    if (!key) {
        goToLogin('required');
        return;
    }

    // A stored key is re-checked on every load: it may have been rotated on
    // the API since the last session.
    try {
        const { mode } = await verifyKey(key);
        mountConsole();
        if (mode === 'demo') toast(t('shell.demoToast'), 'error');
    } catch (err) {
        if (err instanceof AuthError) {
            goToLogin('expired');
        } else {
            // Network-level failure: the console runs on demo data and says so.
            mountConsole();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyDocumentLang();
    initTheme();
    const booting = document.getElementById('booting-line');
    if (booting) booting.textContent = t('shell.booting');
    boot().catch(() => goToLogin('rejected'));
});

