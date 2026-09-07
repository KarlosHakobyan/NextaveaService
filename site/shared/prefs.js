/* ==========================================================================
   Stored preferences.

   One place for everything the browser should remember between visits, used
   by both the public site and the operations console. Today that is the
   theme and the language. Anything added later (a default filter, a
   collapsed panel, a preferred landing page) belongs here too, so there is
   never a second scattered set of localStorage keys to hunt down.

   Every key is namespaced under `nx.` so it cannot collide with anything
   else served from the same origin.

   Storage can fail. Private browsing, a full quota and locked-down
   enterprise policies all throw on access rather than returning null, so
   every call is guarded. When storage is unavailable the site still works;
   it simply forgets between visits.
   ========================================================================== */

const NAMESPACE = 'nx.';

/* Keys are declared here rather than typed as strings at each call site, so
   a rename is one edit and a typo is a missing import instead of a silent
   miss. */
export const KEYS = {
    THEME: 'theme',
    LANG:  'lang',
    /* The console speaks three languages, the public site seven. They are
       stored apart so switching one never changes the other. */
    ADMIN_LANG: 'adminLang',
    /* The name shown against this console's actions in the activity log.
       Self-declared, since everyone shares one API key. */
    OPERATOR: 'operator'
};

let available = null;

/** Probes storage once, by writing rather than by feature-detecting. */
function storageWorks() {
    if (available !== null) return available;
    try {
        const probe = `${NAMESPACE}__probe`;
        localStorage.setItem(probe, '1');
        localStorage.removeItem(probe);
        available = true;
    } catch {
        available = false;
    }
    return available;
}

export function isStorageAvailable() {
    return storageWorks();
}

export function readPref(key, fallback = null) {
    if (!storageWorks()) return fallback;
    try {
        const raw = localStorage.getItem(NAMESPACE + key);
        return raw === null ? fallback : raw;
    } catch {
        return fallback;
    }
}

export function writePref(key, value) {
    if (!storageWorks()) return false;
    try {
        localStorage.setItem(NAMESPACE + key, String(value));
        notify(key, String(value));
        return true;
    } catch {
        return false;
    }
}

export function clearPref(key) {
    if (!storageWorks()) return;
    try {
        localStorage.removeItem(NAMESPACE + key);
        notify(key, null);
    } catch {
        /* nothing to clean up */
    }
}

/* --------------------------------------------------------------------------
   Change notification

   Two channels, because they cover different cases. Local listeners hear
   changes made on this page; the browser's own `storage` event covers
   changes made in another tab, which is how a theme switch in one tab
   reaches the others.
   -------------------------------------------------------------------------- */

const listeners = new Set();

function notify(key, value) {
    listeners.forEach(fn => {
        try { fn(key, value); } catch { /* a broken listener must not break the rest */ }
    });
}

/** @returns {() => void} an unsubscribe function */
export function onPrefChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

window.addEventListener('storage', event => {
    if (!event.key || !event.key.startsWith(NAMESPACE)) return;
    notify(event.key.slice(NAMESPACE.length), event.newValue);
});

/* --------------------------------------------------------------------------
   Migration from the original keys

   The public site stored its language as a bare `app_lang`. Move it into the
   namespace on first load so nobody's language choice is lost, then remove
   the old key. This runs once; after that there is nothing to move.
   -------------------------------------------------------------------------- */

export function migrateLegacyKeys() {
    if (!storageWorks()) return;
    try {
        const legacyLang = localStorage.getItem('app_lang');
        if (legacyLang && localStorage.getItem(NAMESPACE + KEYS.LANG) === null) {
            localStorage.setItem(NAMESPACE + KEYS.LANG, legacyLang);
        }
    } catch {
        /* nothing to migrate */
    }
}
