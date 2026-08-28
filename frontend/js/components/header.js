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
            <a href="#" class="logo">Business<span>Services</span></a>
            <nav>
                <a href="#">${t.home}</a>
                <a href="#services">${t.services}</a>
                <a href="#portfolio">${t.portfolio}</a>
                <a href="#prices">${t.prices}</a>
                <a href="#about">${t.about}</a>
                <a href="#contacts" class="btn-nav">${t.btnRequest}</a>
                
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