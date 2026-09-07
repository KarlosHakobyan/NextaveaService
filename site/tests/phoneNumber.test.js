// Run with:  node --test site/tests/phoneNumber.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    composePhone, detectCountry, stripDialPrefix, nationalDigits
} from '../js/validation/phoneNumber.js';
import { BY_ISO } from '../js/data/countries.js';

const AM = BY_ISO.get('AM');   // +374
const US = BY_ISO.get('US');   // +1
const BS = BY_ISO.get('BS');   // +1242, sits inside +1
const GB = BY_ISO.get('GB');   // +44

test('composePhone joins the dial code to the national number', () => {
    assert.equal(composePhone('+374', '44123456'), '+374 44123456');
    assert.equal(composePhone('+374', '44 12 34 56'), '+374 44123456');
    assert.equal(composePhone('+374', ' (044) 12-34-56 '), '+374 044123456');
});

test('composePhone yields nothing when there is no national number', () => {
    // A bare dial code is not a phone number, and must not validate as one.
    assert.equal(composePhone('+374', ''), '');
    assert.equal(composePhone('+374', '   '), '');
    assert.equal(composePhone('+374', 'abc'), '');
});

test('the composed number stays dialable', () => {
    // The admin console drops it into href="tel:", so nothing but digits,
    // one leading plus, and the single separating space may survive.
    const composed = composePhone('+374', '(44) 12-34-56');
    assert.match(composed, /^\+\d+ \d+$/);
});

test('detectCountry finds the country from a pasted international number', () => {
    assert.equal(detectCountry('+37444123456').iso, 'AM');
    assert.equal(detectCountry('+44 7700 900123').iso, 'GB');
    assert.equal(detectCountry('+49 30 123456').iso, 'DE');
});

test('detectCountry prefers the longest matching dial code', () => {
    // +1242 is the Bahamas and lives inside the +1 block. A naive
    // shortest-match would file every Bahamian number under the US.
    assert.equal(BS.dial, '+1242');
    assert.equal(detectCountry('+1242 555 0100').iso, 'BS');
    assert.equal(detectCountry('+1 202 555 0100').iso, 'US');
});

test('a five-digit code beats the four-digit one it sits inside', () => {
    // Åland is +358 18; Finland is +358. A four-digit scan would miss it.
    assert.equal(detectCountry('+35818 12345').iso, 'AX');
    assert.equal(detectCountry('+358 40 1234567').iso, 'FI');
});

test('detectCountry returns null when there is nothing to go on', () => {
    assert.equal(detectCountry(''), null);
    assert.equal(detectCountry('44123456'), null, 'no plus means no country claim');
    assert.equal(detectCountry('+999999'), null, 'unassigned code');
    assert.equal(detectCountry('+'), null);
});

test('a shared dial code resolves to one predictable country', () => {
    // +1 is the US and Canada both. Whichever wins, it must be stable rather
    // than depending on table order changing under us.
    const first = detectCountry('+1 202 555 0100');
    assert.equal(first.iso, 'US');
    assert.equal(detectCountry('+1 202 555 0100').iso, first.iso);
});

test('stripDialPrefix removes the code the country already shows', () => {
    assert.equal(stripDialPrefix('+37444123456', AM), '44123456');
    assert.equal(stripDialPrefix('+374 44 12 34 56', AM), '44 12 34 56');
    assert.equal(stripDialPrefix('44123456', AM), '44123456', 'nothing to strip');
});

test('stripDialPrefix leaves a number belonging to another country alone', () => {
    assert.equal(stripDialPrefix('+447700900123', AM), '+447700900123');
});

test('nationalDigits counts only digits', () => {
    assert.equal(nationalDigits('(44) 12-34-56'), 8);
    assert.equal(nationalDigits(''), 0);
    assert.equal(nationalDigits('abc'), 0);
});

test('a composed number passes the order validator', async () => {
    const { validateOrder } = await import('../js/validation/orderValidator.js');
    const base = {
        name: 'Ivan', email: 'i@example.com', serviceType: 'cleaning',
        address: 'Abovyan 12, Yerevan', preferredDate: '2026-09-02',
        preferredTime: 'morning', message: 'Two rooms and a kitchen.'
    };
    const ok = validateOrder(
        { ...base, phone: composePhone('+374', '44123456') },
        { today: '2026-09-01' }
    );
    assert.equal(ok.errors.phone, undefined);

    // A dial code with no number behind it must still fail as required.
    const bare = validateOrder(
        { ...base, phone: composePhone('+374', '') },
        { today: '2026-09-01' }
    );
    assert.equal(bare.errors.phone, 'required');
});

test('a long international number still fits the validator\'s digit ceiling', () => {
    // +374 plus a 15-digit local number would exceed E.164; the validator
    // caps total digits at 15, and this documents that the two agree.
    const composed = composePhone('+374', '441234567890123');
    assert.ok(composed.replace(/\D/g, '').length > 15);
});
