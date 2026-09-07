import { initTheme } from '../shared/theme.js';
import { migrateLegacyKeys } from '../shared/prefs.js';
import { renderHeader, renderFooter } from './components/index.js';
import { initRouter } from './router.js';


document.addEventListener('DOMContentLoaded', () => {
    // Carries an existing language choice into the namespaced store, then
    // keeps the theme in step with the system setting and with other tabs.
    migrateLegacyKeys();
    initTheme();

    const appContainer = document.getElementById('app');

    // Рендерим фиксированную шапку
    appContainer.appendChild(renderHeader());

    // Контейнер для динамического контента страниц
    const mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    appContainer.appendChild(mainContent);

    // Рендерим подвал
    appContainer.appendChild(renderFooter());

    // Инициализируем роутер
    initRouter();
});