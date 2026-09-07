/* ==========================================================================
   The API choke point.

   Every request the console makes goes through request(). It attaches the
   secret key, normalises errors, and falls through to the demo store when the
   API cannot be reached, so the console stays usable before the backend
   exists.

   That fall-through is always announced: conn.mode flips to 'demo', the
   topbar chip changes, and a banner appears on every page. The console never
   shows demo data while implying it is live.

   The contract this expects is documented in docs/admin-api.md.
   ========================================================================== */

import { getKey, clearKey, getBaseUrl } from './auth.js';
import { demoRequest } from './demo.js';

const PROBE_TIMEOUT_MS = 6000;
const REQUEST_TIMEOUT_MS = 20000;

export const conn = {
    mode: 'unknown',   // 'live' | 'demo' | 'unknown'
    lastError: null
};

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export class AuthError extends ApiError {
    constructor(message = 'That key was rejected.') {
        super(message, 401);
        this.name = 'AuthError';
    }
}

/** Fired when the API rejects the key mid-session. app.js listens. */
function announceSignOut() {
    window.dispatchEvent(new CustomEvent('admin:unauthorized'));
}

function buildUrl(path, query) {
    const url = `${getBaseUrl()}${path}`;
    if (!query) return url;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') params.set(k, v);
    });
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
}

/**
 * @param {'GET'|'POST'|'PATCH'|'PUT'|'DELETE'} method
 * @param {string} path      e.g. '/admin/requests'
 * @param {object} [options] { body, query, key, probe }
 *   key:   use this key instead of the stored one (login verification)
 *   probe: a connectivity check that never falls through to demo
 */
export async function request(method, path, options = {}) {
    const { body, query, key, probe } = options;
    const secret = key || getKey();

    if (!secret) throw new AuthError('No API key. Sign in again.');

    // Already known to be offline: go straight to demo, don't stall the UI
    // on a timeout for every single call.
    if (conn.mode === 'demo' && !probe) {
        return demoRequest(method, path, { body, query });
    }

    let response;
    try {
        response = await fetch(buildUrl(path, query), {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Admin-Key': secret
            },
            body: body === undefined ? undefined : JSON.stringify(body),
            // A host that accepts the connection and then says nothing would
            // otherwise hang sign-in indefinitely. Fail fast and fall through.
            signal: AbortSignal.timeout(probe ? PROBE_TIMEOUT_MS : REQUEST_TIMEOUT_MS)
        });
    } catch (networkError) {
        // fetch() only rejects on network-level failure: server down, DNS,
        // CORS, a certificate the browser refused, or our own timeout.
        conn.lastError = networkError.name === 'TimeoutError'
            ? 'The API did not answer in time.'
            : networkError.message;
        if (probe) throw new ApiError('Could not reach the API.', 0);
        conn.mode = 'demo';
        window.dispatchEvent(new CustomEvent('admin:connection-changed'));
        return demoRequest(method, path, { body, query });
    }

    if (response.status === 401 || response.status === 403) {
        clearKey();
        announceSignOut();
        throw new AuthError();
    }

    if (!response.ok) {
        let detail = `Request failed (${response.status})`;
        try {
            const payload = await response.json();
            if (payload && payload.message) detail = payload.message;
        } catch { /* body was not JSON; the status line is all we have */ }
        throw new ApiError(detail, response.status);
    }

    if (conn.mode !== 'live') {
        conn.mode = 'live';
        conn.lastError = null;
        window.dispatchEvent(new CustomEvent('admin:connection-changed'));
    }

    if (response.status === 204) return null;
    return response.json();
}

/**
 * Login check. Returns the mode the console will run in.
 * When the API is unreachable the key cannot be verified, so say so plainly
 * rather than implying the key was accepted.
 */
export async function verifyKey(key) {
    try {
        const session = await request('GET', '/admin/session', { key, probe: true });
        conn.mode = 'live';
        conn.lastError = null;
        return { mode: 'live', session };
    } catch (err) {
        if (err instanceof AuthError) throw err;
        conn.mode = 'demo';
        return { mode: 'demo', session: null };
    }
}

/**
 * Bare connectivity check with no side effects. It must not clear the key or
 * fire admin:unauthorized, because the login screen calls it while it is being
 * built and would otherwise re-render itself in a loop.
 *
 * Any HTTP answer means the API is up, 401 included: a rejected probe key is
 * still proof that something is listening and checking keys.
 *
 * @returns {Promise<'live'|'down'>}
 */
export async function probeApi() {
    try {
        await fetch(`${getBaseUrl()}/admin/session`, {
            method: 'GET',
            headers: { 'X-Admin-Key': 'connectivity-probe' },
            signal: AbortSignal.timeout(PROBE_TIMEOUT_MS)
        });
        return 'live';
    } catch {
        return 'down';
    }
}

/** Settings' "Try the API again": re-probes and reports what it found. */
export async function retryConnection() {
    conn.mode = 'unknown';
    try {
        await request('GET', '/admin/session', { probe: true });
        conn.mode = 'live';
        conn.lastError = null;
    } catch (err) {
        if (err instanceof AuthError) throw err;
        conn.mode = 'demo';
    }
    window.dispatchEvent(new CustomEvent('admin:connection-changed'));
    return conn.mode;
}

/* --------------------------------------------------------------------------
   Image upload.

   Multipart, so it cannot go through request(): the browser has to set the
   Content-Type itself to include the boundary. With no API, the image is
   inlined as a data URL so the portfolio grid still works. A size cap applies,
   because that data URL has to fit in localStorage alongside everything else.
   -------------------------------------------------------------------------- */

const DEMO_MAX_BYTES = 1_500_000;

function readAsDataUrl(file) {
    if (file.size > DEMO_MAX_BYTES) {
        return Promise.reject(new ApiError(
            'Without the API, images are stored in this browser and must be under 1.5 MB. Give a path instead.'
        ));
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new ApiError('That file could not be read.'));
        reader.readAsDataURL(file);
    });
}

/** @returns {Promise<string>} the URL the page should reference. */
export async function uploadImage(file) {
    if (conn.mode === 'demo') return readAsDataUrl(file);

    const form = new FormData();
    form.append('file', file);

    let response;
    try {
        response = await fetch(`${getBaseUrl()}/admin/portfolio/upload`, {
            method: 'POST',
            headers: { 'X-Admin-Key': getKey() },
            body: form
        });
    } catch (networkError) {
        conn.mode = 'demo';
        conn.lastError = networkError.message;
        window.dispatchEvent(new CustomEvent('admin:connection-changed'));
        return readAsDataUrl(file);
    }

    if (response.status === 401 || response.status === 403) {
        clearKey();
        announceSignOut();
        throw new AuthError();
    }
    if (!response.ok) throw new ApiError(`Upload failed (${response.status})`, response.status);

    const payload = await response.json();
    return payload.url;
}

/* --------------------------------------------------------------------------
   Endpoints. Pages call these, never request() directly.
   -------------------------------------------------------------------------- */

export const api = {
    stats:            (query)        => request('GET',    '/admin/stats', { query }),

    listRequests:     (query)        => request('GET',    '/admin/requests', { query }),
    getRequest:       (id)           => request('GET',    `/admin/requests/${id}`),
    updateRequest:    (id, patch)    => request('PATCH',  `/admin/requests/${id}`, { body: patch }),
    addNote:          (id, text)     => request('POST',   `/admin/requests/${id}/notes`, { body: { text } }),
    deleteRequest:    (id)           => request('DELETE', `/admin/requests/${id}`),

    listServices:     ()             => request('GET',    '/admin/services'),
    createService:    (service)      => request('POST',   '/admin/services', { body: service }),
    updateService:    (id, service)  => request('PUT',    `/admin/services/${id}`, { body: service }),
    deleteService:    (id)           => request('DELETE', `/admin/services/${id}`),

    listLogs:         (query)        => request('GET',    '/admin/logs', { query }),
    createLog:        (entry)        => request('POST',   '/admin/logs', { body: entry }),

    listPortfolio:    ()             => request('GET',    '/admin/portfolio'),
    createPortfolio:  (item)         => request('POST',   '/admin/portfolio', { body: item }),
    updatePortfolio:  (id, item)     => request('PUT',    `/admin/portfolio/${id}`, { body: item }),
    reorderPortfolio: (ids)          => request('PUT',    '/admin/portfolio/order', { body: { ids } }),
    deletePortfolio:  (id)           => request('DELETE', `/admin/portfolio/${id}`)
};
