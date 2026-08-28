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
            <p>&copy; ${new Date().getFullYear()} Karlos Hakobyan. ${rightsText}</p>
        </div>
    `;
    return footer;
}