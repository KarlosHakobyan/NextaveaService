export function renderPrices() {
    const lang = localStorage.getItem('app_lang') || 'ru';

    const translations = {
        ru: {
            title: 'Услуги и примерные цены',
            subtitle: 'Цены ориентировочные и могут меняться в зависимости от сложности работы, размера объекта и объёма услуг.',
            btnOrder: 'Заказать',
            popularBadge: 'Популярно',

            cleaningTitle: 'Уборка и клининг',
            cleaningPrice: 'от 30 €/час',
            cleaningList: [
                'Поддерживающая уборка: <strong>30-35 €/час</strong>',
                'Генеральная уборка: <strong>35-45 €/час</strong>',
                'Глубокая уборка: <strong>40-50 €/час</strong>',
                'Уборка после ремонта: <strong>4-10 €/м²</strong>',
                'Уборка после переезда: <strong>от 150 €</strong>',
                'Уборка перед сдачей/выездом: <strong>от 150 €</strong>',
                'Уборка офисов: <strong>25-35 €/час</strong>',
                'Мытьё окон: <strong>3-6 €/окно (30-45 €/ч)</strong>',
                'Балкон / терраса: <strong>от 30-80 €</strong>'
            ],

            furnitureTitle: 'Сборка и разборка мебели',
            furniturePrice: 'от 20 €',
            furnitureList: [
                'Сборка стула: <strong>от 20 €</strong>',
                'Сборка небольшого стола: <strong>от 30-50 €</strong>',
                'Сборка комода: <strong>от 40-70 €</strong>',
                'Сборка кровати: <strong>от 50-80 €</strong>',
                'Сборка шкафа: <strong>от 80-200 €</strong>',
                'Большой шкаф / гардеробная: <strong>по расчёту</strong>',
                'Разборка мебели: <strong>от 30-100 €</strong>',
                'Сборка/разборка при переезде: <strong>30-40 €/час</strong>'
            ],

            restorationTitle: 'Реставрация декора',
            restorationPrice: 'от 30 €',
            restorationList: [
                'Небольшой горшок / кашпо: <strong>от 30-50 €</strong>',
                'Средний декоративный горшок: <strong>от 50-100 €</strong>',
                'Небольшая скульптура: <strong>от 80-150 €</strong>',
                'Большая садовая/интерьерная: <strong>от 150 €</strong>',
                'Гипс, керамика: <strong>по расчёту</strong>',
                'Очистка и обновление декора: <strong>по расчёту</strong>'
            ],

            relocationTitle: 'Помощь при переезде',
            relocationPrice: 'от 30 €/час',
            relocationList: [
                'Помощь при переезде: <strong>30-40 €/час</strong>',
                'Сборка и разборка мебели: <strong>от 35 €/час</strong>',
                'Упаковка вещей: <strong>по расчёту</strong>',
                'Подготовка помещения: <strong>по расчёту</strong>',
                'Уборка после переезда: <strong>от 150 €</strong>'
            ]
        },
        en: {
            title: 'Services & Estimated Prices',
            subtitle: 'Prices are estimated and may vary depending on job complexity, property size, and service scope.',
            btnOrder: 'Book Now',
            popularBadge: 'Popular',

            cleaningTitle: 'Cleaning & Housekeeping',
            cleaningPrice: 'from 30 €/hr',
            cleaningList: [
                'Standard cleaning: <strong>30-35 €/hr</strong>',
                'Deep cleaning: <strong>35-45 €/hr</strong>',
                'Heavy-duty cleaning: <strong>40-50 €/hr</strong>',
                'Post-renovation cleaning: <strong>4-10 €/m²</strong>',
                'Post-move cleaning: <strong>from 150 €</strong>',
                'Pre-tenancy/Move-out cleaning: <strong>from 150 €</strong>',
                'Office cleaning: <strong>25-35 €/hr</strong>',
                'Window washing: <strong>3-6 €/window (30-45 €/hr)</strong>',
                'Balcony / Terrace: <strong>from 30-80 €</strong>'
            ],

            furnitureTitle: 'Furniture Assembly & Disassembly',
            furniturePrice: 'from 20 €',
            furnitureList: [
                'Chair assembly: <strong>from 20 €</strong>',
                'Small table assembly: <strong>from 30-50 €</strong>',
                'Dresser assembly: <strong>from 40-70 €</strong>',
                'Bed assembly: <strong>from 50-80 €</strong>',
                'Wardrobe assembly: <strong>from 80-200 €</strong>',
                'Walk-in wardrobe / closet: <strong>by estimate</strong>',
                'Furniture disassembly: <strong>from 30-100 €</strong>',
                'Assembly/disassembly for moves: <strong>30-40 €/hr</strong>'
            ],

            restorationTitle: 'Decor Restoration',
            restorationPrice: 'from 30 €',
            restorationList: [
                'Small pot / planter: <strong>from 30-50 €</strong>',
                'Medium decorative pot: <strong>from 50-100 €</strong>',
                'Small sculpture: <strong>from 80-150 €</strong>',
                'Large garden/interior figure: <strong>from 150 €</strong>',
                'Gypsum, ceramics: <strong>by estimate</strong>',
                'Decor cleaning & renewal: <strong>by estimate</strong>'
            ],

            relocationTitle: 'Relocation Assistance',
            relocationPrice: 'from 30 €/hr',
            relocationList: [
                'Moving assistance: <strong>30-40 €/hr</strong>',
                'Furniture assembly & disassembly: <strong>from 35 €/hr</strong>',
                'Item packing: <strong>by estimate</strong>',
                'Room preparation: <strong>by estimate</strong>',
                'Post-move cleaning: <strong>from 150 €</strong>'
            ]
        },
        fr: {
            title: 'Services et tarifs estimatifs',
            subtitle: 'Les prix sont indicatifs et peuvent varier selon la complexité des travaux et la superficie du local.',
            btnOrder: 'Commander',
            popularBadge: 'Populaire',

            cleaningTitle: 'Nettoyage et entretien',
            cleaningPrice: 'à partir de 30 €/h',
            cleaningList: [
                'Entretien régulier: <strong>30-35 €/h</strong>',
                'Nettoyage général: <strong>35-45 €/h</strong>',
                'Nettoyage en profondeur: <strong>40-50 €/h</strong>',
                'Nettoyage fin de chantier: <strong>4-10 €/m²</strong>',
                'Nettoyage après déménagement: <strong>à partir de 150 €</strong>',
                'Nettoyage état des lieux: <strong>à partir de 150 €</strong>',
                'Nettoyage de bureaux: <strong>25-35 €/h</strong>',
                'Lavage de vitres: <strong>3-6 €/fenêtre (30-45 €/h)</strong>',
                'Balcon / terrasse: <strong>de 30 à 80 €</strong>'
            ],

            furnitureTitle: 'Montage et démontage de meubles',
            furniturePrice: 'à partir de 20 €',
            furnitureList: [
                'Montage de chaise: <strong>à partir de 20 €</strong>',
                'Montage de petite table: <strong>de 30 à 50 €</strong>',
                'Montage de commode: <strong>de 40 à 70 €</strong>',
                'Montage de lit: <strong>de 50 à 80 €</strong>',
                'Montage d’armoire: <strong>de 80 à 200 €</strong>',
                'Grand dressing: <strong>sur devis</strong>',
                'Démontage de meubles: <strong>de 30 à 100 €</strong>',
                'Montage/démontage (déménagement): <strong>30-40 €/h</strong>'
            ],

            restorationTitle: 'Restauration de décorations',
            restorationPrice: 'à partir de 30 €',
            restorationList: [
                'Petit pot / cache-pot: <strong>de 30 à 50 €</strong>',
                'Pot décoratif moyen: <strong>de 50 à 100 €</strong>',
                'Petite sculpture: <strong>de 80 à 150 €</strong>',
                'Grande sculpture d’extérieur/intérieur: <strong>à partir de 150 €</strong>',
                'Plâtre, céramique: <strong>sur devis</strong>',
                'Nettoyage et rénovation de décorations: <strong>sur devis</strong>'
            ],

            relocationTitle: 'Aide au déménagement',
            relocationPrice: 'à partir de 30 €/h',
            relocationList: [
                'Aide au déménagement: <strong>30-40 €/h</strong>',
                'Montage et démontage de meubles: <strong>à partir de 35 €/h</strong>',
                'Emballage d’effets personnels: <strong>sur devis</strong>',
                'Préparation des locaux: <strong>sur devis</strong>',
                'Nettoyage après déménagement: <strong>à partir de 150 €</strong>'
            ]
        },
        it: {
            title: 'Servizi e prezzi indicativi',
            subtitle: 'I prezzi sono indicativi e possono variare in base alla complessità del lavoro, alle dimensioni del locale e al volume dei servizi.',
            btnOrder: 'Prenota',
            popularBadge: 'Popolare',

            cleaningTitle: 'Pulizia & Sanificazione',
            cleaningPrice: 'da 30 €/ora',
            cleaningList: [
                'Pulizia ordinaria: <strong>30-35 €/ora</strong>',
                'Pulizia generale: <strong>35-45 €/ora</strong>',
                'Pulizia profonda: <strong>40-50 €/ora</strong>',
                'Pulizia post-ristrutturazione: <strong>4-10 €/m²</strong>',
                'Pulizia post-trasloco: <strong>da 150 €</strong>',
                'Pulizia pre-consegna/fine locazione: <strong>da 150 €</strong>',
                'Pulizia uffici: <strong>25-35 €/ora</strong>',
                'Lavaggio finestre: <strong>3-6 €/finestra (30-45 €/ora)</strong>',
                'Balcone / terrazza: <strong>da 30-80 €</strong>'
            ],

            furnitureTitle: 'Montaggio & Smontaggio Mobili',
            furniturePrice: 'da 20 €',
            furnitureList: [
                'Montaggio sedia: <strong>da 20 €</strong>',
                'Montaggio tavolo piccolo: <strong>da 30-50 €</strong>',
                'Montaggio cassettiera: <strong>da 40-70 €</strong>',
                'Montaggio letto: <strong>da 50-80 €</strong>',
                'Montaggio armadio: <strong>da 80-200 €</strong>',
                'Armadio grande / cabina armadio: <strong>su preventivo</strong>',
                'Smontaggio mobili: <strong>da 30-100 €</strong>',
                'Montaggio/smontaggio per trasloco: <strong>30-40 €/ora</strong>'
            ],

            restorationTitle: 'Restauro Decorazioni',
            restorationPrice: 'da 30 €',
            restorationList: [
                'Vaso piccolo / portavaso: <strong>da 30-50 €</strong>',
                'Vaso decorativo medio: <strong>da 50-100 €</strong>',
                'Scultura piccola: <strong>da 80-150 €</strong>',
                'Scultura grande da giardino/interno: <strong>da 150 €</strong>',
                'Gesso, ceramica: <strong>su preventivo</strong>',
                'Pulizia e rinnovo decorazioni: <strong>su preventivo</strong>'
            ],

            relocationTitle: 'Assistenza al Trasloco',
            relocationPrice: 'da 30 €/ora',
            relocationList: [
                'Assistenza al trasloco: <strong>30-40 €/ora</strong>',
                'Montaggio e smontaggio mobili: <strong>da 35 €/ora</strong>',
                'Imballaggio effetti personali: <strong>su preventivo</strong>',
                'Preparazione locali: <strong>su preventivo</strong>',
                'Pulizia post-trasloco: <strong>da 150 €</strong>'
            ]
        },
        es: {
            title: 'Servicios y precios estimados',
            subtitle: 'Los precios son orientativos y pueden variar según la complejidad del trabajo, el tamaño del inmueble y el volumen del servicio.',
            btnOrder: 'Reservar',
            popularBadge: 'Popular',

            cleaningTitle: 'Limpieza y mantenimiento',
            cleaningPrice: 'desde 30 €/hora',
            cleaningList: [
                'Limpieza de mantenimiento: <strong>30-35 €/hora</strong>',
                'Limpieza general: <strong>35-45 €/hora</strong>',
                'Limpieza profunda: <strong>40-50 €/hora</strong>',
                'Limpieza fin de obra: <strong>4-10 €/m²</strong>',
                'Limpieza tras mudanza: <strong>desde 150 €</strong>',
                'Limpieza entrega/salida: <strong>desde 150 €</strong>',
                'Limpieza de oficinas: <strong>25-35 €/hora</strong>',
                'Limpieza de ventanas: <strong>3-6 €/ventana (30-45 €/h)</strong>',
                'Balcón / terraza: <strong>desde 30-80 €</strong>'
            ],

            furnitureTitle: 'Montaje y desmontaje de muebles',
            furniturePrice: 'desde 20 €',
            furnitureList: [
                'Montaje de silla: <strong>desde 20 €</strong>',
                'Montaje de mesa pequeña: <strong>desde 30-50 €</strong>',
                'Montaje de cómoda: <strong>desde 40-70 €</strong>',
                'Montaje de cama: <strong>desde 50-80 €</strong>',
                'Montaje de armario: <strong>desde 80-200 €</strong>',
                'Armario grande / vestidor: <strong>según presupuesto</strong>',
                'Desmontaje de muebles: <strong>desde 30-100 €</strong>',
                'Montaje/desmontaje en mudanza: <strong>30-40 €/hora</strong>'
            ],

            restorationTitle: 'Restauración de decoración',
            restorationPrice: 'desde 30 €',
            restorationList: [
                'Maceta pequeña / cubremaceta: <strong>desde 30-50 €</strong>',
                'Maceta decorativa mediana: <strong>desde 50-100 €</strong>',
                'Escultura pequeña: <strong>desde 80-150 €</strong>',
                'Escultura grande de jardín/interior: <strong>desde 150 €</strong>',
                'Yeso, cerámica: <strong>según presupuesto</strong>',
                'Limpieza y renovación de decoración: <strong>según presupuesto</strong>'
            ],

            relocationTitle: 'Ayuda con la mudanza',
            relocationPrice: 'desde 30 €/hora',
            relocationList: [
                'Asistencia en mudanza: <strong>30-40 €/hora</strong>',
                'Montaje y desmontaje de muebles: <strong>desde 35 €/hora</strong>',
                'Embalaje de enseres: <strong>según presupuesto</strong>',
                'Preparación del espacio: <strong>según presupuesto</strong>',
                'Limpieza tras mudanza: <strong>desde 150 €</strong>'
            ]
        },
        de: {
            title: 'Dienstleistungen und Richtpreise',
            subtitle: 'Die Preise sind Richtwerte und können je nach Arbeitsaufwand, Objektgröße und Leistungsumfang variieren.',
            btnOrder: 'Buchen',
            popularBadge: 'Beliebt',

            cleaningTitle: 'Reinigung & Haushalt',
            cleaningPrice: 'ab 30 €/Std.',
            cleaningList: [
                'Unterhaltsreinigung: <strong>30-35 €/Std.</strong>',
                'Grundreinigung: <strong>35-45 €/Std.</strong>',
                'Intensivreinigung: <strong>40-50 €/Std.</strong>',
                'Bauendreinigung: <strong>4-10 €/m²</strong>',
                'Reinigung nach Umzug: <strong>ab 150 €</strong>',
                'Übergabereinigung: <strong>ab 150 €</strong>',
                'Büroreinigung: <strong>25-35 €/Std.</strong>',
                'Fensterreinigung: <strong>3-6 €/Fenster (30-45 €/Std.)</strong>',
                'Balkon / Terrasse: <strong>ab 30-80 €</strong>'
            ],

            furnitureTitle: 'Möbelmontage & Demontage',
            furniturePrice: 'ab 20 €',
            furnitureList: [
                'Stuhlmontage: <strong>ab 20 €</strong>',
                'Montage kleiner Tisch: <strong>ab 30-50 €</strong>',
                'Kommodenmontage: <strong>ab 40-70 €</strong>',
                'Bettmontage: <strong>ab 50-80 €</strong>',
                'Schrankmontage: <strong>ab 80-200 €</strong>',
                'Großer Schrank / Ankleidezimmer: <strong>nach Angebot</strong>',
                'Möbeldemontage: <strong>ab 30-100 €</strong>',
                'Montage/Demontage beim Umzug: <strong>30-40 €/Std.</strong>'
            ],

            restorationTitle: 'Dekor-Restauration',
            restorationPrice: 'ab 30 €',
            restorationList: [
                'Kleiner Topf / Übertopf: <strong>ab 30-50 €</strong>',
                'Mittlerer Dekotopf: <strong>ab 50-100 €</strong>',
                'Kleine Skulptur: <strong>ab 80-150 €</strong>',
                'Große Garten-/Interieurfigur: <strong>ab 150 €</strong>',
                'Gips, Keramik: <strong>nach Angebot</strong>',
                'Reinigung & Auffrischung von Dekor: <strong>nach Angebot</strong>'
            ],

            relocationTitle: 'Umzugshilfe',
            relocationPrice: 'ab 30 €/Std.',
            relocationList: [
                'Umzugshilfe: <strong>30-40 €/Std.</strong>',
                'Möbelmontage/-demontage: <strong>ab 35 €/Std.</strong>',
                'Verpackungsservice: <strong>nach Angebot</strong>',
                'Raumvorbereitung: <strong>nach Angebot</strong>',
                'Reinigung nach Umzug: <strong>ab 150 €</strong>'
            ]
        },
        nl: {
            title: 'Diensten en richtprijzen',
            subtitle: 'Prijzen zijn indicatief en kunnen variëren afhankelijk van de complexiteit, oppervlakte en de omvang van het werk.',
            btnOrder: 'Bestellen',
            popularBadge: 'Populair',

            cleaningTitle: 'Schoonmaak & Reiniging',
            cleaningPrice: 'vanaf 30 €/uur',
            cleaningList: [
                'Standaard schoonmaak: <strong>30-35 €/uur</strong>',
                'Grote schoonmaak: <strong>35-45 €/uur</strong>',
                'Dieptereiniging: <strong>40-50 €/uur</strong>',
                'Schoonmaak na verbouwing: <strong>4-10 €/m²</strong>',
                'Schoonmaak na verhuizing: <strong>vanaf 150 €</strong>',
                'Opleveringsschoonmaak: <strong>vanaf 150 €</strong>',
                'Kantoorschoonmaak: <strong>25-35 €/uur</strong>',
                'Glazenwassen: <strong>3-6 €/raam (30-45 €/uur)</strong>',
                'Balkon / terras: <strong>vanaf 30-80 €</strong>'
            ],

            furnitureTitle: 'Meubelmontage & Demontage',
            furniturePrice: 'vanaf 20 €',
            furnitureList: [
                'Stoel monteren: <strong>vanaf 20 €</strong>',
                'Kleine tafel monteren: <strong>vanaf 30-50 €</strong>',
                'Ladekast monteren: <strong>vanaf 40-70 €</strong>',
                'Bed monteren: <strong>vanaf 50-80 €</strong>',
                'Kledingkast monteren: <strong>vanaf 80-200 €</strong>',
                'Grote kast / inloopkast: <strong>op offerte Basis</strong>',
                'Meubels demonteren: <strong>vanaf 30-100 €</strong>',
                'Montage/demontage bij verhuizing: <strong>30-40 €/uur</strong>'
            ],

            restorationTitle: 'Decoratierestauratie',
            restorationPrice: 'vanaf 30 €',
            restorationList: [
                'Kleine pot / bloempot: <strong>vanaf 30-50 €</strong>',
                'Middelgrote decoratieve pot: <strong>vanaf 50-100 €</strong>',
                'Klein beeld: <strong>vanaf 80-150 €</strong>',
                'Groot tuin-/interieurbeeld: <strong>vanaf 150 €</strong>',
                'Gips, keramiek: <strong>op offerte basis</strong>',
                'Decoratie reinigen en vernieuwen: <strong>op offerte basis</strong>'
            ],

            relocationTitle: 'Verhuisthulp',
            relocationPrice: 'vanaf 30 €/uur',
            relocationList: [
                'Verhuishulp: <strong>30-40 €/uur</strong>',
                'Meubelmontage en -demontage: <strong>vanaf 35 €/uur</strong>',
                'Inpakservice: <strong>op offerte basis</strong>',
                'Ruimte klaarmaken voor verhuizing: <strong>op offerte basis</strong>',
                'Schoonmaak na verhuizing: <strong>vanaf 150 €</strong>'
            ]
        }
    };

    const t = translations[lang] || translations.ru;

    const container = document.createElement('div');
    container.className = 'page-container page-prices';

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">${t.title}</h1>
            <p class="page-subtitle">${t.subtitle}</p>
        </div>

        <div class="prices-grid">
            <div class="price-card">
                <h3>${t.cleaningTitle}</h3>
                <div class="price-val">${t.cleaningPrice}</div>
                <ul>
                    ${t.cleaningList.map(item => `<li>${item}</li>`).join('')}
                </ul>
                <a href="#/contacts" class="btn-primary">${t.btnOrder}</a>
            </div>

            <div class="price-card featured">
                <div class="popular-badge">${t.popularBadge}</div>
                <h3>${t.furnitureTitle}</h3>
                <div class="price-val">${t.furniturePrice}</div>
                <ul>
                    ${t.furnitureList.map(item => `<li>${item}</li>`).join('')}
                </ul>
                <a href="#/contacts" class="btn-primary">${t.btnOrder}</a>
            </div>

            <div class="price-card">
                <h3>${t.restorationTitle}</h3>
                <div class="price-val">${t.restorationPrice}</div>
                <ul>
                    ${t.restorationList.map(item => `<li>${item}</li>`).join('')}
                </ul>
                <a href="#/contacts" class="btn-primary">${t.btnOrder}</a>
            </div>

            <div class="price-card">
                <h3>${t.relocationTitle}</h3>
                <div class="price-val">${t.relocationPrice}</div>
                <ul>
                    ${t.relocationList.map(item => `<li>${item}</li>`).join('')}
                </ul>
                <a href="#/contacts" class="btn-primary">${t.btnOrder}</a>
            </div>
        </div>
    `;

    return container;
}