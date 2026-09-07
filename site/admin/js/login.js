/* ==========================================================================
   login.html: the only page that handles the API secret key.

   Kept out of the console entirely: index.html renders nothing but the
   dashboard, and sends you here when there is no key. That way the sign-in
   flow has one home, and the console has one job.

   On success the key is stored and the browser is sent to index.html. There
   is no in-page transition between the two, because they are separate documents.
   ========================================================================== */

import { getKey, setKey, isRemembered, getBaseUrl } from './auth.js';
import { verifyKey, probeApi, AuthError } from './api.js';
import { esc, toast } from './ui.js';
import { initTheme, createThemeToggle } from '../../shared/theme.js';
import { t, createLangSelect, applyDocumentLang } from './i18n.js';
import { recordAndSettle, ACTIONS } from './audit.js';

const CONSOLE_PAGE = 'index.html';
const MIN_KEY_LENGTH = 8;

/* Why the console sent you back here. index.html sets ?reason=… */
const REASONS = {
    required:  '',                       // first visit: no message needed
    rejected:  () => t('reason.rejected'),
    expired:   () => t('reason.expired'),
    signedout: () => t('reason.signedout')
};

const form     = document.getElementById('login-form');
const input    = form.querySelector('input[name="key"]');
const remember = form.querySelector('input[name="remember"]');
const errorBox = document.getElementById('login-error');
const hintBox  = document.getElementById('login-hint');
const submit   = document.getElementById('login-submit');
const note     = document.getElementById('login-note');

/* --------------------------------------------------------------------------
   First paint
   -------------------------------------------------------------------------- */

applyDocumentLang();
initTheme();

// Static markup is left empty and filled here, so one language table drives
// the page instead of English being baked into the HTML.
document.title = `${t('login.title')} | ${t('title.suffix')}`;
document.getElementById('login-kicker').textContent = t('brand.sub');
document.getElementById('login-title').textContent = t('login.title');
document.getElementById('login-help').textContent = t('login.help');
document.getElementById('login-key-label').textContent = t('login.keyLabel');
document.getElementById('login-remember-label').textContent = t('login.remember');
input.placeholder = t('login.keyPlaceholder');
submit.textContent = t('login.submit');
form.parentElement.appendChild(createLangSelect('login-lang'));

// The sign-in page gets the same control, so the choice can be made before
// reaching the console rather than only after.
document.querySelector('.login-panel').appendChild(createThemeToggle({
    className: 'login-theme',
    labelClass: 'login-theme-label',
    toDark: t('shell.themeDark'),
    toLight: t('shell.themeLight'),
    darkLabel: t('shell.themeLightLabel'),
    lightLabel: t('shell.themeDarkLabel')
}));

note.innerHTML = t('login.note', { url: esc(getBaseUrl()) });

remember.checked = isRemembered();

// Already holding a key? Go straight to the console. It re-checks the key on
// load, so a stale one lands back here rather than looping: index.html only
// redirects when there is no key at all.
if (getKey()) {
    window.location.replace(CONSOLE_PAGE);
}

const reason = new URLSearchParams(window.location.search).get('reason');
if (reason && typeof REASONS[reason] === 'function') showError(REASONS[reason]());

/* With no API running, nothing can check a key, so say so rather than letting
   someone hunt for a password that does not exist yet. */
probeApi().then(state => {
    if (state === 'live') return;
    hintBox.innerHTML = `<strong>${esc(t('login.hintTitle', { url: getBaseUrl() }))}</strong>`
        + esc(t('login.hintBody', { n: MIN_KEY_LENGTH }));
    hintBox.hidden = false;
});

/* --------------------------------------------------------------------------
   Submit
   -------------------------------------------------------------------------- */

function showError(text) {
    errorBox.textContent = text;
    errorBox.hidden = false;
}

form.addEventListener('submit', async e => {
    e.preventDefault();
    const key = input.value.trim();
    errorBox.hidden = true;

    if (key.length < MIN_KEY_LENGTH) {
        showError(t('login.tooShort', { n: MIN_KEY_LENGTH }));
        input.focus();
        return;
    }

    submit.disabled = true;
    submit.textContent = t('login.checking');

    try {
        const { mode } = await verifyKey(key);
        setKey(key, remember.checked);
        // Awaited: navigating to the console would cancel the write.
        await recordAndSettle(ACTIONS.SIGN_IN);
        if (mode === 'demo') toast(t('login.demoToast'), 'error');
        window.location.assign(CONSOLE_PAGE);
    } catch (err) {
        submit.disabled = false;
        submit.textContent = t('login.submit');
        showError(err instanceof AuthError ? t('login.wrongKey') : err.message);
        input.select();
    }
});
