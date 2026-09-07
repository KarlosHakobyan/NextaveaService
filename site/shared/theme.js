/* ==========================================================================
   Light and dark theme.

   Three states, not two. Until someone picks a side the site follows the
   operating system, so a visitor whose machine is set to dark gets a dark
   site without touching anything. Choosing light or dark pins it, and that
   choice is what gets remembered.

   The theme is applied as `data-theme` on <html>, which every stylesheet
   reads. Nothing else needs to know a theme exists.

   A matching inline snippet runs in each page's <head> so the correct
   colours are in place before first paint. Without it the page renders light
   and then flips, which is worse than having no dark mode at all.
   ========================================================================== */

import { KEYS, readPref, writePref, clearPref, onPrefChange } from './prefs.js';

export const LIGHT  = 'light';
export const DARK   = 'dark';
export const SYSTEM = 'system';

const query = window.matchMedia('(prefers-color-scheme: dark)');

/** What the operating system is asking for right now. */
export function systemTheme() {
    return query.matches ? DARK : LIGHT;
}

/** The stored choice: light, dark, or system when nothing is pinned. */
export function themeChoice() {
    const stored = readPref(KEYS.THEME);
    return stored === LIGHT || stored === DARK ? stored : SYSTEM;
}

/** The theme actually on screen, with `system` resolved to a real value. */
export function activeTheme() {
    const choice = themeChoice();
    return choice === SYSTEM ? systemTheme() : choice;
}

function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Lets the browser paint form controls, scrollbars and caret to match.
    document.documentElement.style.colorScheme = theme;
    window.dispatchEvent(new CustomEvent('nx:themechange', { detail: { theme } }));
}

export function setTheme(choice) {
    if (choice === SYSTEM) clearPref(KEYS.THEME);
    else writePref(KEYS.THEME, choice);
    apply(activeTheme());
}

/** Flips to the opposite of what is currently on screen. */
export function toggleTheme() {
    const next = activeTheme() === DARK ? LIGHT : DARK;
    setTheme(next);
    return next;
}

/**
 * Applies the current theme and keeps it in step with the system setting and
 * with other open tabs. Safe to call more than once.
 */
export function initTheme() {
    apply(activeTheme());

    // Only follow the system while nothing is pinned.
    query.addEventListener('change', () => {
        if (themeChoice() === SYSTEM) apply(systemTheme());
    });

    // A change in another tab should reach this one.
    onPrefChange(key => {
        if (key === KEYS.THEME) apply(activeTheme());
    });
}

/* --------------------------------------------------------------------------
   Toggle control

   One builder for both the public header and the console rail. The caller
   supplies the class names so each surface keeps its own look, while the
   behaviour, the label and the accessibility wiring stay identical.
   -------------------------------------------------------------------------- */

const SUN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.2"/>
    <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"/></svg>`;

const MOON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z"/></svg>`;

/**
 * @param {object} options
 * @param {string} options.className   classes for the button itself
 * @param {string} [options.labelClass] when set, a text label is rendered too
 * @param {string} [options.toDark]    title shown when clicking turns it dark
 * @param {string} [options.toLight]   title shown when clicking turns it light
 * @param {string} [options.darkLabel]  visible label while the dark theme is on
 * @param {string} [options.lightLabel] visible label while the light theme is on
 * @returns {HTMLButtonElement}
 */
export function createThemeToggle({
    className,
    labelClass,
    toDark = 'Switch to dark theme',
    toLight = 'Switch to light theme',
    darkLabel = 'Light',
    lightLabel = 'Dark'
} = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;

    function paint() {
        const dark = activeTheme() === DARK;
        const title = dark ? toLight : toDark;
        button.innerHTML = (dark ? SUN : MOON)
            + (labelClass ? `<span class="${labelClass}">${dark ? darkLabel : lightLabel}</span>` : '');
        button.setAttribute('title', title);
        button.setAttribute('aria-label', title);
        button.setAttribute('aria-pressed', String(dark));
    }

    button.addEventListener('click', () => toggleTheme());
    window.addEventListener('nx:themechange', paint);
    paint();

    return button;
}
