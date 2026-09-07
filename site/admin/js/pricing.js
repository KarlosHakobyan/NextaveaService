/* ==========================================================================
   Turning a catalog price into a number.

   Catalog prices are free text on purpose: the real list is full of ranges,
   floors and "on estimate", and a decimal column would lose all of it. The
   calculator therefore has to read those strings back.

   Two steps, kept apart so each can be reasoned about alone:

     parsePrice()  free text  ->  a structured rate
     estimate()    rate + area ->  a price range, with the working shown

   Anything that cannot be parsed becomes an ESTIMATE rather than a guess.
   A wrong number here would be quoted to a customer, so the failure mode is
   always "we cannot say", never a plausible-looking invention.
   ========================================================================== */

/** What a parsed price turned out to be. */
export const KIND = {
    HOURLY:    'hourly',    // 30-35 €/hr
    PER_AREA:  'perArea',   // 4-10 €/m²
    PER_UNIT:  'perUnit',   // 3-6 € / window
    FLAT:      'flat',      // 30-50 €
    FLAT_FROM: 'flatFrom',  // from 150 €
    ESTIMATE:  'estimate'   // on estimate, or anything unparseable
};

const N = '(\\d+(?:[.,]\\d+)?)';
const DASH = '\\s*[–—-]\\s*';                 // en dash, em dash or hyphen
const EUR = '\\s*(?:€|eur|euro)';
const FROM = '(?:from|starting at|à partir de|a partir de|dès|des|от)';
const HOUR = '(?:hr|hrs|h|hour|hours|heure|heures|ч|час)';
const AREA = '(?:m²|m2|sqm)';

function num(raw) {
    return Number(String(raw).replace(',', '.'));
}

/* Ordered: the most specific unit wins, so "30-40 €/hr" is never read as a
   bare "30-40 €". */
const MATCHERS = [
    // 30-40 €/hr
    { re: new RegExp(`${N}${DASH}${N}${EUR}\\s*/\\s*${HOUR}`, 'i'),
      make: m => ({ kind: KIND.HOURLY, min: num(m[1]), max: num(m[2]) }) },
    // from 35 €/hr
    { re: new RegExp(`${FROM}\\s*${N}${EUR}\\s*/\\s*${HOUR}`, 'i'),
      make: m => ({ kind: KIND.HOURLY, min: num(m[1]), max: null }) },
    // 35 €/hr
    { re: new RegExp(`${N}${EUR}\\s*/\\s*${HOUR}`, 'i'),
      make: m => ({ kind: KIND.HOURLY, min: num(m[1]), max: num(m[1]) }) },

    // 4-10 €/m²
    { re: new RegExp(`${N}${DASH}${N}${EUR}\\s*/\\s*${AREA}`, 'i'),
      make: m => ({ kind: KIND.PER_AREA, min: num(m[1]), max: num(m[2]) }) },
    // from 4 €/m²
    { re: new RegExp(`${FROM}\\s*${N}${EUR}\\s*/\\s*${AREA}`, 'i'),
      make: m => ({ kind: KIND.PER_AREA, min: num(m[1]), max: null }) },
    // 6 €/m²
    { re: new RegExp(`${N}${EUR}\\s*/\\s*${AREA}`, 'i'),
      make: m => ({ kind: KIND.PER_AREA, min: num(m[1]), max: num(m[1]) }) },

    // 3-6 € / window  (any other named unit)
    { re: new RegExp(`${N}${DASH}${N}${EUR}\\s*/\\s*([\\p{L}]+)`, 'iu'),
      make: m => ({ kind: KIND.PER_UNIT, min: num(m[1]), max: num(m[2]), unit: m[3] }) },
    { re: new RegExp(`${N}${EUR}\\s*/\\s*([\\p{L}]+)`, 'iu'),
      make: m => ({ kind: KIND.PER_UNIT, min: num(m[1]), max: num(m[1]), unit: m[2] }) },

    // from 150 €
    { re: new RegExp(`${FROM}\\s*${N}${EUR}`, 'i'),
      make: m => ({ kind: KIND.FLAT_FROM, min: num(m[1]), max: null }) },
    // 30-50 €
    { re: new RegExp(`${N}${DASH}${N}${EUR}`, 'i'),
      make: m => ({ kind: KIND.FLAT, min: num(m[1]), max: num(m[2]) }) },
    // 80 €
    { re: new RegExp(`${N}${EUR}`, 'i'),
      make: m => ({ kind: KIND.FLAT, min: num(m[1]), max: num(m[1]) }) }
];

/**
 * @param {string} price free text as written in the catalog
 * @returns {{kind:string, min?:number, max?:number, unit?:string}}
 */
export function parsePrice(price) {
    const text = String(price || '').trim();
    if (!text) return { kind: KIND.ESTIMATE };

    for (const { re, make } of MATCHERS) {
        const m = text.match(re);
        if (m) {
            const parsed = make(m);
            // A range that came out backwards is a typo in the catalog, not a
            // price. Swap rather than quote a negative spread.
            if (parsed.max !== null && parsed.max !== undefined && parsed.max < parsed.min) {
                const swap = parsed.min; parsed.min = parsed.max; parsed.max = swap;
            }
            return parsed;
        }
    }
    return { kind: KIND.ESTIMATE };
}

/* --------------------------------------------------------------------------
   Estimating
   -------------------------------------------------------------------------- */

/** Why a service could not be priced from an area. */
export const BLOCKED = {
    NO_COVERAGE: 'noCoverage',   // hourly, but nobody has said how fast the work goes
    NOT_BY_AREA: 'notByArea',    // flat or per-unit price: area changes nothing
    ESTIMATE:    'estimate'      // the catalog says "on estimate"
};

/**
 * @param {object} service  a catalog service ({ price, coverage })
 * @param {number} area     square metres
 * @returns {{
 *   ok: boolean, kind: string, blocked?: string,
 *   low?: number, high?: number, mid?: number, hours?: number,
 *   rate: object
 * }}
 */
export function estimate(service, area) {
    const rate = parsePrice(service && service.price);
    const m2 = Number(area);
    const hasArea = Number.isFinite(m2) && m2 > 0;

    if (rate.kind === KIND.ESTIMATE) {
        return { ok: false, kind: rate.kind, blocked: BLOCKED.ESTIMATE, rate };
    }

    if (rate.kind === KIND.PER_AREA) {
        if (!hasArea) return { ok: false, kind: rate.kind, rate };
        const low = rate.min * m2;
        const high = (rate.max ?? rate.min) * m2;
        return { ok: true, kind: rate.kind, low, high, mid: (low + high) / 2, rate };
    }

    if (rate.kind === KIND.HOURLY) {
        const coverage = Number(service && service.coverage);
        if (!Number.isFinite(coverage) || coverage <= 0) {
            return { ok: false, kind: rate.kind, blocked: BLOCKED.NO_COVERAGE, rate };
        }
        if (!hasArea) return { ok: false, kind: rate.kind, rate };
        const hours = m2 / coverage;
        const low = rate.min * hours;
        const high = (rate.max ?? rate.min) * hours;
        return { ok: true, kind: rate.kind, hours, low, high, mid: (low + high) / 2, rate };
    }

    // Flat, "from X", and per-unit prices do not move with floor area.
    return { ok: false, kind: rate.kind, blocked: BLOCKED.NOT_BY_AREA, rate };
}

/** Rounds a quote to whole euros; a range keeps its ends apart. */
export function roundQuote(value) {
    return Math.round(value);
}
