// Run with:  node --test site/tests/
import test from 'node:test';
import assert from 'node:assert/strict';

import { validateOrder, isValidEmail, normalisePhone } from '../js/validation/orderValidator.js';

// A submission that passes every rule; each test bends one field out of shape.
function goodOrder(overrides = {}) {
    return {
        name: 'Ivan Petrosyan',
        email: 'ivan@example.com',
        phone: '+374 44 123456',
        serviceType: 'cleaning',
        address: 'Abovyan 12, apt 4, Yerevan',
        lat: '40.177200',
        lng: '44.512600',
        preferredDate: '2026-09-02',
        preferredTime: 'morning',
        message: 'Two rooms and a kitchen, about 60 square metres.',
        ...overrides
    };
}

const TODAY = '2026-09-01';
const run = (overrides) => validateOrder(goodOrder(overrides), { today: TODAY });

test('a complete order passes with no errors', () => {
    const result = run();
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.firstError, null);
});

test('every field is required', () => {
    const fields = [
        'name', 'email', 'phone', 'serviceType', 'address',
        'preferredDate', 'preferredTime', 'message'
    ];
    for (const field of fields) {
        const result = run({ [field]: '' });
        assert.equal(result.ok, false, `${field} empty should fail`);
        assert.equal(result.errors[field], 'required', `${field} should report "required"`);
    }
});

test('whitespace alone does not satisfy a required field', () => {
    const result = run({ name: '   ', message: '\t\n  ' });
    assert.equal(result.errors.name, 'required');
    assert.equal(result.errors.message, 'required');
});

test('a missing field is treated the same as an empty one', () => {
    const data = goodOrder();
    delete data.email;
    const result = validateOrder(data, { today: TODAY });
    assert.equal(result.errors.email, 'required');
});

test('firstError names the topmost invalid field, in form order', () => {
    // Email sits above message on the form, so it is the one to focus.
    const result = run({ email: 'nope', message: '' });
    assert.equal(result.firstError, 'email');
});

test('name must be at least two characters', () => {
    assert.equal(run({ name: 'A' }).errors.name, 'nameShort');
    assert.equal(run({ name: 'Bo' }).ok, true);
});

test('email must look like an address', () => {
    for (const bad of ['nope', 'a@', '@b.com', 'a b@c.com', 'a@b', 'a@b..com', 'a@@b.com']) {
        assert.equal(run({ email: bad }).errors.email, 'emailInvalid', `${bad} should be rejected`);
    }
    for (const good of ['a@b.co', 'ivan.petrosyan@mail.example.com', 'x+tag@sub.domain.org']) {
        assert.equal(run({ email: good }).ok, true, `${good} should be accepted`);
    }
});

test('phone must carry 8 to 15 digits, punctuation ignored', () => {
    assert.equal(run({ phone: '+374 44 12 34 56' }).ok, true);
    assert.equal(run({ phone: '(044) 123-456' }).ok, true);
    assert.equal(run({ phone: '1234567' }).errors.phone, 'phoneInvalid');
    assert.equal(run({ phone: '1234567890123456' }).errors.phone, 'phoneInvalid');
    assert.equal(run({ phone: 'call me maybe' }).errors.phone, 'phoneInvalid');
});

test('service type and preferred time must be known values', () => {
    assert.equal(run({ serviceType: 'spaceflight' }).errors.serviceType, 'serviceInvalid');
    assert.equal(run({ preferredTime: 'midnight' }).errors.preferredTime, 'timeInvalid');
});

test('address needs enough detail to find the door', () => {
    assert.equal(run({ address: 'St' }).errors.address, 'addressShort');
});

test('the map pin is optional: an order without one is still valid', () => {
    // Typing an address is enough. Plenty of visitors deny geolocation and
    // never notice the map, and their order should still go through.
    assert.equal(run({ lat: '', lng: '' }).ok, true);
    const data = goodOrder();
    delete data.lat;
    delete data.lng;
    assert.equal(validateOrder(data, { today: TODAY }).ok, true);
});

test('half a pin is treated as no pin, not as an error', () => {
    assert.equal(run({ lat: '40.1772', lng: '' }).ok, true);
    assert.equal(run({ lat: '', lng: '44.5126' }).ok, true);
    assert.equal(run({ lat: 'abc', lng: '44.5126' }).ok, true);
});

test('a pin that IS dropped must still be a real coordinate', () => {
    // Nothing in the UI can produce these, so they mean something is broken
    // and the order should not carry them to the backend.
    assert.equal(run({ lat: '95.0', lng: '44.5126' }).errors.location, 'locationRange');
    assert.equal(run({ lat: '40.1772', lng: '-200' }).errors.location, 'locationRange');
    assert.equal(run({ lat: '-91', lng: '0' }).errors.location, 'locationRange');
});

test('the preferred date cannot be in the past, but today is fine', () => {
    assert.equal(run({ preferredDate: '2026-08-31' }).errors.preferredDate, 'datePast');
    assert.equal(run({ preferredDate: TODAY }).ok, true);
    assert.equal(run({ preferredDate: 'not-a-date' }).errors.preferredDate, 'dateInvalid');
});

test('order details need at least ten characters', () => {
    assert.equal(run({ message: 'too short' }).errors.message, 'messageShort');
    assert.equal(run({ message: 'exactly 10' }).ok, true);
});

test('normalisePhone strips everything but digits and a leading plus', () => {
    assert.equal(normalisePhone(' +374 (44) 12-34-56 '), '+37444123456');
    assert.equal(normalisePhone('044 123 456'), '044123456');
});

test('isValidEmail is exported for reuse and agrees with the validator', () => {
    assert.equal(isValidEmail('a@b.co'), true);
    assert.equal(isValidEmail('a@b'), false);
});
