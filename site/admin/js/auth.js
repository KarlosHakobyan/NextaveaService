/* ==========================================================================
   Auth: a shared API secret key, held in the browser.

   Where the key lives is the operator's choice: sessionStorage by default
   (gone when the tab closes), localStorage when they tick "keep me signed
   in". Only one of the two ever holds a key at a time.

   Worth being clear about what this model is and is not: a shared secret
   identifies the console, not a person. There is no per-user audit trail,
   and anyone holding the key is you. Serve this over HTTPS, because the key
   travels in a request header and is readable in plain text otherwise, and
   rate limit failed attempts on the API side.
   ========================================================================== */

const KEY_STORE  = 'nx_admin_key';
const BASE_STORE = 'nx_admin_base';

export const DEFAULT_BASE_URL = 'https://localhost:7001/api';

export function getKey() {
    try {
        return sessionStorage.getItem(KEY_STORE) || localStorage.getItem(KEY_STORE) || '';
    } catch {
        return '';
    }
}

export function setKey(key, remember) {
    try {
        sessionStorage.removeItem(KEY_STORE);
        localStorage.removeItem(KEY_STORE);
        (remember ? localStorage : sessionStorage).setItem(KEY_STORE, key);
    } catch {
        /* Private-mode browsers can refuse storage. The key still works for
           this page load; it just will not survive a reload. */
    }
}

export function clearKey() {
    try {
        sessionStorage.removeItem(KEY_STORE);
        localStorage.removeItem(KEY_STORE);
    } catch { /* nothing to clean up */ }
}

export function isRemembered() {
    try { return Boolean(localStorage.getItem(KEY_STORE)); } catch { return false; }
}

/** Shows enough of the key to recognise it, never enough to reuse it. */
export function maskKey(key) {
    if (!key) return '—';
    if (key.length <= 10) return `${key.slice(0, 2)}${'•'.repeat(6)}`;
    return `${key.slice(0, 4)}${'•'.repeat(12)}${key.slice(-4)}`;
}

export function getBaseUrl() {
    try { return localStorage.getItem(BASE_STORE) || DEFAULT_BASE_URL; }
    catch { return DEFAULT_BASE_URL; }
}

export function setBaseUrl(url) {
    try {
        const clean = String(url || '').trim().replace(/\/+$/, '');
        if (clean) localStorage.setItem(BASE_STORE, clean);
        else localStorage.removeItem(BASE_STORE);
    } catch { /* see setKey */ }
}
