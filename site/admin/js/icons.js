/* ==========================================================================
   Icons: placeholders.

   Every icon in the console comes through icon(name). To swap the real set
   in later, replace the path data in PATHS below and nothing else: no markup
   changes, no class changes, no page touches.

   Rules for replacements: 24x24 viewBox, stroke-based, `currentColor`, so
   each icon inherits the colour of whatever it sits in.
   ========================================================================== */

const PATHS = {
    dashboard:  '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    requests:   '<path d="M4 4h16v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 9h8M8 13h5"/>',
    catalog:    '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="10" cy="18" r="1.6"/>',
    portfolio:  '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>',
    calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8"/><path d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01"/>',
    logs:       '<path d="M5 4h14v16l-3-2-2 2-2-2-2 2-2-2-3 2Z"/><path d="M9 9h6M9 13h4"/>',
    settings:   '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6"/>',
    search:     '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    close:      '<path d="M6 6l12 12M18 6 6 18"/>',
    plus:       '<path d="M12 5v14M5 12h14"/>',
    edit:       '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17Z"/><path d="m15 6 3 3"/>',
    trash:      '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"/>',
    refresh:    '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
    up:         '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down:       '<path d="M12 5v14M6 13l6 6 6-6"/>',
    phone:      '<path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"/>',
    pin:        '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    key:        '<circle cx="8" cy="14" r="4"/><path d="m11 11 9-9M17 5l2 2M14 8l2 2"/>',
    inbox:      '<path d="M4 13h4l2 3h4l2-3h4"/><path d="M6 4h12l3 9v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z"/>',
    upload:     '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    check:      '<path d="m5 12 5 5L19 7"/>'
};

/**
 * Returns an SVG string for `name`. Unknown names render a neutral square
 * rather than nothing, so a missing icon is visible instead of silent.
 */
export function icon(name) {
    const d = PATHS[name] || '<rect x="5" y="5" width="14" height="14" rx="2"/>';
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true" focusable="false">${d}</svg>`;
}
