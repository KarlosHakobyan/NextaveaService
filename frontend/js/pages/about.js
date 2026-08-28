export function renderAbout() {
    const currentLang = localStorage.getItem('app_lang') || 'ru';

    const translations = {
        ru: {
            title: 'О нашей компании',
            subtitle: 'Предоставляем бытовые и ремонтные услуги высокого уровня с 2020 года.',
            p1: 'Мы объединили специалистов по клинингу, строительной отделке и инженерному монтажу, чтобы предоставлять комплексный сервис в одном окне.',
            p2: 'Наш приоритет — прозрачное ценообразование, аккуратность во всем и соблюдение согласованных сроков.'
        },
        en: {
            title: 'About Our Company',
            subtitle: 'Providing high-level household and repair services since 2020.',
            p1: 'We have brought together specialists in cleaning, finishing, and engineering installation to provide comprehensive one-stop-shop services.',
            p2: 'Our priority is transparent pricing, thorough attention to detail, and strict adherence to agreed deadlines.'
        },
        fr: {
            title: 'À propos de notre entreprise',
            subtitle: 'Fournissant des services domestiques et de réparation de haut niveau depuis 2020.',
            p1: 'Nous avons regroupé des spécialistes du nettoyage, de la finition et de l’installation technique pour offrir un service complet à guichet unique.',
            p2: 'Notre priorité est une tarification transparente, un soin minutieux et le respect des délais convenus.'
        },
        it: {
            title: 'Chi Siamo',
            subtitle: 'Forniamo servizi domestici e di riparazione di alto livello dal 2020.',
            p1: 'Abbiamo riunito specialisti nella pulizia, nelle finiture e nell’installazione impiantistica per offrire un servizio completo in un unico posto.',
            p2: 'La nostra priorità è la trasparenza dei prezzi, la cura in ogni dettaglio e il rispetto dei tempi concordati.'
        },
        es: {
            title: 'Sobre nuestra empresa',
            subtitle: 'Ofreciendo servicios de hogar y reparación de alto nivel desde 2020.',
            p1: 'Hemos reunido a especialistas en limpieza, acabados e instalación técnica para ofrecer un servicio integral en un solo lugar.',
            p2: 'Nuestra prioridad es la transparencia en los precios, la pulcritud en todo y el cumplimiento de los plazos acordados.'
        },
        de: {
            title: 'Über unser Unternehmen',
            subtitle: 'Wir bieten seit 2020 erstklassige Haushalts- und Reparaturdienstleistungen an.',
            p1: 'Wir haben Fachleute für Reinigung, Innenausbau und technische Montage zusammengebracht, um einen umfassenden Service aus einer Hand zu bieten.',
            p2: 'Unsere Priorität sind transparente Preise, absolute Sorgfalt und die Einhaltung vereinbarter Fristen.'
        },
        nl: {
            title: 'Over ons bedrijf',
            subtitle: 'Wij leveren sinds 2020 hoogwaardige huishoudelijke en reparatiediensten.',
            p1: 'We hebben specialisten op het gebied van schoonmaak, afwerking en technische installatie samengebracht om een complete service vanuit één punt te bieden.',
            p2: 'Onze prioriteit is transparante prijzen, zorgvuldigheid in alles en het naleven van afgesproken deadlines.'
        }
    };

    const t = translations[currentLang] || translations.ru;

    const container = document.createElement('div');
    container.className = 'page-container page-about';

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">${t.title}</h1>
            <p class="page-subtitle">${t.subtitle}</p>
        </div>

        <div class="portfolio-card" style="max-width: 800px; margin: 0 auto;">
            <p style="font-size: 1.05rem; line-height: 1.8; color: #475569; margin-bottom: 16px;">
                ${t.p1}
            </p>
            <p style="font-size: 1.05rem; line-height: 1.8; color: #475569;">
                ${t.p2}
            </p>
        </div>
    `;

    return container;
}