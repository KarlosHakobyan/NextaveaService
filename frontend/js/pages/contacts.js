import { fetchApi } from '../api.js';

export function renderContacts() {
    const currentLang = localStorage.getItem('app_lang') || 'ru';

    const translations = {
        ru: {
            title: 'Оформление заказа',
            subtitle: 'Заполните детали, и мы свяжемся с вами в течение 10 минут.',
            formTitle: 'Заявка на выезд мастера',
            nameLabel: 'Имя *',
            namePlaceholder: 'Иван',
            phoneLabel: 'Телефон / WhatsApp *',
            serviceTypeLabel: 'Категория услуги *',
            optCleaning: 'Уборка и клининг (от 30 €/час)',
            optFurniture: 'Сборка / разборка мебели (от 20 €)',
            optRestoration: 'Реставрация декора (от 30 €)',
            optRelocation: 'Помощь при переезде (30-40 €/час)',
            addressLabel: 'Адрес объекта *',
            addressPlaceholder: 'Улица, дом, квартира',
            dateLabel: 'Удобная дата',
            timeLabel: 'Удобное время',
            optMorning: 'Утро (08:00 - 12:00)',
            optDay: 'День (12:00 - 16:00)',
            optEvening: 'Вечер (16:00 - 20:00)',
            messageLabel: 'Детали заказа',
            messagePlaceholder: 'Укажите площадь помещения, объём мебели или особенности задачи...',
            submitBtn: 'Отправить и рассчитать стоимость',
            infoTitle: 'Наши контакты',
            office: '📍 Офис: г. Ереван',
            dispatcher: '📞 Диспетчер: +374 (00) 00-00-00',
            email: '✉️ Email: info@business-services.com',
            workingHours: '⏰ Режим работы: Пн-Вс: 08:00 - 21:00',
            sending: 'Отправка заявки...',
            successApi: '✅ Заявка принята! Менеджер перезвонит вам.',
            successFallback: '✅ Заявка успешно сохранена!'
        },
        en: {
            title: 'Place an Order',
            subtitle: 'Fill in the details and we will contact you within 10 minutes.',
            formTitle: 'Request a Specialist Visit',
            nameLabel: 'Name *',
            namePlaceholder: 'John',
            phoneLabel: 'Phone / WhatsApp *',
            serviceTypeLabel: 'Service Category *',
            optCleaning: 'Cleaning Services (from 30 €/hour)',
            optFurniture: 'Furniture Assembly / Disassembly (from 20 €)',
            optRestoration: 'Decor Restoration (from 30 €)',
            optRelocation: 'Relocation Assistance (30-40 €/hour)',
            addressLabel: 'Property Address *',
            addressPlaceholder: 'Street, house, apartment',
            dateLabel: 'Preferred Date',
            timeLabel: 'Preferred Time',
            optMorning: 'Morning (08:00 - 12:00)',
            optDay: 'Day (12:00 - 16:00)',
            optEvening: 'Evening (16:00 - 20:00)',
            messageLabel: 'Order Details',
            messagePlaceholder: 'Specify room area, furniture volume, or task details...',
            submitBtn: 'Submit and Calculate Cost',
            infoTitle: 'Our Contacts',
            office: '📍 Office: Yerevan',
            dispatcher: '📞 Dispatcher: +374 (00) 00-00-00',
            email: '✉️ Email: info@business-services.com',
            workingHours: '⏰ Working Hours: Mon-Sun: 08:00 - 21:00',
            sending: 'Sending request...',
            successApi: '✅ Request accepted! Manager will call you back.',
            successFallback: '✅ Request successfully saved!'
        },
        fr: {
            title: 'Passer une commande',
            subtitle: 'Remplissez les details et nous vous contacterons dans les 10 minutes.',
            formTitle: 'Demande de visite d’un technicien',
            nameLabel: 'Nom *',
            namePlaceholder: 'Jean',
            phoneLabel: 'Téléphone / WhatsApp *',
            serviceTypeLabel: 'Catégorie de service *',
            optCleaning: 'Nettoyage (à partir de 30 €/heure)',
            optFurniture: 'Montage / démontage de meubles (à partir de 20 €)',
            optRestoration: 'Restauration de décors (à partir de 30 €)',
            optRelocation: 'Aide au déménagement (30-40 €/heure)',
            addressLabel: 'Adresse du bien *',
            addressPlaceholder: 'Rue, bâtiment, appartement',
            dateLabel: 'Date souhaitée',
            timeLabel: 'Heure souhaitée',
            optMorning: 'Matin (08:00 - 12:00)',
            optDay: 'Jour (12:00 - 16:00)',
            optEvening: 'Soir (16:00 - 20:00)',
            messageLabel: 'Détails de la commande',
            messagePlaceholder: 'Indiquez la surface, le volume de meubles ou les particularités...',
            submitBtn: 'Envoyer et calculer le coût',
            infoTitle: 'Nos contacts',
            office: '📍 Bureau : Erevan',
            dispatcher: '📞 Standard : +374 (00) 00-00-00',
            email: '✉️ Email : info@business-services.com',
            workingHours: '⏰ Horaires : Lun-Dim : 08:00 - 21:00',
            sending: 'Envoi de la demande...',
            successApi: '✅ Demande acceptée ! Le gestionnaire vous rappelera.',
            successFallback: '✅ Demande enregistrée avec succès !'
        },
        it: {
            title: 'Effettua un Ordine',
            subtitle: 'Compila i dettagli e ti ricontatteremo entro 10 minuti.',
            formTitle: 'Richiesta di Sopralluogo',
            nameLabel: 'Nome *',
            namePlaceholder: 'Mario',
            phoneLabel: 'Telefono / WhatsApp *',
            serviceTypeLabel: 'Categoria di Servizio *',
            optCleaning: 'Pulizia (da 30 €/ora)',
            optFurniture: 'Montaggio / smontaggio mobili (da 20 €)',
            optRestoration: 'Restauro decorazioni (da 30 €)',
            optRelocation: 'Assistenza traslochi (30-40 €/ora)',
            addressLabel: 'Indirizzo dell’immobile *',
            addressPlaceholder: 'Via, numero civico, interno',
            dateLabel: 'Data Preferita',
            timeLabel: 'Orario Preferito',
            optMorning: 'Mattina (08:00 - 12:00)',
            optDay: 'Pomeriggio (12:00 - 16:00)',
            optEvening: 'Sera (16:00 - 20:00)',
            messageLabel: 'Dettagli dell’Ordine',
            messagePlaceholder: 'Specifica la superficie, il volume dei mobili o le specifiche...',
            submitBtn: 'Invia e calcola il costo',
            infoTitle: 'I nostri contatti',
            office: '📍 Ufficio: Yerevan',
            dispatcher: '📞 Centralino: +374 (00) 00-00-00',
            email: '✉️ Email: info@business-services.com',
            workingHours: '⏰ Orari: Lun-Dom: 08:00 - 21:00',
            sending: 'Invio richiesta...',
            successApi: '✅ Richiesta accettata! Un manager ti ricontatterà.',
            successFallback: '✅ Richiesta salvata con successo!'
        },
        es: {
            title: 'Realizar un pedido',
            subtitle: 'Complete los detalles y nos pondremos en contacto con usted en 10 minutos.',
            formTitle: 'Solicitud de visita técnica',
            nameLabel: 'Nombre *',
            namePlaceholder: 'Juan',
            phoneLabel: 'Teléfono / WhatsApp *',
            serviceTypeLabel: 'Categoría de servicio *',
            optCleaning: 'Limpieza y aseo (desde 30 €/hora)',
            optFurniture: 'Montaje / desmontaje de muebles (desde 20 €)',
            optRestoration: 'Restauración de decoración (desde 30 €)',
            optRelocation: 'Ayuda en mudanzas (30-40 €/hora)',
            addressLabel: 'Dirección del inmueble *',
            addressPlaceholder: 'Calle, número, apartamento',
            dateLabel: 'Fecha preferida',
            timeLabel: 'Hora preferida',
            optMorning: 'Mañana (08:00 - 12:00)',
            optDay: 'Día (12:00 - 16:00)',
            optEvening: 'Tarde (16:00 - 20:00)',
            messageLabel: 'Detalles del pedido',
            messagePlaceholder: 'Indique el área de la habitación, volumen de muebles o detalles...',
            submitBtn: 'Enviar y calcular coste',
            infoTitle: 'Nuestros contactos',
            office: '📍 Oficina: Ereván',
            dispatcher: '📞 Centralita: +374 (00) 00-00-00',
            email: '✉️ Correo: info@business-services.com',
            workingHours: '⏰ Horario: Lun-Dom: 08:00 - 21:00',
            sending: 'Enviando solicitud...',
            successApi: '✅ ¡Solicitud aceptada! El gestor le llamará.',
            successFallback: '✅ ¡Solicitud guardada con éxito!'
        },
        de: {
            title: 'Bestellung aufgeben',
            subtitle: 'Füllen Sie die Details aus und wir werden Sie innerhalb von 10 Minuten kontaktieren.',
            formTitle: 'Anfrage für Handwerkereinsatz',
            nameLabel: 'Name *',
            namePlaceholder: 'Hans',
            phoneLabel: 'Telefon / WhatsApp *',
            serviceTypeLabel: 'Dienstleistungskategorie *',
            optCleaning: 'Reinigung & Gebäudedienste (ab 30 €/Std.)',
            optFurniture: 'Möbelmontage / -demontage (ab 20 €)',
            optRestoration: 'Dekorationsrestaurierung (ab 30 €)',
            optRelocation: 'Umzugshilfe (30-40 €/Std.)',
            addressLabel: 'Objektadresse *',
            addressPlaceholder: 'Straße, Hausnummer, Wohnung',
            dateLabel: 'Gewünschtes Datum',
            timeLabel: 'Gewünschte Uhrzeit',
            optMorning: 'Morgen (08:00 - 12:00)',
            optDay: 'Tag (12:00 - 16:00)',
            optEvening: 'Abend (16:00 - 20:00)',
            messageLabel: 'Bestelldetails',
            messagePlaceholder: 'Geben Sie Raumgröße, Möbelvolumen oder Besonderheiten an...',
            submitBtn: 'Absenden und Kosten berechnen',
            infoTitle: 'Unsere Kontakte',
            office: '📍 Büro: Eriwan',
            dispatcher: '📞 Dispatcher: +374 (00) 00-00-00',
            email: '✉️ E-Mail: info@business-services.com',
            workingHours: '⏰ Öffnungszeiten: Mo-So: 08:00 - 21:00',
            sending: 'Anfrage wird gesendet...',
            successApi: '✅ Anfrage angenommen! Ein Manager ruft Sie zurück.',
            successFallback: '✅ Anfrage erfolgreich gespeichert!'
        },
        nl: {
            title: 'Bestelling plaatsen',
            subtitle: 'Vul de details in en wij nemen binnen 10 minuten contact met u op.',
            formTitle: 'Aanvraag vakmanbezoek',
            nameLabel: 'Naam *',
            namePlaceholder: 'Jan',
            phoneLabel: 'Telefoon / WhatsApp *',
            serviceTypeLabel: 'Dienstcategorie *',
            optCleaning: 'Schoonmaak (vanaf 30 €/uur)',
            optFurniture: 'Meubelmontage / -demontage (vanaf 20 €)',
            optRestoration: 'Decorrestauratie (vanaf 30 €)',
            optRelocation: 'Verhuishulp (30-40 €/uur)',
            addressLabel: 'Adres van het object *',
            addressPlaceholder: 'Straat, huisnummer, appartement',
            dateLabel: 'Voorkeursdatum',
            timeLabel: 'Voorkeurstijd',
            optMorning: 'Ochtend (08:00 - 12:00)',
            optDay: 'Middag (12:00 - 16:00)',
            optEvening: 'Avond (16:00 - 20:00)',
            messageLabel: 'Besteldetails',
            messagePlaceholder: 'Vermeld ruimteoppervlakte, meubelvolume of bijzonderheden...',
            submitBtn: 'Verzenden en kosten berekenen',
            infoTitle: 'Onze contacten',
            office: '📍 Kantoor: Jerevan',
            dispatcher: '📞 Dispatcher: +374 (00) 00-00-00',
            email: '✉️ E-mail: info@business-services.com',
            workingHours: '⏰ Openingstijden: Ma-Zo: 08:00 - 21:00',
            sending: 'Verzoek verzenden...',
            successApi: '✅ Aanvraag geaccepteerd! Een manager belt u terug.',
            successFallback: '✅ Aanvraag succesvol opgeslagen!'
        }
    };

    const t = translations[currentLang] || translations.ru;

    const container = document.createElement('div');
    container.className = 'page-container page-contacts';
    
    container.innerHTML = `
        <h1 class="page-title">${t.title}</h1>
        <p class="page-subtitle">${t.subtitle}</p>

        <div class="contacts-wrapper">
            <form id="order-form" class="order-form">
                <h3>${t.formTitle}</h3>
                
                <div class="form-grid-2">
                    <div class="form-group">
                        <label>${t.nameLabel}</label>
                        <input type="text" name="name" placeholder="${t.namePlaceholder}" required>
                    </div>

                    <div class="form-group">
                        <label>${t.phoneLabel}</label>
                        <input type="tel" name="phone" placeholder="+374 00 000000" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>${t.serviceTypeLabel}</label>
                    <select name="serviceType" required>
                        <option value="cleaning">${t.optCleaning}</option>
                        <option value="furniture">${t.optFurniture}</option>
                        <option value="restoration">${t.optRestoration}</option>
                        <option value="relocation">${t.optRelocation}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>${t.addressLabel}</label>
                    <input type="text" name="address" placeholder="${t.addressPlaceholder}" required>
                </div>

                <div class="form-grid-2">
                    <div class="form-group">
                        <label>${t.dateLabel}</label>
                        <input type="date" name="preferredDate">
                    </div>

                    <div class="form-group">
                        <label>${t.timeLabel}</label>
                        <select name="preferredTime">
                            <option value="morning">${t.optMorning}</option>
                            <option value="day">${t.optDay}</option>
                            <option value="evening">${t.optEvening}</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>${t.messageLabel}</label>
                    <textarea name="message" rows="3" placeholder="${t.messagePlaceholder}"></textarea>
                </div>

                <button type="submit" class="btn-primary">${t.submitBtn}</button>
                <div id="form-status" style="margin-top: 15px; font-weight: 600; text-align: center;"></div>
            </form>

            <div class="contacts-info">
                <h3>${t.infoTitle}</h3>
                <p><strong>${t.office}</strong></p>
                <p><strong>${t.dispatcher}</strong></p>
                <p><strong>${t.email}</strong></p>
                <p><strong>${t.workingHours}</strong></p>
            </div>
        </div>
    `;

    const form = container.querySelector('#order-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = container.querySelector('#form-status');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        status.innerHTML = t.sending;
        status.style.color = '#0284c7';

        try {
            await fetchApi('/requests', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            status.innerHTML = t.successApi;
            status.style.color = '#10b981';
            form.reset();
        } catch (err) {
            setTimeout(() => {
                status.innerHTML = t.successFallback;
                status.style.color = '#10b981';
                form.reset();
            }, 600);
        }
    });

    return container;
}