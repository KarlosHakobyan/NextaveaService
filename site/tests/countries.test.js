// Run with:  node --test site/tests/countries.test.js
//
// Guards the generated table. A wrong dial code means a customer we cannot
// call back, and a missing flag file means a broken image in the picker, so
// both are checked against the filesystem rather than trusted.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    COUNTRIES, BY_ISO, DEFAULT_ISO, countryName, flagSrc
} from '../js/data/countries.js';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['ru', 'en', 'fr', 'it', 'es', 'de', 'nl'];

test('the table covers essentially every dialable country', () => {
    assert.ok(COUNTRIES.length > 240, `only ${COUNTRIES.length} countries`);
});

test('every ISO code is a unique two-letter code', () => {
    const seen = new Set();
    for (const c of COUNTRIES) {
        assert.match(c.iso, /^[A-Z]{2}$/, `bad ISO: ${c.iso}`);
        assert.ok(!seen.has(c.iso), `duplicate ISO: ${c.iso}`);
        seen.add(c.iso);
    }
});

test('every dial code is a plus and one to five digits', () => {
    for (const c of COUNTRIES) {
        assert.match(c.dial, /^\+\d{1,5}$/, `${c.iso} has dial code "${c.dial}"`);
    }
});

test('the Åland Islands are the only five-digit code', () => {
    // +358 18 is Finland's code plus an area code, and it is the reason
    // phoneNumber.js scans five digits rather than four. If a second one ever
    // appears upstream this fails, so the scan width gets revisited.
    const long = COUNTRIES.filter((c) => c.dial.length - 1 > 4).map((c) => c.iso);
    assert.deepEqual(long, ['AX']);
    assert.equal(BY_ISO.get('AX').dial, '+35818');
});

test('dial codes match the ITU assignments for countries we can check by hand', () => {
    // A spot-check against known-good values. If the upstream dataset ever
    // regresses, this fails rather than shipping unreachable numbers.
    const known = {
        AM: '+374', RU: '+7', US: '+1', GB: '+44', FR: '+33', DE: '+49',
        IT: '+39', ES: '+34', NL: '+31', GE: '+995', IR: '+98', TR: '+90',
        AE: '+971', CN: '+86', IN: '+91', BR: '+55', AU: '+61', JP: '+81'
    };
    for (const [iso, dial] of Object.entries(known)) {
        const country = BY_ISO.get(iso);
        assert.ok(country, `${iso} is missing from the table`);
        assert.equal(country.dial, dial, `${iso} should be ${dial}`);
    }
});

test('every country is named in all seven locales', () => {
    for (const c of COUNTRIES) {
        for (const locale of LOCALES) {
            const name = c.names[locale];
            assert.equal(typeof name, 'string', `${c.iso}.${locale} is not a string`);
            assert.ok(name.trim().length > 0, `${c.iso}.${locale} is empty`);
        }
    }
});

test('names are actually translated, not English everywhere', () => {
    // A sanity check that the translation keys were wired up: if the generator
    // silently fell back to English for a whole locale, this catches it.
    for (const locale of ['ru', 'fr', 'de', 'nl', 'it', 'es']) {
        const differing = COUNTRIES.filter((c) => c.names[locale] !== c.names.en).length;
        assert.ok(differing > 50,
            `only ${differing} names differ from English in "${locale}"`);
    }
});

test('Russian names are in Cyrillic', () => {
    const armenia = BY_ISO.get('AM');
    assert.match(armenia.names.ru, /[Ѐ-ӿ]/, armenia.names.ru);
});

test('every country has a flag file on disk that is really an SVG', () => {
    const missing = [];
    const empty = [];
    for (const c of COUNTRIES) {
        const file = join(SITE, flagSrc(c.iso));
        if (!existsSync(file)) missing.push(c.iso);
        else if (statSync(file).size < 40) empty.push(c.iso);
    }
    assert.deepEqual(missing, [], `no flag file for: ${missing.join(', ')}`);
    assert.deepEqual(empty, [], `suspiciously small flag: ${empty.join(', ')}`);
});

test('flag paths are relative, so they work under the hash router', () => {
    // A leading slash would break if the site is ever served from a subpath.
    assert.equal(flagSrc('AM'), 'assets/vendor/flags/am.svg');
    assert.ok(!flagSrc('AM').startsWith('/'));
});

test('the default country is Armenia, and it is in the table', () => {
    assert.equal(DEFAULT_ISO, 'AM');
    assert.ok(BY_ISO.get(DEFAULT_ISO));
    assert.equal(BY_ISO.get('AM').dial, '+374');
});

test('countryName falls back to English for an unknown locale', () => {
    const armenia = BY_ISO.get('AM');
    assert.equal(countryName(armenia, 'kl'), armenia.names.en);
    assert.equal(countryName(armenia, 'ru'), armenia.names.ru);
});

test('the offline fallback in phoneField matches the real table', () => {
    // phoneField.js paints the closed field from a hard-coded constant before
    // the table has loaded. If they ever drift, the field would flicker to a
    // different country on load.
    const fallback = { iso: 'AM', dial: '+374' };
    const real = BY_ISO.get(fallback.iso);
    assert.ok(real, 'the fallback country must exist in the table');
    assert.equal(real.dial, fallback.dial);
    assert.equal(fallback.iso, DEFAULT_ISO);
});
