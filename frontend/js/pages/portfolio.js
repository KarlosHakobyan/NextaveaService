export function renderPortfolio() {
    const currentLang = localStorage.getItem('app_lang') || 'ru';

    const translations = {
        ru: {
            title: 'Выполненные объекты',
            subtitle: 'Реальные кейсы нашей команды по уборке, сборке и реставрации.',
            tag1: 'Клининг',
            card1Title: 'Генеральная уборка дома 120 м²',
            card1Desc: 'Глубокая очистка кухни, удаление налёта в сантехнике, влажная уборка всех комнат и мытье балкона.',
            card1Meta: '⏱ Срок выполнения: 5 часов (35 €/час)',
            tag2: 'Сборка мебели',
            card2Title: 'Сборка большой гардеробной и кровати',
            card2Desc: 'Сборка двуспальной кровати с подъёмным механизмом и установка модульного шкафа-купе с выравниванием дверей.',
            card2Meta: '⏱ Срок выполнения: 1 день',
            tag3: 'Реставрация',
            card3Title: 'Восстановление садовой скульптуры',
            card3Desc: 'Устранение сколов гипса, зачистка, грунтовка и нанесение защитного покрытия для скульптуры.',
            card3Meta: '⏱ Срок выполнения: 2 дня'
        },
        en: {
            title: 'Completed Projects',
            subtitle: 'Real case studies from our team in cleaning, assembly, and restoration.',
            tag1: 'Cleaning',
            card1Title: 'General Cleaning of a 120 m² House',
            card1Desc: 'Deep kitchen cleaning, limescale removal in plumbing, wet cleaning of all rooms, and balcony washing.',
            card1Meta: '⏱ Duration: 5 hours (35 €/hour)',
            tag2: 'Furniture Assembly',
            card2Title: 'Large Wardrobe & Bed Assembly',
            card2Desc: 'Assembly of a double bed with a lifting mechanism and installation of a modular wardrobe with door alignment.',
            card2Meta: '⏱ Duration: 1 day',
            tag3: 'Restoration',
            card3Title: 'Garden Sculpture Restoration',
            card3Desc: 'Repairing plaster chips, sanding, priming, and applying a protective coating to the sculpture.',
            card3Meta: '⏱ Duration: 2 days'
        },
        fr: {
            title: 'Réalisations',
            subtitle: 'Cas concrets de notre équipe en matière de nettoyage, montage et restauration.',
            tag1: 'Nettoyage',
            card1Title: 'Nettoyage général d’une maison de 120 m²',
            card1Desc: 'Nettoyage en profondeur de la cuisine, détartrage de la plomberie, nettoyage humide et lavage du balcon.',
            card1Meta: '⏱ Durée : 5 heures (35 €/heure)',
            tag2: 'Montage de meubles',
            card2Title: 'Montage d’un grand dressing et d’un lit',
            card2Desc: 'Montage d’un lit double avec mécanisme de relevage et installation d’une armoire modulable avec alignement des portes.',
            card2Meta: '⏱ Durée : 1 jour',
            tag3: 'Restauration',
            card3Title: 'Restauration de sculpture de jardin',
            card3Desc: 'Réparation des éclats de plâtre, ponçage, impression et application d’un revêtement de protection sur la sculpture.',
            card3Meta: '⏱ Durée : 2 jours'
        },
        it: {
            title: 'Progetti Completati',
            subtitle: 'Casi reali del nostro team in pulizie, montaggio e restauro.',
            tag1: 'Pulizia',
            card1Title: 'Pulizia generale di una casa di 120 m²',
            card1Desc: 'Pulizia profonda della cucina, rimozione del calcare dai sanitari, pulizia umida di tutte le stanze e lavaggio del balcone.',
            card1Meta: '⏱ Durata: 5 ore (35 €/ora)',
            tag2: 'Montaggio mobili',
            card2Title: 'Montaggio di grande guardaroba e letto',
            card2Desc: 'Montaggio di letto matrimoniale con meccanismo di sollevamento e installazione di armadio modulare con allineamento ante.',
            card2Meta: '⏱ Durata: 1 giorno',
            tag3: 'Restauro',
            card3Title: 'Restauro di scultura da giardino',
            card3Desc: 'Riparazione di scheggiature in gesso, carteggiatura, primer e applicazione di rivestimento protettivo per la scultura.',
            card3Meta: '⏱ Durata: 2 giorni'
        },
        es: {
            title: 'Proyectos Realizados',
            subtitle: 'Casos reales de nuestro equipo en limpieza, montaje y restauración.',
            tag1: 'Limpieza',
            card1Title: 'Limpieza general de una casa de 120 m²',
            card1Desc: 'Limpieza profunda de cocina, eliminación de cal en sanitarios, limpieza húmeda de todas las habitaciones y lavado de balcón.',
            card1Meta: '⏱ Duración: 5 horas (35 €/hora)',
            tag2: 'Montaje de muebles',
            card2Title: 'Montaje de gran vestidor y cama',
            card2Desc: 'Montaje de cama de matrimonio con mecanismo abatible e instalación de armario modular con alineación de puertas.',
            card2Meta: '⏱ Duración: 1 día',
            tag3: 'Restauración',
            card3Title: 'Restauración de escultura de jardín',
            card3Desc: 'Reparación de astillas de yeso, lijado, imprimación y aplicación de revestimiento protector en la escultura.',
            card3Meta: '⏱ Duración: 2 días'
        },
        de: {
            title: 'Ausgeführte Projekte',
            subtitle: 'Echte Fallbeispiele unseres Teams aus den Bereichen Reinigung, Montage und Restaurierung.',
            tag1: 'Reinigung',
            card1Title: 'Grundreinigung eines 120 m² Hauses',
            card1Desc: 'Tiefenreinigung der Küche, Kalkentfernung in Sanitäranlagen, Feuchtreinigung aller Räume und Balkonreinigung.',
            card1Meta: '⏱ Dauer: 5 Stunden (35 €/Std.)',
            tag2: 'Möbelmontage',
            card2Title: 'Montage einer großen Garderobe und eines Bettes',
            card2Desc: 'Montage eines Doppelbettes mit Hubmechanismus und Aufbau eines modularen Kleiderschranks mit Türjustierung.',
            card2Meta: '⏱ Dauer: 1 Tag',
            tag3: 'Restaurierung',
            card3Title: 'Wiederherstellung einer Gartenskulptur',
            card3Desc: 'Beseitigung von Gipsabplatzungen, Anschleifen, Grundieren und Auftragen einer Schutzschicht auf die Skulptur.',
            card3Meta: '⏱ Dauer: 2 Tage'
        },
        nl: {
            title: 'Voltooide projecten',
            subtitle: 'Echte casussen van ons team op het gebied van schoonmaak, montage en restauratie.',
            tag1: 'Schoonmaak',
            card1Title: 'Grote schoonmaak van een woning van 120 m²',
            card1Desc: 'Dieptereiniging van de keuken, kalk verwijderen in sanitair, natte reiniging van alle kamers en balkon wassen.',
            card1Meta: '⏱ Duur: 5 uur (35 €/uur)',
            tag2: 'Meubelmontage',
            card2Title: 'Montage van grote garderobe en bed',
            card2Desc: 'Montage van tweepersoonsbed met opbergmechanisme en installatie van modulaire kast met deurnaald-uitlijning.',
            card2Meta: '⏱ Duur: 1 dag',
            tag3: 'Restauratie',
            card3Title: 'Herstel van tuinsculptuur',
            card3Desc: 'Reparatie van gipsbeschadigingen, schuren, gronden en aanbrengen van een beschermende coating op hetbeeld.',
            card3Meta: '⏱ Duur: 2 dagen'
        }
    };

    const t = translations[currentLang] || translations.ru;

    const container = document.createElement('div');
    container.className = 'page-container page-portfolio';

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">${t.title}</h1>
            <p class="page-subtitle">${t.subtitle}</p>
        </div>

        <div class="portfolio-grid">
            <div class="portfolio-card">
                <span class="portfolio-tag">${t.tag1}</span>
                <h3>${t.card1Title}</h3>
                <p>${t.card1Desc}</p>
                <div class="portfolio-meta">${t.card1Meta}</div>
            </div>

            <div class="portfolio-card">
                <span class="portfolio-tag">${t.tag2}</span>
                <h3>${t.card2Title}</h3>
                <p>${t.card2Desc}</p>
                <div class="portfolio-meta">${t.card2Meta}</div>
            </div>

            <div class="portfolio-card">
                <span class="portfolio-tag">${t.tag3}</span>
                <h3>${t.card3Title}</h3>
                <p>${t.card3Desc}</p>
                <div class="portfolio-meta">${t.card3Meta}</div>
            </div>
        </div>
    `;

    return container;
}