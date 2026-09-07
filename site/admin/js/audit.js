/* ==========================================================================
   Activity log.

   Every action the console takes is reported here, with the time and the name
   of whoever was signed in.

   Be clear about what this is. Everyone shares one API key, so the console
   cannot prove who is at the keyboard: the name is typed by the operator, not
   verified by anything. That makes this an activity log, useful for "when did
   that job get scheduled, and who did it", and NOT an audit trail you could
   rely on if someone wanted to cover their tracks.

   The API should log its own mutations server-side as well. A log the client
   writes is only as honest as the client.

   record() must never break the action it is describing. A log write that
   fails is swallowed: losing a log line is a nuisance, losing the operator's
   actual edit is not acceptable.
   ========================================================================== */

import { request } from './api.js';
import { KEYS, readPref, writePref } from '../../shared/prefs.js';

/* Stable machine keys. The sentence shown to the operator is rendered from
   these at read time, so the log reads in whatever language is selected and
   old entries are never stuck in the language they were written in. */
export const ACTIONS = {
    SIGN_IN:            'session.signin',
    SIGN_OUT:           'session.signout',
    REQUEST_STATUS:     'request.status',
    REQUEST_QUOTE:      'request.quote',
    REQUEST_QUOTE_CLEAR:'request.quoteCleared',
    REQUEST_NOTE:       'request.note',
    REQUEST_DELETE:     'request.delete',
    SERVICE_CREATE:     'service.create',
    SERVICE_UPDATE:     'service.update',
    SERVICE_DELETE:     'service.delete',
    PORTFOLIO_CREATE:   'portfolio.create',
    PORTFOLIO_UPDATE:   'portfolio.update',
    PORTFOLIO_REORDER:  'portfolio.reorder',
    PORTFOLIO_DELETE:   'portfolio.delete',
    SETTINGS_API_URL:   'settings.apiUrl',
    SETTINGS_RESET_DEMO:'settings.resetDemo'
};

/** Groups used by the filter on the Logs page. */
export const ACTION_GROUPS = {
    session:   [ACTIONS.SIGN_IN, ACTIONS.SIGN_OUT],
    request:   [ACTIONS.REQUEST_STATUS, ACTIONS.REQUEST_QUOTE, ACTIONS.REQUEST_QUOTE_CLEAR,
                ACTIONS.REQUEST_NOTE, ACTIONS.REQUEST_DELETE],
    service:   [ACTIONS.SERVICE_CREATE, ACTIONS.SERVICE_UPDATE, ACTIONS.SERVICE_DELETE],
    portfolio: [ACTIONS.PORTFOLIO_CREATE, ACTIONS.PORTFOLIO_UPDATE,
                ACTIONS.PORTFOLIO_REORDER, ACTIONS.PORTFOLIO_DELETE],
    settings:  [ACTIONS.SETTINGS_API_URL, ACTIONS.SETTINGS_RESET_DEMO]
};

/* --------------------------------------------------------------------------
   Who is doing it
   -------------------------------------------------------------------------- */

/**
 * The name shown against this console's actions. Typed by the operator, held
 * in this browser, and sent with every log entry. Empty until someone sets it.
 */
export function operatorName() {
    return (readPref(KEYS.OPERATOR) || '').trim();
}

export function setOperatorName(name) {
    writePref(KEYS.OPERATOR, String(name || '').trim().slice(0, 60));
}

/* --------------------------------------------------------------------------
   Writing
   -------------------------------------------------------------------------- */

/**
 * @param {string} action  one of ACTIONS
 * @param {object} [meta]  { target, targetId, detail }
 *   target   short human-readable subject, e.g. "#0142" or a service title
 *   targetId the record's id, so the log can link back to it
 *   detail   structured extras rendered into the sentence (from, to, amount)
 */
export function record(action, meta = {}) {
    const entry = {
        action,
        at: new Date().toISOString(),
        user: operatorName(),
        target: meta.target ?? null,
        targetId: meta.targetId ?? null,
        detail: meta.detail ?? null
    };

    // Deliberately not awaited: the caller has already done the real work and
    // must not be held up, or failed, by bookkeeping.
    return request('POST', '/admin/logs', { body: entry })
        .then(() => {
            window.dispatchEvent(new CustomEvent('admin:logged'));
            return entry;
        })
        .catch(() => entry); // see the note at the top of this file
}

/**
 * record(), but safe to await before leaving the page.
 *
 * Signing in and out are followed immediately by a navigation, which cancels
 * any request still in flight, so those two have to wait for the write. The
 * wait is capped: a slow API may delay sign-out slightly, it must never trap
 * someone on the page.
 */
export function recordAndSettle(action, meta = {}, maxMs = 1200) {
    return Promise.race([
        record(action, meta),
        new Promise(resolve => setTimeout(resolve, maxMs))
    ]);
}

/* --------------------------------------------------------------------------
   Reading
   -------------------------------------------------------------------------- */

export function listLogs(query) {
    return request('GET', '/admin/logs', { query });
}
