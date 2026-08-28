function getCategoryBadge(category) {
    const currentLang = localStorage.getItem('app_lang') || 'ru';

    const badges = {
        'repair': {
            ru: 'Ремонт', en: 'Repair', fr: 'Réparation', it: 'Riparazione', es: 'Reparación', de: 'Reparatur', nl: 'Reparatie',
            class: 'badge-repair'
        },
        'cleaning': {
            ru: 'Клининг', en: 'Cleaning', fr: 'Nettoyage', it: 'Pulizia', es: 'Limpieza', de: 'Reinigung', nl: 'Schoonmaak',
            class: 'badge-cleaning'
        },
        'montage': {
            ru: 'Монтаж', en: 'Montage', fr: 'Montage', it: 'Montaggio', es: 'Montaje', de: 'Montage', nl: 'Montage',
            class: 'badge-montage'
        }
    };

    const item = badges[category] || {
        ru: 'Услуга', en: 'Service', fr: 'Service', it: 'Servizio', es: 'Servicio', de: 'Dienstleistung', nl: 'Dienst',
        class: ''
    };

    return {
        label: item[currentLang] || item.ru,
        class: item.class
    };
}

function getIconForService(category) {
    const icons = {
        'repair': '🧱',
        'cleaning': '✨',
        'montage': '🔧'
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
            <span class="service-icon">${icon}</span>
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