// The order-verification controller: it asks the API to send a 6-digit code to
// the customer's email and phone, then exchanges the code they type back for a
// verification token that `POST /requests` will only accept once.
//
// The browser never decides whether a code is correct in production. It cannot:
// anything it knows is in view-source. Generation, delivery and checking all
// belong to the backend, which is why this module is thin.
//
// Until that backend exists, `start()` falls back to a DEMO session so the flow
// can be built and used end to end. A demo session says so in its return value,
// and the modal prints a banner — the site never shows stand-in data while
// implying it is live. See site/admin/js/demo.js for the same convention.
//
// See site/tests/codeService.test.js  (node --test site/tests/codeService.test.js)

export const CODE_LENGTH = 6;
export const MAX_ATTEMPTS = 3;

const DEMO_EXPIRES_IN = 600; // 10 minutes, matching what the API should use
const DEMO_RESEND_AFTER = 60;

function fail(reason, extra = {}) {
    return Object.assign(new Error(reason), { reason, ...extra });
}

// Unbiased 6 digits from the CSPRNG. Math.random() would do for a throwaway
// demo, but rejection sampling here keeps the demo honest about the
// distribution the real backend is expected to have.
function randomCode() {
    const max = 10 ** CODE_LENGTH;              // 1_000_000
    const limit = Math.floor(0xFFFFFFFF / max) * max;
    const buf = new Uint32Array(1);
    let value;
    do {
        crypto.getRandomValues(buf);
        value = buf[0];
    } while (value >= limit);
    return String(value % max).padStart(CODE_LENGTH, '0');
}

// A failed request is only demo-worthy when nothing answered at all. A server
// that replied 429 or 500 is present and must be heard, not papered over.
function isUnreachable(err) {
    return typeof err.status !== 'number';
}

function translateStartError(err) {
    const body = err.body || {};
    if (err.status === 429) {
        return fail('rateLimited', { retryAfterSeconds: body.retryAfterSeconds || null });
    }
    if (err.status === 400) {
        return fail('badContact');
    }
    return fail('sendFailed');
}

function translateConfirmError(err) {
    const body = err.body || {};
    if (err.status === 410 || body.error === 'expired') return fail('expired');
    if (err.status === 429) {
        return fail('rateLimited', { retryAfterSeconds: body.retryAfterSeconds || null });
    }
    if (err.status === 400 || err.status === 422) {
        const left = typeof body.attemptsLeft === 'number' ? body.attemptsLeft : null;
        if (left === 0) return fail('noAttemptsLeft', { attemptsLeft: 0 });
        return fail('wrongCode', { attemptsLeft: left });
    }
    return fail('confirmFailed');
}

/**
 * @param {object}   options
 * @param {function} options.request  fetchApi-shaped (endpoint, options) => body
 * @param {function} [options.now]    injectable clock, for tests
 */
export function createCodeService({ request, now = () => Date.now() }) {
    let session = null;

    function startDemo(contact) {
        session = {
            demo: true,
            token: 'demo-session',
            code: randomCode(),
            contact,
            expiresAt: now() + DEMO_EXPIRES_IN * 1000,
            attemptsLeft: MAX_ATTEMPTS
        };
        return {
            demo: true,
            token: session.token,
            demoCode: session.code,
            expiresIn: DEMO_EXPIRES_IN,
            resendAfter: DEMO_RESEND_AFTER
        };
    }

    async function start(contact) {
        let response;
        try {
            response = await request('/requests/verify/start', {
                method: 'POST',
                body: JSON.stringify(contact)
            });
        } catch (err) {
            if (!isUnreachable(err)) throw translateStartError(err);
            return startDemo(contact);
        }

        session = {
            demo: false,
            token: response.token,
            contact,
            expiresAt: now() + (response.expiresInSeconds || DEMO_EXPIRES_IN) * 1000,
            attemptsLeft: MAX_ATTEMPTS
        };

        return {
            demo: false,
            token: response.token,
            demoCode: null,
            expiresIn: response.expiresInSeconds || DEMO_EXPIRES_IN,
            resendAfter: response.resendAfterSeconds || DEMO_RESEND_AFTER
        };
    }

    async function confirmDemo(code) {
        if (now() > session.expiresAt) throw fail('expired');
        if (session.attemptsLeft <= 0) throw fail('noAttemptsLeft', { attemptsLeft: 0 });

        if (code !== session.code) {
            session.attemptsLeft -= 1;
            if (session.attemptsLeft <= 0) throw fail('noAttemptsLeft', { attemptsLeft: 0 });
            throw fail('wrongCode', { attemptsLeft: session.attemptsLeft });
        }

        return { verificationToken: 'demo-' + session.code, demo: true };
    }

    async function confirm(code) {
        if (!session) throw fail('noSession');
        if (session.demo) return confirmDemo(code);

        let response;
        try {
            response = await request('/requests/verify/confirm', {
                method: 'POST',
                body: JSON.stringify({ token: session.token, code })
            });
        } catch (err) {
            const translated = translateConfirmError(err);
            // Track attempts locally too, so the count stays right even against
            // a backend that does not bother to report one.
            if (translated.reason === 'wrongCode') {
                session.attemptsLeft -= 1;
                if (translated.attemptsLeft === null) {
                    translated.attemptsLeft = session.attemptsLeft;
                }
                if (translated.attemptsLeft <= 0) throw fail('noAttemptsLeft', { attemptsLeft: 0 });
            }
            throw translated;
        }

        return { verificationToken: response.verificationToken, demo: false };
    }

    return {
        start,
        confirm,
        attemptsLeft: () => (session ? session.attemptsLeft : MAX_ATTEMPTS),
        isDemo: () => Boolean(session && session.demo),
        reset() { session = null; }
    };
}
