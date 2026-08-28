export function renderHome() {
    const currentLang = localStorage.getItem('app_lang') || 'ru';

    const translations = {
        ru: {
            heroBadge: '✨ Сервис услуг для дома и помещений',
            title1: 'Клининг, сборка мебели,',
            title2: 'реставрация и переезды',
            subtitle: 'Возьмём на себя бытовые задачи любой сложности. Быстрый выезд специалистов, прозрачные тарифы в евро и аккуратное исполнение.',
            btnOrder: 'Заказать услугу',
            btnAll: 'Смотреть все услуги →',
            stat1Num: '500+',
            stat1Desc: 'Выполненных заказов',
            stat2Num: '4.9 ★',
            stat2Desc: 'Средний рейтинг',
            stat3Num: '15 мин',
            stat3Desc: 'Расчёт стоимости',
            sectionTitle: 'Основные направления',
            feat1Badge: 'от 30 €/час',
            feat1Title: 'Уборка & Клининг',
            feat1Desc: 'Поддерживающая, генеральная, глубокая уборка и мытье окон для дома и офиса.',
            feat1Link: 'Перейти в клининг →',
            feat2Badge: 'от 20 €',
            feat2Title: 'Сборка & Разборка мебели',
            feat2Desc: 'Сборка столов, стульев, комодов, кроватей и сложных гардеробных систем.',
            feat2Link: 'Вызвать мастера →',
            feat3Badge: '30-40 €/час',
            feat3Title: 'Помощь при переезде',
            feat3Desc: 'Упаковка вещей, помощь с погрузкой, демонтаж мебели и уборка после переезда.',
            feat3Link: 'Узнать подробнее →',
            feat4Badge: 'от 30 €',
            feat4Title: 'Реставрация декора',
            feat4Desc: 'Реставрация и восстановление горшков, кашпо, скульптур и других декоративных изделий из гипса и керамики.',
            feat4Link: 'Узнать подробнее →'
        },
        en: {
            heroBadge: '✨ Home & Indoor Services',
            title1: 'Cleaning, Furniture Assembly,',
            title2: 'Restoration & Relocation',
            subtitle: 'We take care of household tasks of any complexity. Fast dispatch of specialists, transparent Euro rates, and neat execution.',
            btnOrder: 'Book a Service',
            btnAll: 'View All Services →',
            stat1Num: '500+',
            stat1Desc: 'Completed Orders',
            stat2Num: '4.9 ★',
            stat2Desc: 'Average Rating',
            stat3Num: '15 min',
            stat3Desc: 'Cost Calculation',
            sectionTitle: 'Main Categories',
            feat1Badge: 'from 30 €/hour',
            feat1Title: 'Cleaning Services',
            feat1Desc: 'Maintenance, general, deep cleaning, and window washing for home and office.',
            feat1Link: 'Go to Cleaning →',
            feat2Badge: 'from 20 €',
            feat2Title: 'Furniture Assembly',
            feat2Desc: 'Assembly of tables, chairs, dressers, beds, and complex wardrobe systems.',
            feat2Link: 'Call a Specialist →',
            feat3Badge: '30-40 €/hour',
            feat3Title: 'Relocation Assistance',
            feat3Desc: 'Item packing, loading help, furniture dismantling, and post-move cleanup.',
            feat3Link: 'Learn More →',
            feat4Badge: 'from 30 €',
            feat4Title: 'Decor Restoration',
            feat4Desc: 'Restoration and repair of pots, planters, sculptures, and other plaster and ceramic items.',
            feat4Link: 'Learn More →'
        },
        fr: {
            heroBadge: '✨ Services pour la maison et les locaux',
            title1: 'Nettoyage, Montage de meubles,',
            title2: 'Restauration et Déménagement',
            subtitle: 'Nous prenons en charge les tâches ménagères de toute complexité. Intervention rapide, tarifs transparents en euros et exécution soignée.',
            btnOrder: 'Commander un service',
            btnAll: 'Voir tous les services →',
            stat1Num: '500+',
            stat1Desc: 'Commandes réalisées',
            stat2Num: '4.9 ★',
            stat2Desc: 'Note moyenne',
            stat3Num: '15 min',
            stat3Desc: 'Calcul du coût',
            sectionTitle: 'Principaux domaines',
            feat1Badge: 'dès 30 €/heure',
            feat1Title: 'Nettoyage & Entretien',
            feat1Desc: 'Nettoyage régulier, général, en profondeur et lavage de vitres pour maison et bureau.',
            feat1Link: 'Voir le nettoyage →',
            feat2Badge: 'dès 20 €',
            feat2Title: 'Montage & Démontage de meubles',
            feat2Desc: 'Montage de tables, chaises, commodes, lits et systèmes de dressing complexes.',
            feat2Link: 'Appeler un artisan →',
            feat3Badge: '30-40 €/heure',
            feat3Title: 'Aide au déménagement',
            feat3Desc: 'Emballage, aide au chargement, démontage de meubles et nettoyage après déménagement.',
            feat3Link: 'En savoir plus →',
            feat4Badge: 'dès 30 €',
            feat4Title: 'Restauration de décors',
            feat4Desc: 'Restauration et réparation de pots, cache-pots, sculptures et autres objets en plâtre et céramique.',
            feat4Link: 'En savoir plus →'
        },
        it: {
            heroBadge: '✨ Servizi per la casa e gli ambienti',
            title1: 'Pulizie, Montaggio mobili,',
            title2: 'Restauro e Traslochi',
            subtitle: 'Ci occupiamo di compiti domestici di qualsiasi complessità. Intervento rapido, tariffe trasparenti in euro e esecuzione accurata.',
            btnOrder: 'Prenota un servizio',
            btnAll: 'Tutti i servizi →',
            stat1Num: '500+',
            stat1Desc: 'Ordini completati',
            stat2Num: '4.9 ★',
            stat2Desc: 'Valutazione media',
            stat3Num: '15 min',
            stat3Desc: 'Calcolo preventivo',
            sectionTitle: 'Aree principali',
            feat1Badge: 'da 30 €/ora',
            feat1Title: 'Pulizia & Sanificazione',
            feat1Desc: 'Pulizie ordinarie, generali, profonde e lavaggio vetri per case e uffici.',
            feat1Link: 'Vai alle pulizie →',
            feat2Badge: 'da 20 €',
            feat2Title: 'Montaggio & Smontaggio mobili',
            feat2Desc: 'Montaggio di tavoli, sedie, cassettiere, letti e sistemi di armadi complessi.',
            feat2Link: 'Chiama un tecnico →',
            feat3Badge: '30-40 €/ora',
            feat3Title: 'Assistenza traslochi',
            feat3Desc: 'Imballaggio, aiuto carico, smontaggio mobili e pulizie post-trasloco.',
            feat3Link: 'Scopri di più →',
            feat4Badge: 'da 30 €',
            feat4Title: 'Restauro decorazioni',
            feat4Desc: 'Restauro e riparazione di vasi, portapiante, sculture e altri oggetti in gesso e ceramica.',
            feat4Link: 'Scopri di più →'
        },
        es: {
            heroBadge: '✨ Servicios para el hogar y espacios',
            title1: 'Limpieza, Montaje de muebles,',
            title2: 'Restauración y Mudanzas',
            subtitle: 'Nos encargamos de tareas del hogar de cualquier complejidad. Desplazamiento rápido, tarifas transparentes en euros y ejecución impecable.',
            btnOrder: 'Pedir servicio',
            btnAll: 'Ver todos los servicios →',
            stat1Num: '500+',
            stat1Desc: 'Pedidos realizados',
            stat2Num: '4.9 ★',
            stat2Desc: 'Valoración media',
            stat3Num: '15 min',
            stat3Desc: 'Cálculo de costo',
            sectionTitle: 'Principales áreas',
            feat1Badge: 'desde 30 €/hora',
            feat1Title: 'Limpieza y Aseo',
            feat1Desc: 'Limpieza de mantenimiento, general, profunda y lavado de cristales para hogares y oficinas.',
            feat1Link: 'Ir a limpieza →',
            feat2Badge: 'desde 20 €',
            feat2Title: 'Montaje y Desmontaje de muebles',
            feat2Desc: 'Montaje de mesas, sillas, cómodas, camas y sistemas de armarios complejos.',
            feat2Link: 'Llamar a un maestro →',
            feat3Badge: '30-40 €/hora',
            feat3Title: 'Ayuda en mudanzas',
            feat3Desc: 'Empaquetado, ayuda con la carga, desmontaje de muebles y limpieza posterior.',
            feat3Link: 'Saber más →',
            feat4Badge: 'desde 30 €',
            feat4Title: 'Restauración de decoración',
            feat4Desc: 'Restauración y reparación de macetas, esculturas y otros elementos decorativos de yeso y cerámica.',
            feat4Link: 'Saber más →'
        },
        de: {
            heroBadge: '✨ Haus- und Raumraddienste',
            title1: 'Reinigung, Möbelmontage,',
            title2: 'Restaurierung & Umzüge',
            subtitle: 'Wir übernehmen Haushaltsaufgaben jeder Komplexität. Schneller Einsatz von Spezialisten, transparente Tarife in Euro und saubere Ausführung.',
            btnOrder: 'Dienstleistung buchen',
            btnAll: 'Alle Dienstleistungen →',
            stat1Num: '500+',
            stat1Desc: 'Erfolgreiche Aufträge',
            stat2Num: '4.9 ★',
            stat2Desc: 'Durchschnittliche Bewertung',
            stat3Num: '15 Min',
            stat3Desc: 'Kostenberechnung',
            sectionTitle: 'Hauptbereiche',
            feat1Badge: 'ab 30 €/Std.',
            feat1Title: 'Reinigung & Gebäudedienste',
            feat1Desc: 'Unterhalts-, Grund- und Intensivreinigung sowie Fensterputzen für Haus und Büro.',
            feat1Link: 'Zur Reinigung →',
            feat2Badge: 'ab 20 €',
            feat2Title: 'Möbelmontage & -demontage',
            feat2Desc: 'Montage von Tischen, Stühlen, Kommoden, Betten und komplexen Schranksystemen.',
            feat2Link: 'Handwerker rufen →',
            feat3Badge: '30-40 €/Std.',
            feat3Title: 'Umzugshilfe',
            feat3Desc: 'Verpacken von Sachen, Ladehilfe, Möbeldemontage und Endreinigung.',
            feat3Link: 'Mehr erfahren →',
            feat4Badge: 'ab 30 €',
            feat4Title: 'Dekorationsrestaurierung',
            feat4Desc: 'Restaurierung und Reparatur von Töpfen, Übertöpfen, Skulpturen und anderen Gips- und Keramikwaren.',
            feat4Link: 'Mehr erfahren →'
        },
        nl: {
            heroBadge: '✨ Diensten voor huis en panden',
            title1: 'Schoonmaak, Meubelmontage,',
            title2: 'Restauratie & Verhuizingen',
            subtitle: 'Wij nemen huishoudelijke taken van elke complexiteit over. Snelle inzet van specialisten, transparante tarieven in euro’s en nette uitvoering.',
            btnOrder: 'Bestel dienst',
            btnAll: 'Bekijk alle diensten →',
            stat1Num: '500+',
            stat1Desc: 'Voltooide opdrachten',
            stat2Num: '4.9 ★',
            stat2Desc: 'Gemiddelde beoordeling',
            stat3Num: '15 min',
            stat3Desc: 'Kostenberekening',
            sectionTitle: 'Belangrijkste categorieën',
            feat1Badge: 'vanaf 30 €/uur',
            feat1Title: 'Schoonmaak',
            feat1Desc: 'Onderhouds-, grote en dieptereiniging plus glazenwasserij voor huis en kantoor.',
            feat1Link: 'Naar schoonmaak →',
            feat2Badge: 'vanaf 20 €',
            feat2Title: 'Meubelmontage & -demontage',
            feat2Desc: 'Montage van tafels, stoelen, dressoirs, bedden en complexe kastenwanden.',
            feat2Link: 'Vakman inschakelen →',
            feat3Badge: '30-40 €/uur',
            feat3Title: 'Verhuishulp',
            feat3Desc: 'Spullen inpakken, laadhulp, meubels demonteren en opruimen na de verhuizing.',
            feat3Link: 'Meer informatie →',
            feat4Badge: 'vanaf 30 €',
            feat4Title: 'Decorrestauratie',
            feat4Desc: 'Restauratie en herstel van potten, plantenbakken, beelden en andere gips- en keramische objecten.',
            feat4Link: 'Meer informatie →'
        }
    };

    const t = translations[currentLang] || translations.ru;

    const container = document.createElement('div');
    container.className = 'page-container page-home';

    container.innerHTML = `
        <section class="hero-section">
            <div class="hero-badge">${t.heroBadge}</div>
            <h1 class="page-title">${t.title1}<br><span>${t.title2}</span></h1>
            <p class="page-subtitle">
                ${t.subtitle}
            </p>
            <div class="hero-actions">
                <a href="#/contacts" class="btn-primary">${t.btnOrder}</a>
                <a href="#/services" class="btn-secondary">${t.btnAll}</a>
            </div>

            <div class="hero-stats">
                <div class="stat-item">
                    <span class="stat-num">${t.stat1Num}</span>
                    <span class="stat-desc">${t.stat1Desc}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-num">${t.stat2Num}</span>
                    <span class="stat-desc">${t.stat2Desc}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-num">${t.stat3Num}</span>
                    <span class="stat-desc">${t.stat3Desc}</span>
                </div>
            </div>
        </section>

        <section class="features-section">
            <h2 class="section-title">${t.sectionTitle}</h2>
            <div class="features-grid">
                
                <div class="feature-card">
                    <div class="feature-img-wrapper">
                        <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80" alt="Уборка и клининг" class="feature-img">
                        <span class="feature-badge">${t.feat1Badge}</span>
                    </div>
                    <div class="feature-body">
                        <h3>${t.feat1Title}</h3>
                        <p>${t.feat1Desc}</p>
                        <a href="#/services" class="feature-link">${t.feat1Link}</a>
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-img-wrapper">
                        <img src="https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=600&q=80" alt="Сборка мебели" class="feature-img">
                        <span class="feature-badge">${t.feat2Badge}</span>
                    </div>
                    <div class="feature-body">
                        <h3>${t.feat2Title}</h3>
                        <p>${t.feat2Desc}</p>
                        <a href="#/services" class="feature-link">${t.feat2Link}</a>
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-img-wrapper">
                        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" alt="Помощь при переезде" class="feature-img">
                        <span class="feature-badge">${t.feat3Badge}</span>
                    </div>
                    <div class="feature-body">
                        <h3>${t.feat3Title}</h3>
                        <p>${t.feat3Desc}</p>
                        <a href="#/services" class="feature-link">${t.feat3Link}</a>
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-img-wrapper">
                        <img src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80" alt="Реставрация декора" class="feature-img">
                        <span class="feature-badge">${t.feat4Badge}</span>
                    </div>
                    <div class="feature-body">
                        <h3>${t.feat4Title}</h3>
                        <p>${t.feat4Desc}</p>
                        <a href="#/services" class="feature-link">${t.feat4Link}</a>
                    </div>
                </div>

            </div>
        </section>
    `;

    return container;
}