// Leaflet + OpenStreetMap location picker for the order form.
// No API key and no billing account: tiles come from OpenStreetMap and the
// address lookup uses Nominatim, with Photon as a fallback if it rate-limits.
//
// The pin deliberately does NOT exist until either the visitor grants location
// access or clicks the map — there is no guessed starting position.

const LEAFLET_CSS = 'assets/vendor/leaflet/leaflet.css';
const LEAFLET_JS = 'assets/vendor/leaflet/leaflet.js';

// A wide frame to render into before we know anything about the visitor.
const NEUTRAL_CENTER = [40.1792, 44.4991]; // Yerevan, matching the contact block
const NEUTRAL_ZOOM = 6;
const LOCATED_ZOOM = 16;

let leafletPromise = null;

function loadLeaflet() {
    if (leafletPromise) return leafletPromise;

    leafletPromise = new Promise((resolve, reject) => {
        if (window.L) return resolve(window.L);

        if (!document.querySelector('link[data-leaflet]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = LEAFLET_CSS;
            link.setAttribute('data-leaflet', '');
            document.head.appendChild(link);
        }

        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.async = true;
        script.onload = () => resolve(window.L);
        script.onerror = () => reject(new Error('Leaflet failed to load'));
        document.head.appendChild(script);
    });

    return leafletPromise;
}

// Photon only publishes a few UI languages; anything else falls back to English.
const PHOTON_LANGS = ['de', 'en', 'fr', 'it'];

function formatNominatim(data) {
    const a = data.address || {};
    const parts = [
        [a.road, a.house_number].filter(Boolean).join(' '),
        a.neighbourhood || a.suburb || a.city_district,
        a.city || a.town || a.village || a.municipality,
        a.postcode,
        a.country
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : (data.display_name || '');
}

function formatPhoton(data) {
    const f = (data.features && data.features[0]) || null;
    if (!f) return '';
    const p = f.properties || {};
    const parts = [
        [p.street || p.name, p.housenumber].filter(Boolean).join(' '),
        p.district,
        p.city,
        p.postcode,
        p.country
    ].filter(Boolean);
    return parts.join(', ');
}

async function reverseGeocode(lat, lng, lang) {
    try {
        const url = 'https://nominatim.openstreetmap.org/reverse'
            + `?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&accept-language=${encodeURIComponent(lang)}`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.ok) {
            const data = await res.json();
            const text = formatNominatim(data);
            if (text) return text;
        }
    } catch (err) {
        // fall through to Photon
    }

    try {
        const plang = PHOTON_LANGS.indexOf(lang) !== -1 ? lang : 'en';
        const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=${plang}`);
        if (res.ok) {
            const text = formatPhoton(await res.json());
            if (text) return text;
        }
    } catch (err) {
        // both providers unreachable
    }

    return '';
}

export function createLocationPicker(options) {
    const {
        mapEl, statusEl, buttonEl, addressInput, latInput, lngInput, strings, lang,
        expandEl, modalEl, modalBodyEl, inlineHostEl, hintEl
    } = options;

    let map = null;
    let marker = null;
    let lookupToken = 0;
    let destroyed = false;
    let expanded = false;
    let lastFocus = null;

    function setStatus(text) {
        if (statusEl) statusEl.textContent = text;
    }

    function writeCoords(lat, lng) {
        if (latInput) latInput.value = lat.toFixed(6);
        if (lngInput) lngInput.value = lng.toFixed(6);
    }

    // Every lookup carries a token; a slow response from an older pin position
    // is discarded rather than overwriting a newer one.
    async function lookup(lat, lng) {
        const token = ++lookupToken;
        setStatus(strings.mapLocating);
        const text = await reverseGeocode(lat, lng, lang);
        if (destroyed || token !== lookupToken) return;

        if (text) {
            if (addressInput) addressInput.value = text;
            setStatus(text);
        } else {
            setStatus(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
    }

    function placePin(L, lat, lng, zoom) {
        if (!map) return;

        if (!marker) {
            marker = L.marker([lat, lng], {
                draggable: true,
                keyboard: true,
                icon: L.divIcon({
                    className: 'map-pin',
                    html: '<span class="map-pin-dot"></span>',
                    iconSize: [26, 26],
                    iconAnchor: [13, 26]
                })
            }).addTo(map);

            marker.on('dragend', () => {
                const p = marker.getLatLng();
                writeCoords(p.lat, p.lng);
                lookup(p.lat, p.lng);
            });
        } else {
            marker.setLatLng([lat, lng]);
        }

        map.setView([lat, lng], zoom || map.getZoom());
        writeCoords(lat, lng);
        lookup(lat, lng);
    }

    // Only ever called from the "Use my location" button, never on load.
    function locate(L) {
        if (!navigator.geolocation) {
            setStatus(strings.mapDenied);
            return;
        }

        // Geolocation only works in a secure context. On plain http (other than
        // localhost) the browser rejects it silently, so say so rather than
        // leaving the visitor waiting.
        if (!window.isSecureContext) {
            setStatus(strings.mapInsecure);
            return;
        }

        setStatus(strings.mapLocating);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (destroyed) return;
                placePin(L, pos.coords.latitude, pos.coords.longitude, LOCATED_ZOOM);
            },
            () => {
                if (destroyed) return;
                setStatus(strings.mapDenied);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }

    loadLeaflet().then((L) => {
        if (destroyed || !mapEl) return;

        map = L.map(mapEl, {
            center: NEUTRAL_CENTER,
            zoom: NEUTRAL_ZOOM,
            scrollWheelZoom: false, // don't hijack the page scroll
            attributionControl: true
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        map.on('click', (e) => placePin(L, e.latlng.lat, e.latlng.lng));

        // Wheel zoom is armed by interacting with the map, not by hovering over
        // it. Scrolling the page past the map therefore scrolls the page, which
        // is the behaviour people expect; once you click in, the wheel zooms.
        function armWheel() {
            if (!map || expanded) return;
            map.scrollWheelZoom.enable();
            if (hintEl) hintEl.classList.add('is-hidden');
        }
        function disarmWheel() {
            if (!map || expanded) return;
            map.scrollWheelZoom.disable();
            if (hintEl) hintEl.classList.remove('is-hidden');
        }
        mapEl.addEventListener('click', armWheel);
        mapEl.addEventListener('focusin', armWheel);
        mapEl.addEventListener('mouseleave', disarmWheel);
        mapEl.addEventListener('focusout', disarmWheel);

        if (buttonEl) {
            buttonEl.addEventListener('click', () => locate(L));
        }

        if (expandEl && modalEl && modalBodyEl && inlineHostEl) {
            expandEl.addEventListener('click', () => setExpanded(true));
            modalEl.querySelectorAll('[data-close-map]').forEach((el) => {
                el.addEventListener('click', () => setExpanded(false));
            });
            document.addEventListener('keydown', onKeydown);
        }

        // Deliberately no permission prompt on load - the browser only asks
        // when the visitor presses "Use my location".
        setStatus(strings.mapHint);
    }).catch(() => {
        setStatus(strings.mapUnavailable);
    });

    // The map element is physically moved between the card and the dialog, so
    // there is only ever one map instance and one marker - nothing to sync.
    function setExpanded(next) {
        if (!map || !modalEl || expanded === next) return;
        expanded = next;

        if (next) {
            lastFocus = document.activeElement;
            modalBodyEl.appendChild(mapEl);
            modalEl.hidden = false;
            document.body.classList.add('map-modal-open');
            if (expandEl) expandEl.setAttribute('aria-expanded', 'true');
            map.scrollWheelZoom.enable();          // always live when expanded
            if (hintEl) hintEl.classList.add('is-hidden');
            const close = modalEl.querySelector('#close-map');
            if (close) close.focus();
        } else {
            inlineHostEl.insertBefore(mapEl, inlineHostEl.firstChild);
            modalEl.hidden = true;
            document.body.classList.remove('map-modal-open');
            if (expandEl) expandEl.setAttribute('aria-expanded', 'false');
            map.scrollWheelZoom.disable();
            if (hintEl) hintEl.classList.remove('is-hidden');
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        // Leaflet caches the container size; tell it the box changed.
        requestAnimationFrame(() => { if (map) map.invalidateSize(); });
    }

    function onKeydown(e) {
        if (e.key === 'Escape' && expanded) setExpanded(false);
    }

    return {
        // Called after a successful order: form.reset() empties the hidden
        // lat/lng inputs, so the pin has to go too or the map would still show
        // a location the form no longer holds.
        clear() {
            if (marker && map) {
                map.removeLayer(marker);
                marker = null;
            }
            if (latInput) latInput.value = '';
            if (lngInput) lngInput.value = '';
            lookupToken += 1;            // discard any lookup still in flight
            setStatus(strings.mapHint);
        },

        destroy() {
            destroyed = true;
            document.removeEventListener('keydown', onKeydown);
            document.body.classList.remove('map-modal-open');
            if (map) {
                map.remove();
                map = null;
            }
            marker = null;
        }
    };
}
