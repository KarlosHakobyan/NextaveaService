import { renderHome } from './pages/home.js';
import { renderServices } from './pages/services.js';
import { renderPortfolio } from './pages/portfolio.js';
import { renderPrices } from './pages/prices.js';
import { renderAbout } from './pages/about.js';
import { renderContacts } from './pages/contacts.js';

const routes = {
    '/': renderHome,
    '/services': renderServices,
    '/portfolio': renderPortfolio,
    '/prices': renderPrices,
    '/about': renderAbout,
    '/contacts': renderContacts
};

function updateActiveNavLink(path) {
    const navLinks = document.querySelectorAll('header nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${path}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

export function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const renderPage = routes[hash] || routes['/'];
    
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = '';
        mainContent.appendChild(renderPage());
        window.scrollTo(0, 0);
        updateActiveNavLink(hash);
    }
}

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}