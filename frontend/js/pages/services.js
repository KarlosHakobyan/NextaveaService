import { renderServiceCard } from '../components/index.js';

const mockServicesData = {
    ru: [
        // УБОРКА И КЛИНИНГ
        { id: 1, title: 'Поддерживающая уборка квартир и домов', category: 'cleaning', price: '30-35 €/час', description: 'Регулярная поддержание чистоты, пылесос, влажная уборка поверхностей и сантехники.' },
        { id: 2, title: 'Генеральная уборка', category: 'cleaning', price: '35-45 €/час', description: 'Тщательная очистка всех труднодоступных мест, кухонного гарнитура и бытовой техники.' },
        { id: 3, title: 'Глубокая уборка', category: 'cleaning', price: '40-50 €/час', description: 'Максимально подробная дезинфекция и глубокое удаление застарелых загрязнений.' },
        { id: 4, title: 'Уборка после ремонта', category: 'cleaning', price: '4-10 €/м²', description: 'Удаление строительной пыли, следов красок, затирки и цемента.' },
        { id: 5, title: 'Уборка после переезда', category: 'cleaning', price: 'от 150 €', description: 'Полная уборка помещения после выезда и транспортировки вещей.' },
        { id: 6, title: 'Уборка перед сдачей или после выезда жильцов', category: 'cleaning', price: 'от 150 €', description: 'Комплексная подготовка объекта к новым арендаторам.' },
        { id: 7, title: 'Уборка офисов и коммерческих помещений', category: 'cleaning', price: '25-35 €/час', description: 'Поддержание порядка на рабочих местах, в зонах отдыха и с/у.' },
        { id: 8, title: 'Мытьё окон', category: 'cleaning', price: '3-6 € за окно / 30-45 €/час', description: 'Профессиональная мойка рам, стёкол и подоконников.' },
        { id: 9, title: 'Уборка балкона или террасы', category: 'cleaning', price: 'от 30-80 €', description: 'Очистка балконов, лоджий и террас от пыли и загрязнений.' },

        // СБОРКА И РАЗБОРКА МЕБЕЛИ
        { id: 10, title: 'Сборка стула', category: 'furniture', price: 'от 20 €', description: 'Сборка барных, офисных и кухонных стульев.' },
        { id: 11, title: 'Сборка небольшого стола', category: 'furniture', price: 'от 30-50 €', description: 'Сборка журнальных, письменных и обеденных столов.' },
        { id: 12, title: 'Сборка комода', category: 'furniture', price: 'от 40-70 €', description: 'Сборка каркаса, установка и регулировка выдвижных ящиков.' },
        { id: 13, title: 'Сборка кровати', category: 'furniture', price: 'от 50-80 €', description: 'Сборка основания, изголовья и подъемных механизмов.' },
        { id: 14, title: 'Сборка шкафа', category: 'furniture', price: 'от 80-200 €', description: 'Сборка корпуса, установка дверей и настройка фурнитуры.' },
        { id: 15, title: 'Большой шкаф / гардеробная', category: 'furniture', price: 'по предварительному расчёту', description: 'Монтаж сложной модульной мебели и гардеробных систем.' },
        { id: 16, title: 'Разборка мебели', category: 'furniture', price: 'от 30-100 €', description: 'Аккуратный демонтаж мебели перед транспортировкой или ремонтом.' },
        { id: 17, title: 'Сборка и разборка мебели при переезде', category: 'furniture', price: '30-40 €/час', description: 'Оперативные работы по сборке/разборке в процессе переезда.' },

        // РЕСТАВРАЦИЯ ДЕКОРАТИВНЫХ ИЗДЕЛИЙ
        { id: 18, title: 'Реставрация небольшого горшка или кашпо', category: 'restoration', price: 'от 30-50 €', description: 'Восстановление мелких трещин, сколов и покраска.' },
        { id: 19, title: 'Реставрация среднего декоративного горшка', category: 'restoration', price: 'от 50-100 €', description: 'Восстановление целостности и декоративного слоя.' },
        { id: 20, title: 'Восстановление небольшой декоративной скульптуры', category: 'restoration', price: 'от 80-150 €', description: 'Точечная реставрация и укрепительные работы.' },
        { id: 21, title: 'Реставрация большой садовой или интерьерной скульптуры', category: 'restoration', price: 'от 150 €', description: 'Комплексное обновление крупногабаритных фигур.' },
        { id: 22, title: 'Сложная реставрация изделий из гипса, керамики и других материалов', category: 'restoration', price: 'по предварительному расчёту', description: 'Индивидуальное восстановление ценных и хрупких изделий.' },
        { id: 23, title: 'Очистка, подготовка и обновление декоративных изделий', category: 'restoration', price: 'по предварительному расчёту', description: 'Профессиональная бережная очистка и нанесение защитных покрытий.' },

        // ПОМОЩЬ ПРИ ПЕРЕЕЗДЕ
        { id: 24, title: 'Помощь при переезде', category: 'relocation', price: '30-40 €/час', description: 'Погрузочно-разгрузочные работы и сопровождение переезда.' },
        { id: 25, title: 'Сборка и разборка мебели при переезде', category: 'relocation', price: 'от 35 €/час', description: 'Подготовка мебели к перевозке и её сборка на новом месте.' },
        { id: 26, title: 'Упаковка вещей', category: 'relocation', price: 'по предварительному расчёту', description: 'Безопасная упаковывание коробок и хрупких предметов.' },
        { id: 27, title: 'Подготовка помещения к переезду', category: 'relocation', price: 'по предварительному расчёту', description: 'Освобождение комнат, расстановка и организация пространства.' },
        { id: 28, title: 'Уборка после переезда', category: 'relocation', price: 'от 150 €', description: 'Чистка и уборка помещения после выноса всех вещей.' }
    ],
    en: [
        // CLEANING
        { id: 1, title: 'Standard Cleaning for Apartments & Houses', category: 'cleaning', price: '30-35 €/hr', description: 'Regular maintenance cleaning, vacuuming, wet wiping of surfaces and plumbing.' },
        { id: 2, title: 'Deep Cleaning', category: 'cleaning', price: '35-45 €/hr', description: 'Thorough cleaning of hard-to-reach places, kitchen sets, and home appliances.' },
        { id: 3, title: 'Heavy-Duty Deep Cleaning', category: 'cleaning', price: '40-50 €/hr', description: 'Detailed disinfection and deep removal of stubborn stains.' },
        { id: 4, title: 'Post-Renovation Cleaning', category: 'cleaning', price: '4-10 €/m²', description: 'Removal of construction dust, paint marks, grout, and cement.' },
        { id: 5, title: 'Post-Move Cleaning', category: 'cleaning', price: 'from 150 €', description: 'Full room cleaning after move-out and item transportation.' },
        { id: 6, title: 'Pre-Tenancy / Move-Out Cleaning', category: 'cleaning', price: 'from 150 €', description: 'Comprehensive property preparation for new tenants.' },
        { id: 7, title: 'Office & Commercial Cleaning', category: 'cleaning', price: '25-35 €/hr', description: 'Maintaining order in workplaces, lounge areas, and restrooms.' },
        { id: 8, title: 'Window Washing', category: 'cleaning', price: '3-6 € per window / 30-45 €/hr', description: 'Professional cleaning of frames, glass, and sills.' },
        { id: 9, title: 'Balcony or Terrace Cleaning', category: 'cleaning', price: 'from 30-80 €', description: 'Cleaning balconies, loggias, and terraces from dust and dirt.' },

        // FURNITURE ASSEMBLY
        { id: 10, title: 'Chair Assembly', category: 'furniture', price: 'from 20 €', description: 'Assembly of bar, office, and kitchen chairs.' },
        { id: 11, title: 'Small Table Assembly', category: 'furniture', price: 'from 30-50 €', description: 'Assembly of coffee, writing, and dining tables.' },
        { id: 12, title: 'Dresser / Chest of Drawers Assembly', category: 'furniture', price: 'from 40-70 €', description: 'Frame assembly, installation, and adjustment of drawers.' },
        { id: 13, title: 'Bed Assembly', category: 'furniture', price: 'from 50-80 €', description: 'Assembly of base, headboard, and lifting mechanisms.' },
        { id: 14, title: 'Wardrobe Assembly', category: 'furniture', price: 'from 80-200 €', description: 'Carcass assembly, door installation, and hardware adjustment.' },
        { id: 15, title: 'Large Closet / Walk-in Wardrobe', category: 'furniture', price: 'by individual estimate', description: 'Installation of complex modular furniture and wardrobe systems.' },
        { id: 16, title: 'Furniture Disassembly', category: 'furniture', price: 'from 30-100 €', description: 'Careful disassembly of furniture before transport or renovation.' },
        { id: 17, title: 'Furniture Assembly & Disassembly (Moving)', category: 'furniture', price: '30-40 €/hr', description: 'Quick assembly/disassembly during the moving process.' },

        // RESTORATION
        { id: 18, title: 'Restoration of Small Pots & Planters', category: 'restoration', price: 'from 30-50 €', description: 'Repair of minor cracks, chips, and painting.' },
        { id: 19, title: 'Restoration of Medium Decorative Pots', category: 'restoration', price: 'from 50-100 €', description: 'Restoration of structural integrity and decorative finish.' },
        { id: 20, title: 'Restoration of Small Decorative Sculptures', category: 'restoration', price: 'from 80-150 €', description: 'Targeted restoration and strengthening work.' },
        { id: 21, title: 'Restoration of Large Garden / Interior Sculptures', category: 'restoration', price: 'from 150 €', description: 'Comprehensive restoration of large figures.' },
        { id: 22, title: 'Complex Restoration of Gypsum & Ceramics', category: 'restoration', price: 'by individual estimate', description: 'Custom restoration of valuable and fragile items.' },
        { id: 23, title: 'Cleaning & Renewal of Decorative Items', category: 'restoration', price: 'by individual estimate', description: 'Professional gentle cleaning and protective coating application.' },

        // RELOCATION
        { id: 24, title: 'Moving Assistance', category: 'relocation', price: '30-40 €/hr', description: 'Loading, unloading, and full moving support.' },
        { id: 25, title: 'Furniture Assembly/Disassembly for Moves', category: 'relocation', price: 'from 35 €/hr', description: 'Preparing furniture for transport and assembly at new location.' },
        { id: 26, title: 'Packing Services', category: 'relocation', price: 'by individual estimate', description: 'Safe packing of boxes and fragile items.' },
        { id: 27, title: 'Room Preparation for Moving', category: 'relocation', price: 'by individual estimate', description: 'Clearing rooms, arranging, and space organization.' },
        { id: 28, title: 'Post-Move Cleaning', category: 'relocation', price: 'from 150 €', description: 'Cleaning and clearing space after moving all belongings out.' }
    ],
    fr: [
        // NETTOYAGE
        { id: 1, title: 'Nettoyage entretien (appartements et maisons)', category: 'cleaning', price: '30-35 €/h', description: 'Entretien régulier, passage de l’aspirateur, nettoyage humide des surfaces et sanitaires.' },
        { id: 2, title: 'Nettoyage général', category: 'cleaning', price: '35-45 €/h', description: 'Nettoyage minutieux de toutes les zones difficiles d’accès, de la cuisine et de l’électroménager.' },
        { id: 3, title: 'Nettoyage en profondeur', category: 'cleaning', price: '40-50 €/h', description: 'Désinfection complète et élimination des taches tenaces.' },
        { id: 4, title: 'Nettoyage après travaux', category: 'cleaning', price: '4-10 €/m²', description: 'Élimination de la poussière de chantier, traces de peinture, joint et ciment.' },
        { id: 5, title: 'Nettoyage après déménagement', category: 'cleaning', price: 'à partir de 150 €', description: 'Nettoyage complet du logement après le départ et le transport des meubles.' },
        { id: 6, title: 'Nettoyage état des lieux (entrée/sortie)', category: 'cleaning', price: 'à partir de 150 €', description: 'Préparation complète du bien pour les nouveaux locataires.' },
        { id: 7, title: 'Nettoyage de bureaux et locaux commerciaux', category: 'cleaning', price: '25-35 €/h', description: 'Maintien de la propreté des espaces de travail, espaces détente et sanitaires.' },
        { id: 8, title: 'Lavage de vitres', category: 'cleaning', price: '3-6 € par vitre / 30-45 €/h', description: 'Lavage professionnel des châssis, vitres et rebords de fenêtres.' },
        { id: 9, title: 'Nettoyage de balcon ou terrasse', category: 'cleaning', price: 'de 30 à 80 €', description: 'Dépoussiérage et nettoyage complet des balcons, loggias et terrasses.' },

        // MONTAGE DE MEUBLES
        { id: 10, title: 'Montage de chaise', category: 'furniture', price: 'à partir de 20 €', description: 'Montage de chaises de bar, de bureau et de cuisine.' },
        { id: 11, title: 'Montage de petite table', category: 'furniture', price: 'de 30 à 50 €', description: 'Montage de tables basses, bureaux et tables à manger.' },
        { id: 12, title: 'Montage de commode', category: 'furniture', price: 'de 40 à 70 €', description: 'Assemblage de la structure, pose et ajustement des tiroirs.' },
        { id: 13, title: 'Montage de lit', category: 'furniture', price: 'de 50 à 80 €', description: 'Montage du sommier, de la tête de lit et des mécanismes de levage.' },
        { id: 14, title: 'Montage d’armoire', category: 'furniture', price: 'de 80 à 200 €', description: 'Assemblage du caisson, pose des portes et réglage de la quincaillerie.' },
        { id: 15, title: 'Grande armoire / Dressing modulable', category: 'furniture', price: 'sur devis', description: 'Montage de systèmes de rangement complexes et dressings sur mesure.' },
        { id: 16, title: 'Démontage de meubles', category: 'furniture', price: 'de 30 à 100 €', description: 'Démontage soigné avant transport ou rénovation.' },
        { id: 17, title: 'Montage et démontage pendant le déménagement', category: 'furniture', price: '30-40 €/h', description: 'Services rapides d’assemblage/démontage lors d’un déménagement.' },

        // RESTAURATION
        { id: 18, title: 'Restauration de petit pot ou cache-pot', category: 'restoration', price: 'de 30 à 50 €', description: 'Réparation de petites fissures, éclats et mise en peinture.' },
        { id: 19, title: 'Restauration de pot décoratif moyen', category: 'restoration', price: 'de 50 à 100 €', description: 'Restauration de la structure et de la finition décorative.' },
        { id: 20, title: 'Restauration de petite sculpture décorative', category: 'restoration', price: 'de 80 à 150 €', description: 'Restauration ciblée et renforcement des zones fragilisées.' },
        { id: 21, title: 'Restauration de grande sculpture de jardin ou d’intérieur', category: 'restoration', price: 'à partir de 150 €', description: 'Rénovation complète de pièces de grande taille.' },
        { id: 22, title: 'Restauration complexe (plâtre, céramique, etc.)', category: 'restoration', price: 'sur devis', description: 'Restauration sur mesure d’objets précieux et fragiles.' },
        { id: 23, title: 'Nettoyage et rénovation d’objets décoratifs', category: 'restoration', price: 'sur devis', description: 'Nettoyage doux professionnel et application de revêtements protecteurs.' },

        // DÉMÉNAGEMENT
        { id: 24, title: 'Aide au déménagement', category: 'relocation', price: '30-40 €/h', description: 'Manutention, chargement, déchargement et accompagnement.' },
        { id: 25, title: 'Montage et démontage pour déménagement', category: 'relocation', price: 'à partir de 35 €/h', description: 'Préparation des meubles au transport et re-montage sur le nouveau site.' },
        { id: 26, title: 'Service d’emballage', category: 'relocation', price: 'sur devis', description: 'Emballage sécurisé des cartons et objets fragiles.' },
        { id: 27, title: 'Préparation des locaux au déménagement', category: 'relocation', price: 'sur devis', description: 'Dégagement des pièces, rangement et organisation de l’espace.' },
        { id: 28, title: 'Nettoyage après déménagement', category: 'relocation', price: 'à partir de 150 €', description: 'Remise en état et nettoyage après enlèvement complet des effets.' }
    ],
    it: [
        // PULIZIA
        { id: 1, title: 'Pulizia ordinaria per appartamenti e case', category: 'cleaning', price: '30-35 €/ora', description: 'Mantenimento regolare della pulizia, aspirapolvere, lavaggio superfici e sanitari.' },
        { id: 2, title: 'Pulizia generale', category: 'cleaning', price: '35-45 €/ora', description: 'Pulizia accurata di punti difficili da raggiungere, cucina ed elettrodomestici.' },
        { id: 3, title: 'Pulizia profonda', category: 'cleaning', price: '40-50 €/ora', description: 'Disinfezione completa e rimozione profonda dello sporco ostinato.' },
        { id: 4, title: 'Pulizia post-ristrutturazione', category: 'cleaning', price: '4-10 €/m²', description: 'Rimozione di polvere da cantiere, tracce di pittura, stucco e cemento.' },
        { id: 5, title: 'Pulizia post-trasloco', category: 'cleaning', price: 'da 150 €', description: 'Pulizia completa dei locali dopo il rilascio e il trasporto degli effetti.' },
        { id: 6, title: 'Pulizia pre-consegna o fine locazione', category: 'cleaning', price: 'da 150 €', description: 'Preparazione completa dell’immobile per i nuovi inquilini.' },
        { id: 7, title: 'Pulizia uffici e locali commerciali', category: 'cleaning', price: '25-35 €/ora', description: 'Gestione dell’ordine nelle postazioni di lavoro, aree relax e servizi.' },
        { id: 8, title: 'Lavaggio finestre', category: 'cleaning', price: '3-6 € a finestra / 30-45 €/ora', description: 'Pulizia professionale di telai, vetri e davanzali.' },
        { id: 9, title: 'Pulizia balcone o terrazza', category: 'cleaning', price: 'da 30-80 €', description: 'Pulizia di balconi, logge e terrazze da polvere e sporcizia.' },

        // MONTAGGIO MOBILI
        { id: 10, title: 'Montaggio sedia', category: 'furniture', price: 'da 20 €', description: 'Montaggio di sedie da bar, da ufficio e da cucina.' },
        { id: 11, title: 'Montaggio tavolo piccolo', category: 'furniture', price: 'da 30-50 €', description: 'Montaggio di tavolini da salotto, scrivanie e tavoli da pranzo.' },
        { id: 12, title: 'Montaggio cassettiera', category: 'furniture', price: 'da 40-70 €', description: 'Montaggio della struttura, installazione e regolazione dei cassetti.' },
        { id: 13, title: 'Montaggio letto', category: 'furniture', price: 'da 50-80 €', description: 'Montaggio di rete, testiera e meccanismi di sollevamento.' },
        { id: 14, title: 'Montaggio armadio', category: 'furniture', price: 'da 80-200 €', description: 'Assemblaggio della struttura, installazione ante e regolazione cerniere.' },
        { id: 15, title: 'Armadio grande / Cabina armadio', category: 'furniture', price: 'su preventivo', description: 'Montaggio di sistemi di arredo modulari complessi e cabine armadio.' },
        { id: 16, title: 'Smontaggio mobili', category: 'furniture', price: 'da 30-100 €', description: 'Smontaggio accurato dei mobili prima del trasporto o della ristrutturazione.' },
        { id: 17, title: 'Montaggio e smontaggio mobili durante il trasloco', category: 'furniture', price: '30-40 €/ora', description: 'Interventi rapidi di montaggio/smontaggio durante le fasi del trasloco.' },

        // RESTAURO
        { id: 18, title: 'Restauro vaso piccolo o portavaso', category: 'restoration', price: 'da 30-50 €', description: 'Riparazione di piccole crepe, sbeccature e verniciatura.' },
        { id: 19, title: 'Restauro vaso decorativo medio', category: 'restoration', price: 'da 50-100 €', description: 'Ripristino dell’integrità strutturale e del rivestimento decorativo.' },
        { id: 20, title: 'Restauro piccola scultura decorativa', category: 'restoration', price: 'da 80-150 €', description: 'Interventi di restauro mirato e consolidamento delle parti fragili.' },
        { id: 21, title: 'Restauro grande scultura da giardino o da interno', category: 'restoration', price: 'da 150 €', description: 'Rinnovamento completo di elementi e figure di grandi dimensioni.' },
        { id: 22, title: 'Restauro complesso (gesso, ceramica, ecc.)', category: 'restoration', price: 'su preventivo', description: 'Restauro personalizzato di oggetti di valore e materiali delicati.' },
        { id: 23, title: 'Pulizia e rinnovo oggetti decorativi', category: 'restoration', price: 'su preventivo', description: 'Pulizia delicata professionale e applicazione di trattamenti protettivi.' },

        // TRASLOCO
        { id: 24, title: 'Assistenza al trasloco', category: 'relocation', price: '30-40 €/ora', description: 'Operazioni di carico, scarico e supporto completo per il trasloco.' },
        { id: 25, title: 'Montaggio e smontaggio mobili per trasloco', category: 'relocation', price: 'da 35 €/ora', description: 'Preparazione dei mobili al trasporto e rimontaggio nella nuova sede.' },
        { id: 26, title: 'Servizio di imballaggio', category: 'relocation', price: 'su preventivo', description: 'Imballaggio sicuro di scatole ed effetti personali fragili.' },
        { id: 27, title: 'Preparazione locali al trasloco', category: 'relocation', price: 'su preventivo', description: 'Sgombero ambienti, riordino e organizzazione dello spazio.' },
        { id: 28, title: 'Pulizia post-trasloco', category: 'relocation', price: 'da 150 €', description: 'Pulizia e igienizzazione dei locali dopo lo sgombero finale.' }
    ],
    es: [
        // LIMPIEZA
        { id: 1, title: 'Limpieza de mantenimiento para casas y pisos', category: 'cleaning', price: '30-35 €/hora', description: 'Mantenimiento regular del orden, aspirado, limpieza húmeda de superficies y sanitarios.' },
        { id: 2, title: 'Limpieza general', category: 'cleaning', price: '35-45 €/hora', description: 'Limpieza a fondo de zonas difíciles, muebles de cocina y electrodomésticos.' },
        { id: 3, title: 'Limpieza profunda', category: 'cleaning', price: '40-50 €/hora', description: 'Desinfección minuciosa y eliminación de manchas persistentes.' },
        { id: 4, title: 'Limpieza fin de obra', category: 'cleaning', price: '4-10 €/m²', description: 'Eliminación de polvo de obra, restos de pintura, lechada y cemento.' },
        { id: 5, title: 'Limpieza tras mudanza', category: 'cleaning', price: 'desde 150 €', description: 'Limpieza completa del inmueble tras el desalojo y transporte de enseres.' },
        { id: 6, title: 'Limpieza para entrega de llaves o cambio de inquilinos', category: 'cleaning', price: 'desde 150 €', description: 'Preparación integral del inmueble para nuevos inquilinos.' },
        { id: 7, title: 'Limpieza de oficinas y locales comerciales', category: 'cleaning', price: '25-35 €/hora', description: 'Mantenimiento del orden en zonas de trabajo, descanso y aseos.' },
        { id: 8, title: 'Limpieza de ventanas', category: 'cleaning', price: '3-6 € por ventana / 30-45 €/hora', description: 'Limpieza profesional de marcos, cristales y repisas.' },
        { id: 9, title: 'Limpieza de balcones o terrazas', category: 'cleaning', price: 'desde 30-80 €', description: 'Limpieza de balcones, terrazas y galerías de polvo y suciedad.' },

        // MONTAJE DE MUEBLES
        { id: 10, title: 'Montaje de silla', category: 'furniture', price: 'desde 20 €', description: 'Montaje de sillas de bar, oficina y cocina.' },
        { id: 11, title: 'Montaje de mesa pequeña', category: 'furniture', price: 'desde 30-50 €', description: 'Montaje de mesas de centro, escritorios y mesas de comedor.' },
        { id: 12, title: 'Montaje de cómoda', category: 'furniture', price: 'desde 40-70 €', description: 'Montaje de estructura, instalación y ajuste de cajones.' },
        { id: 13, title: 'Montaje de cama', category: 'furniture', price: 'desde 50-80 €', description: 'Montaje de somier, cabecero y sistemas abatibles.' },
        { id: 14, title: 'Montaje de armario', category: 'furniture', price: 'desde 80-200 €', description: 'Montaje de estructura, puertas y ajuste de herrajes.' },
        { id: 15, title: 'Armario grande / Vestidor', category: 'furniture', price: 'según presupuesto', description: 'Instalación de muebles modulares complejos y sistemas de vestidor.' },
        { id: 16, title: 'Desmontaje de muebles', category: 'furniture', price: 'desde 30-100 €', description: 'Desmontaje cuidadoso antes del transporte o reforma.' },
        { id: 17, title: 'Montaje y desmontaje durante mudanzas', category: 'furniture', price: '30-40 €/hora', description: 'Servicio rápido de montaje y desmontaje en proceso de mudanza.' },

        // RESTAURACIÓN
        { id: 18, title: 'Restauración de maceta pequeña o cubremaceta', category: 'restoration', price: 'desde 30-50 €', description: 'Reparación de grietas leves, desconchones y pintado.' },
        { id: 19, title: 'Restauración de maceta decorativa mediana', category: 'restoration', price: 'desde 50-100 €', description: 'Restauración de la estructura y el acabado decorativo.' },
        { id: 20, title: 'Restauración de escultura decorativa pequeña', category: 'restoration', price: 'desde 80-150 €', description: 'Restauración puntual y consolidación de partes frágiles.' },
        { id: 21, title: 'Restauración de escultura grande de jardín o interior', category: 'restoration', price: 'desde 150 €', description: 'Renovación integral de piezas de gran tamaño.' },
        { id: 22, title: 'Restauración compleja de yeso y cerámica', category: 'restoration', price: 'según presupuesto', description: 'Restauración a medida de objetos frágiles y valiosos.' },
        { id: 23, title: 'Limpieza y renovación de objetos decorativos', category: 'restoration', price: 'según presupuesto', description: 'Limpieza delicada profesional y aplicación de tratamientos protectores.' },

        // MUDANZAS
        { id: 24, title: 'Ayuda con la mudanza', category: 'relocation', price: '30-40 €/hora', description: 'Carga, descarga y soporte completo durante la mudanza.' },
        { id: 25, title: 'Montaje y desmontaje de muebles para mudanza', category: 'relocation', price: 'desde 35 €/hora', description: 'Preparación de muebles para transporte y montaje en el nuevo espacio.' },
        { id: 26, title: 'Servicio de embalaje', category: 'relocation', price: 'según presupuesto', description: 'Embalaje seguro de cajas y objetos delicados.' },
        { id: 27, title: 'Preparación de espacios para la mudanza', category: 'relocation', price: 'según presupuesto', description: 'Desalojo de estancias, organización y distribución del espacio.' },
        { id: 28, title: 'Limpieza tras la mudanza', category: 'relocation', price: 'desde 150 €', description: 'Limpieza y puesta a punto tras vaciar por completo el inmueble.' }
    ],
    de: [
        // REINIGUNG
        { id: 1, title: 'Unterhaltsreinigung für Wohnungen & Häuser', category: 'cleaning', price: '30-35 €/Std.', description: 'Regelmäßige Sauberkeit, Staubsaugen, feuchtes Wischen von Flächen und Sanitär.' },
        { id: 2, title: 'Grundreinigung', category: 'cleaning', price: '35-45 €/Std.', description: 'Gründliche Reinigung schwer zugänglicher Stellen, Küchenzeilen und Geräte.' },
        { id: 3, title: 'Intensivreinigung', category: 'cleaning', price: '40-50 €/Std.', description: 'Eingehende Desinfektion und tiefgründige Entfernung hartnäckiger Flecken.' },
        { id: 4, title: 'Bauendreinigung', category: 'cleaning', price: '4-10 €/m²', description: 'Beseitigung von Baustaub, Farbresten, Fugenmasse und Zement.' },
        { id: 5, title: 'Reinigung nach Umzug', category: 'cleaning', price: 'ab 150 €', description: 'Komplette Reinigung nach Auszug und Möbeltransport.' },
        { id: 6, title: 'Übergabereinigung (Einzug / Auszug)', category: 'cleaning', price: 'ab 150 €', description: 'Vollständige Vorbereitung des Objekts für neue Mieter.' },
        { id: 7, title: 'Büro- und Gewerbereinigung', category: 'cleaning', price: '25-35 €/Std.', description: 'Ordnung an Arbeitsplätzen, Pausenräumen und Sanitäranlagen.' },
        { id: 8, title: 'Fensterreinigung', category: 'cleaning', price: '3-6 € pro Fenster / 30-45 €/Std.', description: 'Professionelle Reinigung von Rahmen, Scheiben und Bänken.' },
        { id: 9, title: 'Balkon- oder Terrassenreinigung', category: 'cleaning', price: 'ab 30-80 €', description: 'Befreiung von Balkonen, Loggien und Terrassen von Staub und Schmutz.' },

        // MÖBELMONTAGE
        { id: 10, title: 'Stuhlmontage', category: 'furniture', price: 'ab 20 €', description: 'Montage von Bar-, Büro- und Küchenstühlen.' },
        { id: 11, title: 'Montage kleiner Tisch', category: 'furniture', price: 'ab 30-50 €', description: 'Montage von Couch-, Schreib- und Esstischen.' },
        { id: 12, title: 'Kommodenmontage', category: 'furniture', price: 'ab 40-70 €', description: 'Korpusaufbau, Einbau und Ausrichtung von Schubladen.' },
        { id: 13, title: 'Bettmontage', category: 'furniture', price: 'ab 50-80 €', description: 'Montage von Gestell, Kopfteil und Bettkastenmechanismen.' },
        { id: 14, title: 'Schrankmontage', category: 'furniture', price: 'ab 80-200 €', description: 'Aufbau des Korpus, Türmontage und Beschlageinstellung.' },
        { id: 15, title: 'Großer Schrank / Ankleidezimmer', category: 'furniture', price: 'nach Angebot', description: 'Montage komplexer Modulmöbel und Ankleidesysteme.' },
        { id: 16, title: 'Möbeldemontage', category: 'furniture', price: 'ab 30-100 €', description: 'Sorgfältige Demontage vor Transport oder Renovierung.' },
        { id: 17, title: 'Möbelmontage & -demontage bei Umzug', category: 'furniture', price: '30-40 €/Std.', description: 'Schneller Auf- und Abbau im Zuge des Umzugs.' },

        // RESTAURATION
        { id: 18, title: 'Restauration kleiner Topf / Übertopf', category: 'restoration', price: 'ab 30-50 €', description: 'Ausbessern kleiner Risse, Abplatzungen und Lackierung.' },
        { id: 19, title: 'Restauration mittlerer Dekotopf', category: 'restoration', price: 'ab 50-100 €', description: 'Wiederherstellung von Struktur und Dekoroberfläche.' },
        { id: 20, title: 'Restauration kleine Dekorskulptur', category: 'restoration', price: 'ab 80-150 €', description: 'Punktuelle Festigung und Aufarbeitung instabiler Stellen.' },
        { id: 21, title: 'Restauration große Garten-/Interieurfigur', category: 'restoration', price: 'ab 150 €', description: 'Umfassende Erneuerung großformatiger Objekte.' },
        { id: 22, title: 'Aufwendige Restauration (Gips, Keramik)', category: 'restoration', price: 'nach Angebot', description: 'Individuelle Wiederherstellung wertvoller und fragiler Objekte.' },
        { id: 23, title: 'Reinigung & Auffrischung von Dekorelementen', category: 'restoration', price: 'nach Angebot', description: 'Schonende Reinigung und Schutzversiegelung.' },

        // UMZUGSHILFE
        { id: 24, title: 'Umzugshilfe', category: 'relocation', price: '30-40 €/Std.', description: 'Be- und Entladen sowie Begleitung des Umzugs.' },
        { id: 25, title: 'Möbelmontage/-demontage beim Umzug', category: 'relocation', price: 'ab 35 €/Std.', description: 'Vorbereitung für den Transport und Wiederaufbau am Zielort.' },
        { id: 26, title: 'Verpackungsservice', category: 'relocation', price: 'nach Angebot', description: 'Sicheres Einpacken von Kartons und empfindlichen Gegenständen.' },
        { id: 27, title: 'Raumvorbereitung für den Umzug', category: 'relocation', price: 'nach Angebot', description: 'Räumen von Zimmern, Stellordnung und Raumorganisation.' },
        { id: 28, title: 'Reinigung nach Umzug', category: 'relocation', price: 'ab 150 €', description: 'Säuberung der Räumlichkeiten nach dem vollständigen Auszug.' }
    ],
    nl: [
        // SCHOONMAAK
        { id: 1, title: 'Standaard schoonmaak van huizen en appartementen', category: 'cleaning', price: '30-35 €/uur', description: 'Regelmatig onderhoud, stofzuigen, vochtig afnemen van oppervlakken en sanitair.' },
        { id: 2, title: 'Grote schoonmaak', category: 'cleaning', price: '35-45 €/uur', description: 'Grondige reiniging van moeilijk bereikbare plekken, keukens en apparatuur.' },
        { id: 3, title: 'Dieptereiniging', category: 'cleaning', price: '40-50 €/uur', description: 'Diepgaande desinfectie en verwijdering van hardnekkig vuil.' },
        { id: 4, title: 'Schoonmaak na verbouwing', category: 'cleaning', price: '4-10 €/m²', description: 'Verwijderen van bouwstof, verfresten, voegmiddel en cement.' },
        { id: 5, title: 'Schoonmaak na verhuizing', category: 'cleaning', price: 'vanaf 150 €', description: 'Volledige reiniging van de woning na ontruiming en transport.' },
        { id: 6, title: 'Opleveringsschoonmaak (in-/uitverhuizing)', category: 'cleaning', price: 'vanaf 150 €', description: 'Woning klaarmaken voor nieuwe huurders of oplevering.' },
        { id: 7, title: 'Kantoor- en bedrijfsreiniging', category: 'cleaning', price: '25-35 €/uur', description: 'Schoonhouden van werkplekken, kantines en sanitaire ruimtes.' },
        { id: 8, title: 'Glazenwassen', category: 'cleaning', price: '3-6 € per raam / 30-45 €/uur', description: 'Professionele reiniging van kozijnen, ramen en vensterbanken.' },
        { id: 9, title: 'Balkon- of terrasreiniging', category: 'cleaning', price: 'vanaf 30-80 €', description: 'Schoonmaken van balkons, loggia’s en terrassen van stof en vuil.' },

        // MEUBELMONTAGE
        { id: 10, title: 'Stoel monteren', category: 'furniture', price: 'vanaf 20 €', description: 'Montage van barstoelen, bureaustoelen en eetkamerstoelen.' },
        { id: 11, title: 'Kleine tafel monteren', category: 'furniture', price: 'vanaf 30-50 €', description: 'Montage van salon-, bureau- en eettafels.' },
        { id: 12, title: 'Ladekast monteren', category: 'furniture', price: 'vanaf 40-70 €', description: 'Frame opbouwen, lades plaatsen en afstellen.' },
        { id: 13, title: 'Bed monteren', category: 'furniture', price: 'vanaf 50-80 €', description: 'Montage van frame, hoofdbord en opbergmechanismen.' },
        { id: 14, title: 'Kledingkast monteren', category: 'furniture', price: 'vanaf 80-200 €', description: 'Montage van de kast, deuren afhangen en beslag afstellen.' },
        { id: 15, title: 'Grote kast / Inloopkast', category: 'furniture', price: 'op offerte basis', description: 'Montage van complexe modulaire meubels en inloopkasten.' },
        { id: 16, title: 'Meubels demonteren', category: 'furniture', price: 'vanaf 30-100 €', description: 'Zorgvuldige demontage voor transport of renovatie.' },
        { id: 17, title: 'Meubelmontage en -demontage bij verhuizing', category: 'furniture', price: '30-40 €/uur', description: 'Snelle montage/demontage tijdens het verhuisproces.' },

        // RESTAURATIE
        { id: 18, title: 'Restauratie kleine pot of bloempot', category: 'restoration', price: 'vanaf 30-50 €', description: 'Herstel van kleine scheurtjes, chips en schilderwerk.' },
        { id: 19, title: 'Restauratie middelgrote decoratieve pot', category: 'restoration', price: 'vanaf 50-100 €', description: 'Herstel van de structuur en decoratieve afwerking.' },
        { id: 20, title: 'Restauratie klein decoratief beeld', category: 'restoration', price: 'vanaf 80-150 €', description: 'Plaatselijke restauratie en versteviging van kwetsbare delen.' },
        { id: 21, title: 'Restauratie groot tuin- of interieurbeeld', category: 'restoration', price: 'vanaf 150 €', description: 'Volledige vernieuwing van grote objecten.' },
        { id: 22, title: 'Complex herstel van gips en keramiek', category: 'restoration', price: 'op offerte basis', description: 'Restauratie op maat van waardevolle en breekbare voorwerpen.' },
        { id: 23, title: 'Reiniging en vernieuwing van decoratie', category: 'restoration', price: 'op offerte basis', description: 'Zachte professionele reiniging en aanbrengen van beschermlaag.' },

        // VERHUIZING
        { id: 24, title: 'Verhuishulp', category: 'relocation', price: '30-40 €/uur', description: 'Laden, lossen en volledige begeleiding bij verhuizing.' },
        { id: 25, title: 'Montage/demontage meubels voor verhuizing', category: 'relocation', price: 'vanaf 35 €/uur', description: 'Klaarmaken van meubels voor transport en heropbouw op nieuwe locatie.' },
        { id: 26, title: 'Inpakservice', category: 'relocation', price: 'op offerte basis', description: 'Veilig inpakken van dozen en kwetsbare spullen.' },
        { id: 27, title: 'Ruimte voorbereiden op verhuizing', category: 'relocation', price: 'op offerte basis', description: 'Kamers leegmaken, indelen en ruimte organiseren.' },
        { id: 28, title: 'Schoonmaak na verhuizing', category: 'relocation', price: 'vanaf 150 €', description: 'Schoonmaken van de ruimte nadat alle spullen zijn verhuisd.' }
    ]
};

const translations = {
    ru: {
        pageTitle: 'Услуги для дома и помещений',
        pageSubtitle: 'Полный перечень бытовых, клининговых и реставрационных услуг.',
        tabAll: 'Все услуги',
        tabCleaning: '✨ Уборка и клининг',
        tabFurniture: '🪑 Сборка мебели',
        tabRestoration: '🎨 Реставрация',
        tabRelocation: '📦 Помощь при переезде'
    },
    en: {
        pageTitle: 'Home & Property Services',
        pageSubtitle: 'Full range of household, cleaning, and restoration services.',
        tabAll: 'All Services',
        tabCleaning: '✨ Cleaning',
        tabFurniture: '🪑 Furniture Assembly',
        tabRestoration: '🎨 Restoration',
        tabRelocation: '📦 Relocation Assistance'
    },
    fr: {
        pageTitle: 'Services pour la maison et les locaux',
        pageSubtitle: 'Gamme complète de services ménagers, de nettoyage et de restauration.',
        tabAll: 'Tous les services',
        tabCleaning: '✨ Nettoyage',
        tabFurniture: '🪑 Montage de meubles',
        tabRestoration: '🎨 Restauration',
        tabRelocation: '📦 Aide au déménagement'
    },
    it: {
        pageTitle: 'Servizi per la casa e gli ambienti',
        pageSubtitle: 'Gamma completa di servizi domestici, pulizia e restauro.',
        tabAll: 'Tutti i servizi',
        tabCleaning: '✨ Pulizia & Sanificazione',
        tabFurniture: '🪑 Montaggio Mobili',
        tabRestoration: '🎨 Restauro Decorazioni',
        tabRelocation: '📦 Assistenza Trasloco'
    },
    es: {
        pageTitle: 'Servicios para el hogar y espacios',
        pageSubtitle: 'Gama completa de servicios domésticos, limpieza y restauración.',
        tabAll: 'Todos los servicios',
        tabCleaning: '✨ Limpieza',
        tabFurniture: '🪑 Montaje de muebles',
        tabRestoration: '🎨 Restauración',
        tabRelocation: '📦 Ayuda con la mudanza'
    },
    de: {
        pageTitle: 'Dienstleistungen für Haus & Objekt',
        pageSubtitle: 'Komplettes Angebot an Haushalts-, Reinigungs- und Restaurationsdiensten.',
        tabAll: 'Alle Angebote',
        tabCleaning: '✨ Reinigung',
        tabFurniture: '🪑 Möbelmontage',
        tabRestoration: '🎨 Restauration',
        tabRelocation: '📦 Umzugshilfe'
    },
    nl: {
        pageTitle: 'Diensten voor huis en pand',
        pageSubtitle: 'Compleet aanbod van huishoudelijke, schoonmaak- en restauratiediensten.',
        tabAll: 'Alle diensten',
        tabCleaning: '✨ Schoonmaak',
        tabFurniture: '🪑 Meubelmontage',
        tabRestoration: '🎨 Restauratie',
        tabRelocation: '📦 Verhuishulp'
    }
};

export function renderServices() {
    const lang = localStorage.getItem('app_lang') || 'ru';
    const t = translations[lang] || translations.ru;
    const mockServices = mockServicesData[lang] || mockServicesData.ru;

    const container = document.createElement('div');
    container.className = 'page-container page-services';

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">${t.pageTitle}</h1>
            <p class="page-subtitle">${t.pageSubtitle}</p>
        </div>

        <div class="service-tabs">
            <button class="tab-btn active" data-category="all">${t.tabAll} (${mockServices.length})</button>
            <button class="tab-btn" data-category="cleaning">${t.tabCleaning}</button>
            <button class="tab-btn" data-category="furniture">${t.tabFurniture}</button>
            <button class="tab-btn" data-category="restoration">${t.tabRestoration}</button>
            <button class="tab-btn" data-category="relocation">${t.tabRelocation}</button>
        </div>

        <div id="services-list"></div>
    `;

    const listElement = container.querySelector('#services-list');

    function displayServices(category = 'all') {
        listElement.innerHTML = '';
        const filtered = category === 'all' 
            ? mockServices 
            : mockServices.filter(s => s.category === category);

        filtered.forEach(service => {
            listElement.appendChild(renderServiceCard(service));
        });
    }

    setTimeout(() => {
        const tabs = container.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                displayServices(e.target.dataset.category);
            });
        });
    }, 0);

    displayServices();
    return container;
}