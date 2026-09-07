// Phone number assembly and country detection for the order form.
//
// Kept free of the DOM so the rules are testable on their own, and separate
// from orderValidator.js because that file answers "is this form valid" while
// this one answers "what number did they actually type".
//
// See site/tests/phoneNumber.test.js

import { COUNTRIES, BY_ISO } from '../data/countries.js';

/* Five, not four, because of exactly one country: the Åland Islands are
   +358 18 — Finland's code plus an area code. Scanning only four digits
   would file every Åland number under Finland. */
const MAX_DIAL_DIGITS = 5;

/* Twelve dial codes are shared by more than one territory. Falling back to
   alphabetical order picks absurdly for some of them — +47 would resolve to
   Bouvet Island, which is uninhabited, rather than Norway — so the ones that
   matter are named here and the rest take the first ISO code alphabetically. */
const PREFERRED = {
    '+1': 'US',     // over CA, DO, PR
    '+7': 'RU',     // over KZ
    '+47': 'NO',    // over BV, an uninhabited island
    '+590': 'GP',   // over BL, MF
    '+262': 'RE',   // over TF, YT
    '+61': 'AU'     // over CC, CX
};

// dial code -> the one country the picker will claim it for.
const BY_DIAL = (() => {
    const map = new Map();
    for (const country of COUNTRIES) {
        const preferred = PREFERRED[country.dial];
        if (preferred) {
            map.set(country.dial, BY_ISO.get(preferred) || country);
        } else if (!map.has(country.dial)) {
            map.set(country.dial, country);
        }
    }
    return map;
})();

export function digitsOf(value) {
    return String(value || '').replace(/\D/g, '');
}

export function nationalDigits(value) {
    return digitsOf(value).length;
}

/**
 * Joins a dial code to whatever the visitor typed in the number box.
 * Returns '' when there is no number, so a bare dial code never validates
 * as a phone number.
 */
export function composePhone(dial, national) {
    const digits = digitsOf(national);
    if (!digits) return '';
    return `${dial} ${digits}`;
}

/**
 * Works out the country from a pasted international number.
 * Longest match wins: +1242 is the Bahamas, not the +1 block.
 * Returns null unless the text starts with '+' and a code we know.
 */
export function detectCountry(text) {
    const raw = String(text || '').trim();
    if (!raw.startsWith('+')) return null;

    const digits = digitsOf(raw);
    if (!digits) return null;

    for (let length = MAX_DIAL_DIGITS; length >= 1; length -= 1) {
        const candidate = '+' + digits.slice(0, length);
        const country = BY_DIAL.get(candidate);
        if (country) return country;
    }
    return null;
}

/**
 * Removes a dial code the picker is already displaying, so it is not typed
 * twice. Leaves the text alone if it belongs to some other country.
 */
export function stripDialPrefix(text, country) {
    const raw = String(text || '');
    if (!country || !raw.trim().startsWith(country.dial)) return raw;
    return raw.trim().slice(country.dial.length).replace(/^[\s-]+/, '');
}
