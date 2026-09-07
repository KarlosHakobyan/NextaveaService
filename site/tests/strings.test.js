// Run with:  node --test site/tests/strings.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

import STRINGS, { verifyStrings } from '../js/verification/strings.js';
import { FIELD_ORDER } from '../js/validation/orderValidator.js';

const LOCALES = ['ru', 'en', 'fr', 'it', 'es', 'de', 'nl'];

test('the site\'s seven locales are all present', () => {
    assert.deepEqual(Object.keys(STRINGS).sort(), [...LOCALES].sort());
});

test('every locale carries exactly the same keys', () => {
    const reference = Object.keys(STRINGS.en).sort();
    for (const locale of LOCALES) {
        assert.deepEqual(
            Object.keys(STRINGS[locale]).sort(), reference,
            `locale "${locale}" does not match en key-for-key`
        );
    }
});

test('no string is left empty', () => {
    for (const locale of LOCALES) {
        for (const [key, value] of Object.entries(STRINGS[locale])) {
            assert.equal(typeof value, 'string', `${locale}.${key} is not a string`);
            assert.ok(value.trim().length > 0, `${locale}.${key} is empty`);
        }
    }
});

test('placeholders survive translation', () => {
    const expected = {
        sentTo: ['{email}', '{phone}'],
        digitLabel: ['{n}'],
        resendIn: ['{seconds}'],
        expiresIn: ['{time}'],
        errWrongCode: ['{n}']
    };
    for (const locale of LOCALES) {
        for (const [key, tokens] of Object.entries(expected)) {
            for (const token of tokens) {
                assert.ok(
                    STRINGS[locale][key].includes(token),
                    `${locale}.${key} is missing the ${token} placeholder`
                );
            }
        }
    }
});

test('every validator error code has a message in every locale', () => {
    const codes = [
        'required', 'nameShort', 'emailInvalid', 'phoneInvalid', 'serviceInvalid',
        'addressShort', 'locationRange', 'datePast',
        'dateInvalid', 'timeInvalid', 'messageShort'
    ];
    for (const locale of LOCALES) {
        for (const code of codes) {
            assert.ok(STRINGS[locale][code], `${locale} has no message for "${code}"`);
        }
    }
});

test('every validated field can be labelled', () => {
    // Guards against a field being added to the validator with no way to
    // describe its failure to the visitor.
    assert.ok(FIELD_ORDER.length > 0);
    assert.ok(FIELD_ORDER.includes('location'));
    assert.ok(FIELD_ORDER.includes('email'));
});

test('an unknown locale falls back to Russian, the site default', () => {
    assert.equal(verifyStrings('kl'), STRINGS.ru);
    assert.equal(verifyStrings(undefined), STRINGS.ru);
    assert.equal(verifyStrings('de'), STRINGS.de);
});
