// Country picker + number box for the order form.
//
// This is a custom combobox rather than a <select> for one reason: no browser
// renders an <img> inside an <option>, so flags force the widget to be built
// by hand. That means the keyboard and screen-reader behaviour a native select
// gives for free has to be provided here — arrows, Home/End, type-to-filter,
// Escape, aria-activedescendant — or this is worse than the plain input it
// replaces.
//
// The country table is ~90KB and the router imports every page up front, so it
// is loaded on demand instead: the field renders immediately with the default
// country baked in, and the list arrives a moment later.

import { composePhone, detectCountry, stripDialPrefix, digitsOf } from '../validation/phoneNumber.js';

// Enough to paint the closed field before the table has loaded. Kept in step
// with data/countries.js by a test.
const FALLBACK = { iso: 'AM', dial: '+374', names: { en: 'Armenia' } };

function esc(value) {
    return String(value).replace(/[&<>"]/g, (ch) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]
    ));
}

// Matches on country name, ISO code or dial code, so "arm", "am", "+374" and
// "374" all find Armenia.
//
// Ranking matters as much as matching. Plain substring order puts Guernsey
// above the United Kingdom for "+44", and Finland above the Netherlands for
// "nl" — because "Finland" contains those two letters. Lower score sorts
// first; ties keep the alphabetical order the list was built in.
export const NO_MATCH = 99;

export function score(country, query, lang) {
    if (!query) return 0;

    const q = query.toLowerCase().trim();
    const bare = q.replace(/^\+/, '');
    const name = (country.names[lang] || country.names.en).toLowerCase();
    const iso = country.iso.toLowerCase();
    const dial = country.dial.replace('+', '');
    const looksNumeric = /^\d+$/.test(bare);

    if (iso === q) return 0;                                   // "nl" -> Netherlands
    if (looksNumeric && dial === bare) {
        // "+44" -> the United Kingdom, not Guernsey. detectCountry already
        // knows which country owns a shared code, so reuse that judgement.
        const owner = detectCountry('+' + bare);
        return owner && owner.iso === country.iso ? 1 : 2;
    }
    if (name.startsWith(q)) return 3;                          // "georg" -> Georgia
    if (looksNumeric && dial.startsWith(bare)) return 4;
    if (name.includes(q)) return 5;
    if (iso.includes(q)) return 6;
    return NO_MATCH;
}

/** Ranked search over an already-sorted country list. */
export function filterCountries(countries, query, lang) {
    return countries
        .map((c) => ({ c, rank: score(c, String(query || '').trim(), lang) }))
        .filter((entry) => entry.rank !== NO_MATCH)
        .sort((a, b) => a.rank - b.rank)      // stable: ties stay alphabetical
        .map((entry) => entry.c);
}

/**
 * @param {object}   options
 * @param {Element}  options.host       element to render into
 * @param {string}   options.lang       current site locale
 * @param {object}   options.strings    localised copy
 * @param {string}   options.placeholder for the number box
 * @param {function} options.onInput    called whenever the number changes
 */
export function createPhoneField({ host, lang, strings: t, placeholder, onInput }) {
    let countries = [];
    let byIso = new Map();
    let flagSrc = (iso) => `assets/vendor/flags/${iso.toLowerCase()}.svg`;
    let selected = FALLBACK;
    let open = false;
    let active = -1;
    let filtered = [];

    host.innerHTML = `
        <div class="phone-field">
            <button type="button" class="phone-country" id="phone-country"
                    aria-haspopup="listbox" aria-expanded="false"
                    aria-label="${esc(t.countryLabel)}">
                <img class="phone-flag" src="${flagSrc(FALLBACK.iso)}" alt="" width="20" height="15">
                <span class="phone-dial">${FALLBACK.dial}</span>
                <span class="phone-caret" aria-hidden="true"></span>
            </button>
            <input class="phone-number" type="tel" id="of-phone"
                   autocomplete="tel-national" placeholder="${esc(placeholder)}"
                   aria-describedby="err-phone">
            <!-- The visible box deliberately has no name: only the joined
                 value below is submitted, so the backend sees one phone. -->
            <input type="hidden" name="phone">

            <div class="phone-pop" id="phone-pop" hidden>
                <input class="phone-search" type="text" id="phone-search"
                       autocomplete="off" placeholder="${esc(t.searchPlaceholder)}"
                       aria-label="${esc(t.searchPlaceholder)}"
                       aria-controls="phone-list" aria-autocomplete="list">
                <ul class="phone-list" id="phone-list" role="listbox"
                    aria-label="${esc(t.countryLabel)}"></ul>
                <p class="phone-empty" id="phone-empty" hidden>${esc(t.noMatches)}</p>
            </div>
        </div>
    `;

    const wrap = host.querySelector('.phone-field');
    const button = host.querySelector('#phone-country');
    const flagEl = host.querySelector('.phone-flag');
    const dialEl = host.querySelector('.phone-dial');
    const numberEl = host.querySelector('.phone-number');
    const hiddenEl = host.querySelector('input[name="phone"]');
    const pop = host.querySelector('#phone-pop');
    const search = host.querySelector('#phone-search');
    const list = host.querySelector('#phone-list');
    const emptyEl = host.querySelector('#phone-empty');

    function syncHidden() {
        // The form only ever submits the joined value; the two visible
        // controls are an editing convenience.
        hiddenEl.value = composePhone(selected.dial, numberEl.value);
        if (onInput) onInput(hiddenEl.value);
    }

    function paintButton() {
        flagEl.src = flagSrc(selected.iso);
        flagEl.alt = '';
        dialEl.textContent = selected.dial;
        button.setAttribute('aria-label', `${t.countryLabel}: ${selected.names[lang] || selected.names.en}`);
    }

    function select(country, { focusNumber = true } = {}) {
        selected = country;
        paintButton();
        syncHidden();
        close();
        if (focusNumber) numberEl.focus();
    }

    function renderList() {
        filtered = filterCountries(countries, search.value, lang);

        list.innerHTML = filtered.map((c, i) => `
            <li class="phone-option${c.iso === selected.iso ? ' is-selected' : ''}"
                id="phone-opt-${c.iso}" role="option" data-iso="${c.iso}"
                aria-selected="${c.iso === selected.iso ? 'true' : 'false'}">
                <img class="phone-flag" src="${flagSrc(c.iso)}" alt="" width="20" height="15" loading="lazy">
                <span class="phone-option-name">${esc(c.names[lang] || c.names.en)}</span>
                <span class="phone-option-dial">${c.dial}</span>
            </li>
        `).join('');

        emptyEl.hidden = filtered.length > 0;
        active = filtered.findIndex((c) => c.iso === selected.iso);
        if (active < 0 && filtered.length) active = 0;
        paintActive();
    }

    function paintActive() {
        const items = list.querySelectorAll('.phone-option');
        items.forEach((el, i) => el.classList.toggle('is-active', i === active));
        const current = items[active];
        if (current) {
            search.setAttribute('aria-activedescendant', current.id);
            current.scrollIntoView({ block: 'nearest' });
        } else {
            search.removeAttribute('aria-activedescendant');
        }
    }

    function move(step) {
        if (!filtered.length) return;
        active = (active + step + filtered.length) % filtered.length;
        paintActive();
    }

    async function openList() {
        if (open) return;
        await ensureLoaded();
        open = true;
        pop.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        search.value = '';
        renderList();
        search.focus();
        document.addEventListener('click', onDocumentClick, true);
    }

    function close() {
        if (!open) return;
        open = false;
        pop.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        search.removeAttribute('aria-activedescendant');
        document.removeEventListener('click', onDocumentClick, true);
    }

    function onDocumentClick(e) {
        if (!wrap.contains(e.target)) close();
    }

    let loading = null;
    function ensureLoaded() {
        if (loading) return loading;
        loading = import('../data/countries.js').then((mod) => {
            countries = [...mod.COUNTRIES].sort((a, b) => {
                // The default country first; everything else alphabetically in
                // the visitor's own language, which is not ASCII order.
                if (a.iso === mod.DEFAULT_ISO) return -1;
                if (b.iso === mod.DEFAULT_ISO) return 1;
                return (a.names[lang] || a.names.en)
                    .localeCompare(b.names[lang] || b.names.en, lang);
            });
            byIso = mod.BY_ISO;
            flagSrc = mod.flagSrc;
            const real = byIso.get(selected.iso);
            if (real) { selected = real; paintButton(); }
        }).catch(() => {
            // Offline or a missing file: the field still works, it just cannot
            // offer the list. The typed number is unaffected.
            countries = [];
        });
        return loading;
    }

    button.addEventListener('click', () => (open ? close() : openList()));

    search.addEventListener('input', renderList);

    search.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Home') { e.preventDefault(); active = 0; paintActive(); }
        else if (e.key === 'End') { e.preventDefault(); active = filtered.length - 1; paintActive(); }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[active]) select(filtered[active]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            close();
            button.focus();
        } else if (e.key === 'Tab') {
            close();
        }
    });

    list.addEventListener('click', (e) => {
        const option = e.target.closest('.phone-option');
        if (!option) return;
        const country = countries.find((c) => c.iso === option.dataset.iso);
        if (country) select(country);
    });

    numberEl.addEventListener('input', async () => {
        const typed = numberEl.value;

        // Pasting a full international number should move the picker rather
        // than leaving a contradiction on screen.
        if (typed.trim().startsWith('+')) {
            await ensureLoaded();
            const guess = detectCountry(typed);
            if (guess) {
                selected = guess;
                paintButton();
                numberEl.value = stripDialPrefix(typed, guess);
            }
        }
        syncHidden();
    });

    numberEl.addEventListener('keydown', (e) => {
        // Down-arrow from the number box is the conventional way into a
        // combobox list.
        if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); openList(); }
    });

    paintButton();
    syncHidden();
    // Warm the table in the background so the first click opens instantly.
    ensureLoaded();

    return {
        get value() { return hiddenEl.value; },
        focus() { numberEl.focus(); },
        reset() {
            numberEl.value = '';
            const fallback = byIso.get(FALLBACK.iso) || FALLBACK;
            selected = fallback;
            paintButton();
            syncHidden();
        },
        destroy() {
            document.removeEventListener('click', onDocumentClick, true);
        }
    };
}
