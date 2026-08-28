export function renderHeader() {
    const currentLang = localStorage.getItem('app_lang') || 'ru';

    const translations = {
        ru: {
            home: 'Главная',
            services: 'Услуги',
            portfolio: 'Наши работы',
            prices: 'Цены',
            about: 'О нас',
            btnRequest: 'Оставить заявку'
        },
        en: {
            home: 'Home',
            services: 'Services',
            portfolio: 'Portfolio',
            prices: 'Prices',
            about: 'About Us',
            btnRequest: 'Book Now'
        },
        fr: {
            home: 'Accueil',
            services: 'Services',
            portfolio: 'Portfolio',
            prices: 'Tarifs',
            about: 'À propos',
            btnRequest: 'Demander un devis'
        },
        it: {
            home: 'Home',
            services: 'Servizi',
            portfolio: 'Portfolio',
            prices: 'Prezzi',
            about: 'Chi siamo',
            btnRequest: 'Richiedi un servizio'
        },
        es: {
            home: 'Inicio',
            services: 'Servicios',
            portfolio: 'Portfolio',
            prices: 'Precios',
            about: 'Sobre nosotros',
            btnRequest: 'Reservar'
        },
        de: {
            home: 'Startseite',
            services: 'Leistungen',
            portfolio: 'Portfolio',
            prices: 'Preise',
            about: 'Über uns',
            btnRequest: 'Buchen'
        },
        nl: {
            home: 'Home',
            services: 'Diensten',
            portfolio: 'Portfolio',
            prices: 'Prijzen',
            about: 'Over ons',
            btnRequest: 'Boeken'
        }
    };

    const t = translations[currentLang] || translations.ru;

    const header = document.createElement('header');
    header.innerHTML = `
        <div class="header-container">
            <a href="#/" class="logo">Business<span>Services</span></a>
            <nav>
                <a href="#/">${t.home}</a>
                <a href="#/services">${t.services}</a>
                <a href="#/portfolio">${t.portfolio}</a>
                <a href="#/prices">${t.prices}</a>
                <a href="#/about">${t.about}</a>
                <a href="#/contacts" class="btn-nav">${t.btnRequest}</a>
                
                <select id="lang-select" style="
                    background: #0f172a;
                    color: #ffffff;
                    border: 1px solid #38bdf8;
                    border-radius: 6px;
                    padding: 4px 8px;
                    font-size: 14px;
                    cursor: pointer;
                    margin-left: 8px;
                ">
                    <option value="ru" ${currentLang === 'ru' ? 'selected' : ''}>RU</option>
                    <option value="en" ${currentLang === 'en' ? 'selected' : ''}>EN</option>
                    <option value="fr" ${currentLang === 'fr' ? 'selected' : ''}>FR</option>
                    <option value="it" ${currentLang === 'it' ? 'selected' : ''}>IT</option>
                    <option value="es" ${currentLang === 'es' ? 'selected' : ''}>ES</option>
                    <option value="de" ${currentLang === 'de' ? 'selected' : ''}>DE</option>
                    <option value="nl" ${currentLang === 'nl' ? 'selected' : ''}>NL</option>
                </select>
            </nav>
        </div>
    `;

    const langSelect = header.querySelector('#lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            localStorage.setItem('app_lang', e.target.value);
            window.location.reload();
        });
    }

    return header;
}

export function renderFooter() {
    const currentLang = localStorage.getItem('app_lang') || 'ru';

    const rightsMap = {
        ru: 'Все права защищены.',
        en: 'All rights reserved.',
        fr: 'Tous droits réservés.',
        it: 'Tutti i diritti riservati.',
        es: 'Todos los derechos reservados.',
        de: 'Alle Rechte vorbehalten.',
        nl: 'Alle rechten voorbehouden.'
    };
    const rightsText = rightsMap[currentLang] || rightsMap.ru;

    const footer = document.createElement('footer');
    footer.innerHTML = `
        <div class="footer-content">
            <p>&copy; ${new Date().getFullYear()} BusinessServices. (C) Karlos Hakobyan. ${rightsText}</p>
        </div>
    `;
    return footer;
}

function getCategoryBadge(category) {
    const currentLang = localStorage.getItem('app_lang') || 'ru';

    const badges = {
        cleaning: {
            ru: 'Клининг', en: 'Cleaning', fr: 'Nettoyage', it: 'Pulizia', es: 'Limpieza', de: 'Reinigung', nl: 'Schoonmaak',
            class: 'badge-cleaning'
        },
        furniture: {
            ru: 'Мебель', en: 'Furniture', fr: 'Mobilier', it: 'Mobili', es: 'Muebles', de: 'Möbel', nl: 'Meubels',
            class: 'badge-montage'
        },
        restoration: {
            ru: 'Реставрация', en: 'Restoration', fr: 'Restauration', it: 'Restauro', es: 'Restauración', de: 'Restaurierung', nl: 'Restauratie',
            class: 'badge-repair'
        },
        relocation: {
            ru: 'Переезд', en: 'Relocation', fr: 'Déménagement', it: 'Trasloco', es: 'Mudanza', de: 'Umzug', nl: 'Verhuizing',
            class: 'badge-cleaning'
        }
    };

    const item = badges[category] || {
        ru: 'Услуга', en: 'Service', fr: 'Service', it: 'Servizio', es: 'Servicio', de: 'Dienstleistung', nl: 'Dienst',
        class: 'badge-cleaning'
    };

    return {
        label: item[currentLang] || item.ru,
        class: item.class
    };
}

function getIconForService(category) {
    const icons = {
        'cleaning': '✨',
        'furniture': '🪑',
        'restoration': '🎨',
        'relocation': '📦'
    };
    return icons[category] || '🛠️';
}

export function renderServiceCard(service) {
    const currentLang = localStorage.getItem('app_lang') || 'ru';

    const orderBtnText = {
        ru: 'Заказать',
        en: 'Order',
        fr: 'Commander',
        it: 'Ordina',
        es: 'Pedir',
        de: 'Bestellen',
        nl: 'Bestellen'
    };
    const btnText = orderBtnText[currentLang] || orderBtnText.ru;

    const card = document.createElement('div');
    card.className = 'service-card';
    
    const badge = getCategoryBadge(service.category);
    const icon = getIconForService(service.category);

    card.innerHTML = `
        <div class="card-header">
            <span class="service-icon" style="font-size: 1.5rem;">${icon}</span>
            <span class="badge ${badge.class}">${badge.label}</span>
        </div>
        <h3 class="service-title">${service.title}</h3>
        <p class="service-desc">${service.description}</p>
        <div class="card-footer">
            <span class="service-price">${service.price}</span>
            <a href="#/contacts" class="btn-card">${btnText}</a>
        </div>
    `;
    return card;
}