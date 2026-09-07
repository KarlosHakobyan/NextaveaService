// Run with:  node --test site/tests/countrySearch.test.js
//
// Ranking, not just matching. Plain substring order is actively wrong here:
// "nl" finds Finland before the Netherlands, and "+44" finds Guernsey before
// the United Kingdom, because both are alphabetically earlier.
import test from 'node:test';
import assert from 'node:assert/strict';

import { filterCountries, score, NO_MATCH } from '../js/components/phoneField.js';
import { COUNTRIES, DEFAULT_ISO } from '../js/data/countries.js';

// The picker sorts before it filters, so mirror that here.
function listFor(lang) {
    return [...COUNTRIES].sort((a, b) => {
        if (a.iso === DEFAULT_ISO) return -1;
        if (b.iso === DEFAULT_ISO) return 1;
        return (a.names[lang] || a.names.en).localeCompare(b.names[lang] || b.names.en, lang);
    });
}

const EN = listFor('en');
const first = (query, lang = 'en') => filterCountries(listFor(lang), query, lang)[0];

test('an empty query returns everything, in the order given', () => {
    const all = filterCountries(EN, '', 'en');
    assert.equal(all.length, EN.length);
    assert.equal(all[0].iso, DEFAULT_ISO, 'the default country stays pinned');
});

test('an exact ISO code wins over a name that merely contains it', () => {
    // "Finland" contains "nl". The Netherlands must still come first.
    assert.equal(first('nl').iso, 'NL');
    assert.equal(first('am').iso, 'AM');
    assert.equal(first('ge').iso, 'GE');
});

test('an exact dial code resolves to the country that owns it', () => {
    // Guernsey, the Isle of Man and Jersey all share +44 and all sort before
    // the United Kingdom alphabetically.
    assert.equal(first('+44').iso, 'GB');
    assert.equal(first('44').iso, 'GB');
    assert.equal(first('+1').iso, 'US');
    assert.equal(first('+7').iso, 'RU');
    assert.equal(first('+374').iso, 'AM');
});

test('the other holders of a shared code are still offered, just lower', () => {
    const results = filterCountries(EN, '+44', 'en').map((c) => c.iso);
    assert.equal(results[0], 'GB');
    for (const iso of ['GG', 'IM', 'JE']) {
        assert.ok(results.includes(iso), `${iso} should still be findable`);
    }
});

test('a name prefix beats a name that contains the query mid-word', () => {
    assert.equal(first('georg').iso, 'GE');
    assert.equal(first('arme').iso, 'AM');
    assert.equal(first('united k').iso, 'GB');
});

test('a partial dial code still matches by prefix', () => {
    const results = filterCountries(EN, '37', 'en').map((c) => c.dial);
    assert.ok(results.length > 1);
    assert.ok(results.every((d) => d.replace('+', '').startsWith('37')));
});

test('search is case insensitive and ignores surrounding space', () => {
    assert.equal(first('  ARMENIA  ').iso, 'AM');
    assert.equal(first('aRmEnIa').iso, 'AM');
});

test('search works in the visitor\'s own language', () => {
    assert.equal(first('Армения', 'ru').iso, 'AM');
    assert.equal(first('Нидерланды', 'ru').iso, 'NL');
    assert.equal(first('Allemagne', 'fr').iso, 'DE');
    assert.equal(first('Duitsland', 'nl').iso, 'DE');
    assert.equal(first('Alemania', 'es').iso, 'DE');
});

test('a query matching nothing returns nothing', () => {
    assert.deepEqual(filterCountries(EN, 'zzzzz', 'en'), []);
    assert.equal(score(COUNTRIES[0], 'zzzzz', 'en'), NO_MATCH);
});

test('every country remains reachable by its own English name', () => {
    // Guards against a ranking change quietly making some country unfindable.
    const unreachable = COUNTRIES.filter((c) => {
        const hit = filterCountries(EN, c.names.en, 'en');
        return !hit.some((r) => r.iso === c.iso);
    }).map((c) => c.iso);
    assert.deepEqual(unreachable, []);
});

test('every country remains reachable by its ISO code', () => {
    const unreachable = COUNTRIES.filter((c) => {
        const hit = filterCountries(EN, c.iso, 'en');
        return !hit.some((r) => r.iso === c.iso);
    }).map((c) => c.iso);
    assert.deepEqual(unreachable, []);
});
