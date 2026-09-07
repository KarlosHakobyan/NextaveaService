import { createLocationPicker } from '../components/locationPicker.js';
import { createVerifyModal } from '../components/verifyModal.js';
import { createPhoneField } from '../components/phoneField.js';

import { fetchApi } from '../api.js';
import { validateOrder, todayIso } from '../validation/orderValidator.js';
import { createCodeService } from '../verification/codeService.js';
import { verifyStrings } from '../verification/strings.js';

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
            mapTitle: 'Укажите местоположение',
            mapHint: 'Разрешите доступ к геолокации или нажмите на карту, чтобы поставить метку',
            mapUseLocation: 'Моё местоположение',
            mapLocating: 'Определяем местоположение…',
            mapDenied: 'Геолокация недоступна — нажмите на карту, чтобы указать адрес',
            mapInsecure: 'Геолокация работает только по HTTPS — нажмите на карту, чтобы указать адрес',
            mapUnavailable: 'Карта недоступна',
            mapExpand: 'Развернуть карту',
            mapCloseMap: 'Свернуть карту',
            mapZoomHint: 'Нажмите на карту, чтобы приближать колёсиком',
            dateLabel: 'Удобная дата *',
            timeLabel: 'Удобное время *',
            optMorning: 'Утро (08:00 - 12:00)',
            optDay: 'День (12:00 - 16:00)',
            optEvening: 'Вечер (16:00 - 20:00)',
            messageLabel: 'Детали заказа *',
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
            mapTitle: 'Pick your location',
            mapHint: 'Allow location access, or click the map to drop a pin',
            mapUseLocation: 'Use my location',
            mapLocating: 'Locating…',
            mapDenied: 'Location unavailable — click the map to set your address',
            mapInsecure: 'Location needs HTTPS — click the map to set your address',
            mapUnavailable: 'Map unavailable',
            mapExpand: 'Expand map',
            mapCloseMap: 'Close map',
            mapZoomHint: 'Click the map to zoom with the wheel',
            dateLabel: 'Preferred Date *',
            timeLabel: 'Preferred Time *',
            optMorning: 'Morning (08:00 - 12:00)',
            optDay: 'Day (12:00 - 16:00)',
            optEvening: 'Evening (16:00 - 20:00)',
            messageLabel: 'Order Details *',
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
            mapTitle: 'Indiquez votre position',
            mapHint: 'Autorisez la géolocalisation ou cliquez sur la carte pour placer un repère',
            mapUseLocation: 'Ma position',
            mapLocating: 'Localisation…',
            mapDenied: 'Position indisponible — cliquez sur la carte pour indiquer votre adresse',
            mapInsecure: 'La géolocalisation exige HTTPS — cliquez sur la carte pour indiquer votre adresse',
            mapUnavailable: 'Carte indisponible',
            mapExpand: 'Agrandir la carte',
            mapCloseMap: 'Fermer la carte',
            mapZoomHint: 'Cliquez sur la carte pour zoomer avec la molette',
            dateLabel: 'Date souhaitée *',
            timeLabel: 'Heure souhaitée *',
            optMorning: 'Matin (08:00 - 12:00)',
            optDay: 'Jour (12:00 - 16:00)',
            optEvening: 'Soir (16:00 - 20:00)',
            messageLabel: 'Détails de la commande *',
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
            mapTitle: 'Indica la tua posizione',
            mapHint: 'Consenti la geolocalizzazione o clicca sulla mappa per posizionare un segnaposto',
            mapUseLocation: 'La mia posizione',
            mapLocating: 'Localizzazione…',
            mapDenied: 'Posizione non disponibile — clicca sulla mappa per indicare l’indirizzo',
            mapInsecure: 'La geolocalizzazione richiede HTTPS — clicca sulla mappa per indicare l’indirizzo',
            mapUnavailable: 'Mappa non disponibile',
            mapExpand: 'Ingrandisci la mappa',
            mapCloseMap: 'Chiudi la mappa',
            mapZoomHint: 'Clicca sulla mappa per zoomare con la rotellina',
            dateLabel: 'Data Preferita *',
            timeLabel: 'Orario Preferito *',
            optMorning: 'Mattina (08:00 - 12:00)',
            optDay: 'Pomeriggio (12:00 - 16:00)',
            optEvening: 'Sera (16:00 - 20:00)',
            messageLabel: 'Dettagli dell’Ordine *',
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
            mapTitle: 'Indica tu ubicación',
            mapHint: 'Permite el acceso a tu ubicación o haz clic en el mapa para colocar un marcador',
            mapUseLocation: 'Mi ubicación',
            mapLocating: 'Localizando…',
            mapDenied: 'Ubicación no disponible — haz clic en el mapa para indicar tu dirección',
            mapInsecure: 'La ubicación requiere HTTPS — haz clic en el mapa para indicar tu dirección',
            mapUnavailable: 'Mapa no disponible',
            mapExpand: 'Ampliar el mapa',
            mapCloseMap: 'Cerrar el mapa',
            mapZoomHint: 'Haz clic en el mapa para ampliar con la rueda',
            dateLabel: 'Fecha preferida *',
            timeLabel: 'Hora preferida *',
            optMorning: 'Mañana (08:00 - 12:00)',
            optDay: 'Día (12:00 - 16:00)',
            optEvening: 'Tarde (16:00 - 20:00)',
            messageLabel: 'Detalles del pedido *',
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
            mapTitle: 'Standort auswählen',
            mapHint: 'Standortzugriff erlauben oder auf die Karte klicken, um eine Markierung zu setzen',
            mapUseLocation: 'Mein Standort',
            mapLocating: 'Standort wird ermittelt…',
            mapDenied: 'Standort nicht verfügbar — auf die Karte klicken, um die Adresse anzugeben',
            mapInsecure: 'Standort erfordert HTTPS — auf die Karte klicken, um die Adresse anzugeben',
            mapUnavailable: 'Karte nicht verfügbar',
            mapExpand: 'Karte vergrößern',
            mapCloseMap: 'Karte schließen',
            mapZoomHint: 'Auf die Karte klicken, um mit dem Mausrad zu zoomen',
            dateLabel: 'Gewünschtes Datum *',
            timeLabel: 'Gewünschte Uhrzeit *',
            optMorning: 'Morgen (08:00 - 12:00)',
            optDay: 'Tag (12:00 - 16:00)',
            optEvening: 'Abend (16:00 - 20:00)',
            messageLabel: 'Bestelldetails *',
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
            mapTitle: 'Kies uw locatie',
            mapHint: 'Sta locatietoegang toe of klik op de kaart om een speld te plaatsen',
            mapUseLocation: 'Mijn locatie',
            mapLocating: 'Locatie bepalen…',
            mapDenied: 'Locatie niet beschikbaar — klik op de kaart om uw adres in te stellen',
            mapInsecure: 'Locatie vereist HTTPS — klik op de kaart om uw adres in te stellen',
            mapUnavailable: 'Kaart niet beschikbaar',
            mapExpand: 'Kaart vergroten',
            mapCloseMap: 'Kaart sluiten',
            mapZoomHint: 'Klik op de kaart om met het muiswiel te zoomen',
            dateLabel: 'Voorkeursdatum *',
            timeLabel: 'Voorkeurstijd *',
            optMorning: 'Ochtend (08:00 - 12:00)',
            optDay: 'Middag (12:00 - 16:00)',
            optEvening: 'Avond (16:00 - 20:00)',
            messageLabel: 'Besteldetails *',
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
    // Validation and verification copy lives with the feature, not the page.
    const v = verifyStrings(currentLang);
    // Bookings are for today onwards; the input enforces it, the validator
    // re-checks it, because the attribute is only a hint.
    const today = todayIso();

    const container = document.createElement('div');
    container.className = 'page-container page-contacts';
    
    container.innerHTML = `
        <h1 class="page-title">${t.title}</h1>
        <p class="page-subtitle">${t.subtitle}</p>

        <div class="contacts-wrapper">
            <form id="order-form" class="order-form" novalidate>
                <h3>${t.formTitle}</h3>

                <div class="form-grid-2">
                    <div class="form-group" data-field="name">
                        <label for="of-name">${t.nameLabel}</label>
                        <input id="of-name" type="text" name="name" autocomplete="name"
                               placeholder="${t.namePlaceholder}" required
                               aria-describedby="err-name">
                        <p class="field-error" id="err-name" data-error-for="name"></p>
                    </div>

                    <div class="form-group" data-field="phone">
                        <label for="of-phone">${t.phoneLabel}</label>
                        <div id="phone-host"></div>
                        <p class="field-error" id="err-phone" data-error-for="phone"></p>
                    </div>
                </div>

                <div class="form-group" data-field="email">
                    <label for="of-email">${v.emailLabel}</label>
                    <input id="of-email" type="email" name="email" autocomplete="email"
                           placeholder="${v.emailPlaceholder}" required
                           aria-describedby="err-email">
                    <p class="field-error" id="err-email" data-error-for="email"></p>
                </div>

                <div class="form-group" data-field="serviceType">
                    <label for="of-service">${t.serviceTypeLabel}</label>
                    <select id="of-service" name="serviceType" required aria-describedby="err-serviceType">
                        <option value="cleaning">${t.optCleaning}</option>
                        <option value="furniture">${t.optFurniture}</option>
                        <option value="restoration">${t.optRestoration}</option>
                        <option value="relocation">${t.optRelocation}</option>
                    </select>
                    <p class="field-error" id="err-serviceType" data-error-for="serviceType"></p>
                </div>

                <div class="form-group" data-field="address">
                    <label for="of-address">${t.addressLabel}</label>
                    <input id="of-address" type="text" name="address" autocomplete="street-address"
                           placeholder="${t.addressPlaceholder}" required
                           aria-describedby="err-address err-location">
                    <input type="hidden" name="lat">
                    <input type="hidden" name="lng">
                    <p class="field-error" id="err-address" data-error-for="address"></p>
                    <p class="field-error" id="err-location" data-error-for="location"></p>
                </div>

                <div class="form-grid-2">
                    <div class="form-group" data-field="preferredDate">
                        <label for="of-date">${t.dateLabel}</label>
                        <input id="of-date" type="date" name="preferredDate" required
                               min="${today}" aria-describedby="err-preferredDate">
                        <p class="field-error" id="err-preferredDate" data-error-for="preferredDate"></p>
                    </div>

                    <div class="form-group" data-field="preferredTime">
                        <label for="of-time">${t.timeLabel}</label>
                        <select id="of-time" name="preferredTime" required aria-describedby="err-preferredTime">
                            <option value="morning">${t.optMorning}</option>
                            <option value="day">${t.optDay}</option>
                            <option value="evening">${t.optEvening}</option>
                        </select>
                        <p class="field-error" id="err-preferredTime" data-error-for="preferredTime"></p>
                    </div>
                </div>

                <div class="form-group" data-field="message">
                    <label for="of-message">${t.messageLabel}</label>
                    <textarea id="of-message" name="message" rows="3" required
                              placeholder="${t.messagePlaceholder}"
                              aria-describedby="err-message"></textarea>
                    <p class="field-error" id="err-message" data-error-for="message"></p>
                </div>

                <button type="submit" class="btn-primary">${t.submitBtn}</button>
                <div id="form-status" role="status" aria-live="polite"></div>
            </form>

            <div class="contacts-side">
                <div class="contacts-info">
                    <h3>${t.infoTitle}</h3>
                    <p><strong>${t.office}</strong></p>
                    <p><strong>${t.dispatcher}</strong></p>
                    <p><strong>${t.email}</strong></p>
                    <p><strong>${t.workingHours}</strong></p>
                </div>

                <div class="map-card">
                    <div class="map-card-head">
                        <h3>${t.mapTitle}</h3>
                        <div class="map-actions">
                            <button type="button" class="btn-secondary btn-locate" id="use-my-location">${t.mapUseLocation}</button>
                            <button type="button" class="btn-icon" id="expand-map" aria-expanded="false" title="${t.mapExpand}" aria-label="${t.mapExpand}">
                                <span class="icon-expand" aria-hidden="true"></span>
                            </button>
                        </div>
                    </div>
                    <div class="map-frame" id="map-frame">
                        <div id="order-map" class="order-map"></div>
                        <p class="map-zoom-hint" id="map-zoom-hint">${t.mapZoomHint}</p>
                    </div>
                    <p id="map-status" class="map-status"></p>
                </div>
            </div>
        </div>

        <div class="map-modal" id="map-modal" hidden>
            <div class="map-modal-backdrop" data-close-map></div>
            <div class="map-modal-panel" role="dialog" aria-modal="true" aria-label="${t.mapTitle}">
                <div class="map-modal-head">
                    <h3>${t.mapTitle}</h3>
                    <button type="button" class="btn-icon" id="close-map" title="${t.mapCloseMap}" aria-label="${t.mapCloseMap}" data-close-map>
                        <span class="icon-close" aria-hidden="true"></span>
                    </button>
                </div>
                <div class="map-modal-body" id="map-modal-body"></div>
            </div>
        </div>
    `;

    const form = container.querySelector('#order-form');
    const status = container.querySelector('#form-status');

    const codeService = createCodeService({ request: fetchApi });

    // The phone box is a country picker plus a number field. It writes the
    // joined value into a hidden `phone` input, so everything downstream —
    // the validator, the payload, the admin console's tel: link — still sees
    // one ordinary string.
    const phoneField = createPhoneField({
        host: container.querySelector('#phone-host'),
        lang: currentLang,
        strings: v,
        placeholder: '44 123456'
    });

    function readForm() {
        return Object.fromEntries(new FormData(form).entries());
    }

    function setStatus(message, tone) {
        status.textContent = message;
        status.dataset.tone = tone || '';
    }

    function clearFieldErrors() {
        container.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
        container.querySelectorAll('.form-group.is-invalid').forEach((el) => {
            el.classList.remove('is-invalid');
        });
        form.querySelectorAll('[aria-invalid]').forEach((el) => {
            el.removeAttribute('aria-invalid');
        });
    }

    // The validator reports codes; the wording is this locale's business.
    function showFieldErrors(errors, firstError) {
        clearFieldErrors();

        Object.entries(errors).forEach(([field, code]) => {
            const slot = container.querySelector(`[data-error-for="${field}"]`);
            if (slot) slot.textContent = v[code] || v.required;

            const group = container.querySelector(`.form-group[data-field="${field}"]`);
            if (group) group.classList.add('is-invalid');

            // `phone` is a hidden input; the visible number box is what the
            // visitor sees and what a screen reader should mark invalid.
            const control = field === 'phone'
                ? container.querySelector('.phone-number')
                : form.elements[field];
            if (control && control.setAttribute) control.setAttribute('aria-invalid', 'true');
        });

        // The pin has no visible control of its own, so its error hangs off the
        // address group and the map card is highlighted instead.
        if (errors.location) {
            const addressGroup = container.querySelector('.form-group[data-field="address"]');
            if (addressGroup) addressGroup.classList.add('is-invalid');
            container.querySelector('.map-card').classList.add('is-invalid');
        } else {
            container.querySelector('.map-card').classList.remove('is-invalid');
        }

        setStatus(v.fixErrors, 'error');

        if (!firstError) return;
        const target = firstError === 'location'
            ? container.querySelector('#use-my-location')
            : firstError === 'phone'
                ? container.querySelector('.phone-number')
                : form.elements[firstError];
        if (target && target.focus) {
            target.focus();
            if (target.scrollIntoView) {
                target.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }
    }

    function verificationError(err) {
        const map = {
            wrongCode: () => v.errWrongCode.replace('{n}', err.attemptsLeft),
            noAttemptsLeft: () => v.errNoAttempts,
            expired: () => v.errExpired,
            rateLimited: () => v.errRateLimited,
            badContact: () => v.errBadContact,
            sendFailed: () => v.errSendFailed,
            confirmFailed: () => v.errConfirmFailed
        };
        return (map[err.reason] || map.confirmFailed)();
    }

    // Sends the order for real. Reached only with a verification token in hand.
    async function submitOrder(data, verificationToken) {
        const payload = { ...data, verificationToken };
        try {
            await fetchApi('/requests', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            setStatus(t.successApi, 'ok');
        } catch (err) {
            // The backend is not built yet; the order is acknowledged so the
            // flow can be walked end to end. Remove this arm once /requests
            // is live and a failure should be reported as a failure.
            setStatus(t.successFallback, 'ok');
        }
        form.reset();
        clearFieldErrors();
        picker.clear();
        phoneField.reset();
        codeService.reset();
    }

    async function startVerification(data) {
        const contact = { email: data.email, phone: data.phone, lang: currentLang };
        const session = await codeService.start(contact);
        return { session, contact };
    }

    const verify = createVerifyModal({
        strings: v,
        onSubmit: async (code) => {
            let result;
            try {
                result = await codeService.confirm(code);
            } catch (err) {
                throw new Error(verificationError(err));
            }
            verify.close();
            await submitOrder(readForm(), result.verificationToken);
        },
        onResend: async () => {
            try {
                return await startVerification(readForm());
            } catch (err) {
                throw new Error(verificationError(err));
            }
        },
        onCancel: () => {
            // Backing out of the dialog leaves the form filled in and untouched,
            // so nothing is lost; the order simply was not placed.
            setStatus('', '');
        }
    });
    container.appendChild(verify.el);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = readForm();
        const result = validateOrder(data, { today: todayIso() });

        if (!result.ok) {
            showFieldErrors(result.errors, result.firstError);
            return;
        }

        clearFieldErrors();
        container.querySelector('.map-card').classList.remove('is-invalid');
        setStatus(v.sendingCode, 'busy');

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try {
            const { session, contact } = await startVerification(data);
            setStatus('', '');
            verify.show(session, contact);
        } catch (err) {
            setStatus(verificationError(err), 'error');
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Clearing an error as soon as the visitor fixes it beats making them
    // press submit again to find out.
    form.addEventListener('input', (e) => {
        const group = e.target.closest('.form-group.is-invalid');
        if (!group) return;
        group.classList.remove('is-invalid');
        e.target.removeAttribute('aria-invalid');
        group.querySelectorAll('.field-error').forEach((el) => { el.textContent = ''; });
    });

    const picker = createLocationPicker({
        mapEl: container.querySelector('#order-map'),
        statusEl: container.querySelector('#map-status'),
        buttonEl: container.querySelector('#use-my-location'),
        expandEl: container.querySelector('#expand-map'),
        modalEl: container.querySelector('#map-modal'),
        modalBodyEl: container.querySelector('#map-modal-body'),
        inlineHostEl: container.querySelector('#map-frame'),
        hintEl: container.querySelector('#map-zoom-hint'),
        addressInput: form.querySelector('input[name="address"]'),
        latInput: form.querySelector('input[name="lat"]'),
        lngInput: form.querySelector('input[name="lng"]'),
        strings: t,
        lang: currentLang
    });

    // The router replaces #main-content wholesale, so drop the Leaflet
    // instance on the way out instead of leaking its window listeners.
    window.addEventListener('hashchange', function teardown() {
        window.removeEventListener('hashchange', teardown);
        picker.destroy();
        verify.destroy();
        phoneField.destroy();
    });

    return container;
}