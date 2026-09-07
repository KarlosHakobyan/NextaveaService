#!/usr/bin/env node
// Regenerates js/data/countries.js and vendors the flag SVGs it needs.
//
// This exists so the country table is auditable rather than a blob somebody
// typed from memory. Wrong dial codes mean customers we cannot call back, so
// they come from a maintained dataset and are re-checked whenever this runs.
//
//   node scripts/build-countries.js          regenerate, reusing cached flags
//   node scripts/build-countries.js --force  re-download every flag
//
// Sources, both fetched at build time and never at page load:
//   dial codes + names  mledoze/countries  (ODbL 1.0)
//   flags               lipis/flag-icons   (MIT)
//
// Output is committed, so the site itself needs no network and no build step.

import { writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..');
const FLAG_DIR = join(SITE, 'assets', 'vendor', 'flags');
const OUT = join(SITE, 'js', 'data', 'countries.js');

const COUNTRIES_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json';
const FLAG_URL = (iso) => `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${iso}.svg`;

const force = process.argv.includes('--force');

// The site's seven locales, mapped to the dataset's ISO 639-3 keys.
// English is the dataset's own `name.common`, so it has no translation key.
const LOCALE_KEYS = {
    ru: 'rus', fr: 'fra', it: 'ita', es: 'spa', de: 'deu', nl: 'nld'
};
const LOCALES = ['ru', 'en', 'fr', 'it', 'es', 'de', 'nl'];

// Shown first, because this is a Yerevan business and it is the common case.
const DEFAULT_ISO = 'AM';

/* A root plus exactly one suffix is a whole dial code (+3 / 74 -> +374).
   Many suffixes means the root IS the code and the suffixes are area codes
   inside it: +1 covers the US and Canada, +7 covers Russia and Kazakhstan. */
function dialCode(idd) {
    if (!idd || !idd.root) return null;
    const suffixes = idd.suffixes || [];
    return suffixes.length === 1 ? idd.root + suffixes[0] : idd.root;
}

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
    return res.json();
}

async function downloadFlag(iso) {
    const file = join(FLAG_DIR, `${iso}.svg`);
    if (!force && existsSync(file) && statSync(file).size > 0) return 'cached';

    const res = await fetch(FLAG_URL(iso));
    if (!res.ok) return 'missing';

    const svg = await res.text();
    if (!svg.includes('<svg')) return 'missing';
    writeFileSync(file, svg);
    return 'downloaded';
}

async function main() {
    mkdirSync(FLAG_DIR, { recursive: true });
    mkdirSync(dirname(OUT), { recursive: true });

    console.log('Fetching country data…');
    const raw = await fetchJson(COUNTRIES_URL);

    const countries = [];
    const skipped = [];

    for (const entry of raw) {
        const iso = entry.cca2;
        const dial = dialCode(entry.idd);

        // Antarctica and Heard Island have no dial code; nobody is booking a
        // flat clean there, and a country you cannot phone is useless here.
        if (!dial) {
            skipped.push(`${iso} (no dial code)`);
            continue;
        }

        const names = { en: entry.name.common };
        for (const [locale, key] of Object.entries(LOCALE_KEYS)) {
            const translated = entry.translations[key];
            // Falling back to English keeps every locale complete. A missing
            // translation shows a recognisable name, never `undefined`.
            names[locale] = (translated && translated.common) || entry.name.common;
        }

        countries.push({ iso, dial, names });
    }

    countries.sort((a, b) => a.iso.localeCompare(b.iso));

    console.log(`Vendoring ${countries.length} flags…`);
    const missing = [];
    let downloaded = 0;
    let cached = 0;

    // Sequential on purpose: a burst of 250 parallel requests to raw
    // .githubusercontent.com gets throttled and returns partial files.
    for (const country of countries) {
        const result = await downloadFlag(country.iso.toLowerCase());
        if (result === 'missing') missing.push(country.iso);
        else if (result === 'downloaded') downloaded += 1;
        else cached += 1;
    }

    const body = countries.map((c) => {
        const names = LOCALES.map((l) => `${l}:${JSON.stringify(c.names[l])}`).join(',');
        return `    { iso: '${c.iso}', dial: '${c.dial}', names: { ${names} } }`;
    }).join(',\n');

    const file = `// GENERATED FILE - do not edit by hand.
// Regenerate with:  node scripts/build-countries.js
//
// Dial codes and country names: mledoze/countries (ODbL 1.0).
// The matching flags live in assets/vendor/flags/, from lipis/flag-icons (MIT).
//
// ${countries.length} countries, each with a dial code, a flag file and a name
// in all seven site locales.

export const DEFAULT_ISO = '${DEFAULT_ISO}';

export const FLAG_PATH = 'assets/vendor/flags/';

export const COUNTRIES = [
${body}
];

// Cheap lookups for the two things the phone field asks for constantly.
export const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso, c]));

export function countryName(country, lang) {
    return country.names[lang] || country.names.en;
}

export function flagSrc(iso) {
    return FLAG_PATH + iso.toLowerCase() + '.svg';
}

export default COUNTRIES;
`;

    writeFileSync(OUT, file);

    const bytes = readdirSync(FLAG_DIR)
        .filter((f) => f.endsWith('.svg'))
        .reduce((sum, f) => sum + statSync(join(FLAG_DIR, f)).size, 0);

    console.log(`\nWrote ${OUT}`);
    console.log(`  countries : ${countries.length}`);
    console.log(`  flags     : ${downloaded} downloaded, ${cached} cached, ${(bytes / 1048576).toFixed(2)} MB total`);
    if (skipped.length) console.log(`  skipped   : ${skipped.join(', ')}`);
    if (missing.length) console.log(`  NO FLAG   : ${missing.join(', ')}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
