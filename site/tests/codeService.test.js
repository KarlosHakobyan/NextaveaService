// Run with:  node --test site/tests/codeService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createCodeService, CODE_LENGTH, MAX_ATTEMPTS
} from '../js/verification/codeService.js';

const CONTACT = { email: 'ivan@example.com', phone: '+37444123456', lang: 'ru' };

// A request stub standing in for fetchApi. `plan` maps endpoint -> handler.
function stubRequest(plan) {
    const calls = [];
    const request = async (endpoint, options) => {
        calls.push({ endpoint, body: JSON.parse(options.body) });
        const handler = plan[endpoint];
        if (!handler) throw Object.assign(new Error('404'), { status: 404 });
        return handler(JSON.parse(options.body));
    };
    return { request, calls };
}

function offlineRequest() {
    // What fetch throws when nothing is listening: no status, just a failure.
    return async () => { throw new TypeError('Failed to fetch'); };
}

test('start() posts the contact details and returns the server session', async () => {
    const { request, calls } = stubRequest({
        '/requests/verify/start': () => ({
            token: 'srv-token', expiresInSeconds: 300, resendAfterSeconds: 30
        })
    });
    const service = createCodeService({ request });
    const session = await service.start(CONTACT);

    assert.equal(calls[0].endpoint, '/requests/verify/start');
    assert.deepEqual(calls[0].body, CONTACT);
    assert.equal(session.demo, false);
    assert.equal(session.token, 'srv-token');
    assert.equal(session.expiresIn, 300);
    assert.equal(session.resendAfter, 30);
    assert.equal(session.demoCode, null, 'a real send must never leak the code');
});

test('confirm() exchanges a correct code for a verification token', async () => {
    const { request, calls } = stubRequest({
        '/requests/verify/start': () => ({ token: 'srv-token' }),
        '/requests/verify/confirm': (body) => {
            assert.equal(body.token, 'srv-token');
            assert.equal(body.code, '123456');
            return { verificationToken: 'verified-abc' };
        }
    });
    const service = createCodeService({ request });
    await service.start(CONTACT);
    const result = await service.confirm('123456');

    assert.equal(result.verificationToken, 'verified-abc');
    assert.equal(calls[1].endpoint, '/requests/verify/confirm');
});

test('a server rejection surfaces the attempts it reports', async () => {
    const { request } = stubRequest({
        '/requests/verify/start': () => ({ token: 't' }),
        '/requests/verify/confirm': () => {
            throw Object.assign(new Error('bad code'), {
                status: 400, body: { error: 'invalid_code', attemptsLeft: 2 }
            });
        }
    });
    const service = createCodeService({ request });
    await service.start(CONTACT);

    await assert.rejects(() => service.confirm('000000'), (err) => {
        assert.equal(err.reason, 'wrongCode');
        assert.equal(err.attemptsLeft, 2);
        return true;
    });
});

test('an expired session is reported as expired, not as a wrong code', async () => {
    const { request } = stubRequest({
        '/requests/verify/start': () => ({ token: 't' }),
        '/requests/verify/confirm': () => {
            throw Object.assign(new Error('gone'), {
                status: 410, body: { error: 'expired' }
            });
        }
    });
    const service = createCodeService({ request });
    await service.start(CONTACT);
    await assert.rejects(() => service.confirm('123456'), (err) => {
        assert.equal(err.reason, 'expired');
        return true;
    });
});

test('a rate limit from the server is passed through, never demoted to demo mode', async () => {
    const request = async () => {
        throw Object.assign(new Error('slow down'), {
            status: 429, body: { error: 'rate_limited', retryAfterSeconds: 45 }
        });
    };
    const service = createCodeService({ request });
    await assert.rejects(() => service.start(CONTACT), (err) => {
        assert.equal(err.reason, 'rateLimited');
        assert.equal(err.retryAfterSeconds, 45);
        return true;
    });
});

test('an unreachable backend falls back to a labelled demo session', async () => {
    const service = createCodeService({ request: offlineRequest() });
    const session = await service.start(CONTACT);

    assert.equal(session.demo, true, 'the caller must be able to say so on screen');
    assert.equal(session.demoCode.length, CODE_LENGTH);
    assert.ok(/^[0-9]+$/.test(session.demoCode), 'the demo code must be digits only');
    assert.equal(typeof session.expiresIn, 'number');
});

test('demo mode accepts its own code and rejects any other', async () => {
    const service = createCodeService({ request: offlineRequest() });
    const { demoCode } = await service.start(CONTACT);

    const wrong = demoCode === '000000' ? '111111' : '000000';
    await assert.rejects(() => service.confirm(wrong), (err) => {
        assert.equal(err.reason, 'wrongCode');
        assert.equal(err.attemptsLeft, MAX_ATTEMPTS - 1);
        return true;
    });

    const result = await service.confirm(demoCode);
    assert.equal(typeof result.verificationToken, 'string');
    assert.ok(result.verificationToken.startsWith('demo-'),
        'a demo token must be recognisable as one');
});

test('demo mode locks out after the allowed attempts', async () => {
    const service = createCodeService({ request: offlineRequest() });
    const { demoCode } = await service.start(CONTACT);
    const wrong = demoCode === '000000' ? '111111' : '000000';

    for (let i = 1; i < MAX_ATTEMPTS; i += 1) {
        await assert.rejects(() => service.confirm(wrong));
    }
    await assert.rejects(() => service.confirm(wrong), (err) => {
        assert.equal(err.reason, 'noAttemptsLeft');
        assert.equal(err.attemptsLeft, 0);
        return true;
    });
    // Even the right code is refused once the session is burnt.
    await assert.rejects(() => service.confirm(demoCode), (err) => {
        assert.equal(err.reason, 'noAttemptsLeft');
        return true;
    });
});

test('a demo session past its expiry is refused', async () => {
    let now = 1000;
    const service = createCodeService({ request: offlineRequest(), now: () => now });
    const session = await service.start(CONTACT);
    now += (session.expiresIn + 1) * 1000;

    await assert.rejects(() => service.confirm(session.demoCode), (err) => {
        assert.equal(err.reason, 'expired');
        return true;
    });
});

test('confirm() before start() is a programming error, not a wrong code', async () => {
    const service = createCodeService({ request: offlineRequest() });
    await assert.rejects(() => service.confirm('123456'), (err) => {
        assert.equal(err.reason, 'noSession');
        return true;
    });
});

test('restarting issues a fresh code and clears the attempt count', async () => {
    const service = createCodeService({ request: offlineRequest() });
    const first = await service.start(CONTACT);
    const wrong = first.demoCode === '000000' ? '111111' : '000000';
    await assert.rejects(() => service.confirm(wrong));

    const second = await service.start(CONTACT);
    assert.equal(service.attemptsLeft(), MAX_ATTEMPTS);
    const result = await service.confirm(second.demoCode);
    assert.ok(result.verificationToken);
});

test('codes are drawn across the full range, not from a lazy Math.random slice', async () => {
    const service = createCodeService({ request: offlineRequest() });
    const seen = new Set();
    for (let i = 0; i < 200; i += 1) {
        const { demoCode } = await service.start(CONTACT);
        assert.equal(demoCode.length, CODE_LENGTH);
        seen.add(demoCode);
    }
    assert.ok(seen.size > 150, 'expected varied codes, got ' + seen.size + ' distinct');
});
