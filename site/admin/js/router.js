/* ==========================================================================
   Router.

   Five sections, hash-based, same approach as the public site. A page
   returns an element straight away and loads its own data into it, so
   navigation never blocks on the network.

   A page may attach a `destroy` function to the element it returns. The
   router calls it before swapping the page out. That is how the request
   drawer's Leaflet instance and its window listeners get cleaned up.
   ========================================================================== */

import { render as renderDashboard } from './pages/dashboard.js';
import { render as renderRequests }  from './pages/requests.js';
import { render as renderCalculator } from './pages/calculator.js';
import { render as renderCatalog }   from './pages/catalog.js';
import { render as renderPortfolio } from './pages/portfolio.js';
import { render as renderLogs }      from './pages/logs.js';
import { render as renderSettings }  from './pages/settings.js';
import { t } from './i18n.js';

/* Labels are read through t() at module load, which is after i18n has picked
   up the stored language, so the rail and the page titles agree. */
export const ROUTES = [
    { id: 'dashboard', path: '/',          icon: 'dashboard', label: t('nav.today'),     title: t('title.today'),     render: renderDashboard },
    { id: 'requests',  path: '/requests',  icon: 'requests',  label: t('nav.requests'),  title: t('title.requests'),  render: renderRequests },
    { id: 'calculator', path: '/calculator', icon: 'calculator', label: t('nav.calculator'), title: t('title.calculator'), render: renderCalculator },
    { id: 'catalog',   path: '/catalog',   icon: 'catalog',   label: t('nav.catalog'),   title: t('title.catalog'),   render: renderCatalog },
    { id: 'portfolio', path: '/portfolio', icon: 'portfolio', label: t('nav.portfolio'), title: t('title.portfolio'), render: renderPortfolio },
    { id: 'logs',      path: '/logs',      icon: 'logs',      label: t('nav.logs'),      title: t('title.logs'),      render: renderLogs },
    { id: 'settings',  path: '/settings',  icon: 'settings',  label: t('nav.settings'),  title: t('title.settings'),  render: renderSettings }
];

/** '#/requests/142' → { route: requests, params: { id: '142' } } */
export function resolve(hash) {
    const path = (hash || '').replace(/^#/, '') || '/';
    const segments = path.split('/').filter(Boolean);
    const base = segments.length ? `/${segments[0]}` : '/';
    const route = ROUTES.find(r => r.path === base) || ROUTES[0];
    return { route, params: { id: segments[1] || null } };
}

export function navigate(path) {
    if (window.location.hash === `#${path}`) return;
    window.location.hash = path;
}

/** Replaces the hash without pushing a history entry. Used by the drawer. */
export function replaceHash(path) {
    const url = `${window.location.pathname}${window.location.search}#${path}`;
    window.history.replaceState(null, '', url);
}

export function initRouter(mount, onRouteChange) {
    let current = null;

    function handle() {
        const { route, params } = resolve(window.location.hash);

        // A deep link inside the same section (opening a request) must not
        // tear the page down and rebuild it.
        if (current && current.routeId === route.id) {
            if (current.node.onParams) current.node.onParams(params);
            onRouteChange(route, params);
            return;
        }

        if (current && typeof current.node.destroy === 'function') current.node.destroy();

        const node = route.render(params);
        mount.replaceChildren(node);
        current = { routeId: route.id, node };
        onRouteChange(route, params);
        window.scrollTo(0, 0);
    }

    window.addEventListener('hashchange', handle);
    handle();

    return { refresh: handle };
}
