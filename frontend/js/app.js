import { renderHeader, renderFooter } from './components/index.js';
import { initRouter } from './router.js';


document.addEventListener('DOMContentLoaded', () => {
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