// Order form validation, kept apart from the DOM and from the network so the
// rules can be read — and tested — on their own. It returns error *codes*,
// never sentences: the contacts page owns the wording in each of its locales.
//
// See site/tests/orderValidator.test.js  (node --test site/tests/)

export const SERVICE_TYPES = ['cleaning', 'furniture', 'restoration', 'relocation'];
export const TIME_SLOTS = ['morning', 'day', 'evening'];

// Field order matters: it is the visual order on the form, and it decides
// which field gets focus when several are wrong at once.
export const FIELD_ORDER = [
    'name', 'email', 'phone', 'serviceType', 'address', 'location',
    'preferredDate', 'preferredTime', 'message'
];

const NAME_MIN = 2;
const ADDRESS_MIN = 5;
const MESSAGE_MIN = 10;
const PHONE_MIN_DIGITS = 8;
const PHONE_MAX_DIGITS = 15;

// Deliberately stricter than the HTML5 default, which accepts "a@b". A real
// address has a dot-separated TLD of at least two letters, and no doubled dots.
const EMAIL_RE = /^[^\s@.]+(?:\.[^\s@.]+)*@(?:[^\s@.]+\.)+[A-Za-z]{2,}$/;

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function text(value) {
    return typeof value === 'string' ? value.trim() : '';
}

export function isValidEmail(value) {
    return EMAIL_RE.test(text(value));
}

// Keeps a leading + because it carries the country code; drops every other
// separator people type, so "(044) 123-456" and "044123456" count the same.
export function normalisePhone(value) {
    const raw = text(value);
    const plus = raw.startsWith('+') ? '+' : '';
    return plus + raw.replace(/\D/g, '');
}

export function isValidPhone(value) {
    const digits = normalisePhone(value).replace(/\D/g, '');
    return digits.length >= PHONE_MIN_DIGITS && digits.length <= PHONE_MAX_DIGITS;
}

// Compares the two ISO strings directly. Parsing to Date would drag the
// browser's timezone in and could push an evening booking into "yesterday".
function isPastDate(value, today) {
    return value < today;
}

function isRealDate(value) {
    const match = ISO_DATE_RE.exec(value);
    if (!match) return false;
    const [, y, m, d] = match;
    const date = new Date(`${y}-${m}-${d}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return false;
    // Rejects 2026-02-31, which Date would roll forward into March.
    return date.getUTCMonth() + 1 === Number(m) && date.getUTCDate() === Number(d);
}

export function todayIso(now = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * @param {object} data    raw form values, as produced by FormData
 * @param {object} options `today` as an ISO date; defaults to the local date
 * @returns {{ok: boolean, errors: Record<string,string>, firstError: string|null}}
 */
export function validateOrder(data = {}, options = {}) {
    const today = options.today || todayIso();
    const errors = {};

    const name = text(data.name);
    if (!name) errors.name = 'required';
    else if (name.length < NAME_MIN) errors.name = 'nameShort';

    const email = text(data.email);
    if (!email) errors.email = 'required';
    else if (!EMAIL_RE.test(email)) errors.email = 'emailInvalid';

    const phone = text(data.phone);
    if (!phone) errors.phone = 'required';
    else if (!isValidPhone(phone)) errors.phone = 'phoneInvalid';

    const serviceType = text(data.serviceType);
    if (!serviceType) errors.serviceType = 'required';
    else if (!SERVICE_TYPES.includes(serviceType)) errors.serviceType = 'serviceInvalid';

    const address = text(data.address);
    if (!address) errors.address = 'required';
    else if (address.length < ADDRESS_MIN) errors.address = 'addressShort';

    // The pin is optional: a typed address is enough to find the job, and
    // insisting on the map would shut out anyone who denies geolocation and
    // never notices it. But a pin that IS dropped has to be a real coordinate —
    // nothing in the UI can produce an out-of-range one, so it means something
    // is broken and the order should not carry it to the backend.
    const lat = Number(text(data.lat));
    const lng = Number(text(data.lng));
    const hasPin = text(data.lat) !== '' && text(data.lng) !== ''
        && Number.isFinite(lat) && Number.isFinite(lng);
    if (hasPin && (lat < -90 || lat > 90 || lng < -180 || lng > 180)) {
        errors.location = 'locationRange';
    }

    const preferredDate = text(data.preferredDate);
    if (!preferredDate) errors.preferredDate = 'required';
    else if (!isRealDate(preferredDate)) errors.preferredDate = 'dateInvalid';
    else if (isPastDate(preferredDate, today)) errors.preferredDate = 'datePast';

    const preferredTime = text(data.preferredTime);
    if (!preferredTime) errors.preferredTime = 'required';
    else if (!TIME_SLOTS.includes(preferredTime)) errors.preferredTime = 'timeInvalid';

    const message = text(data.message);
    if (!message) errors.message = 'required';
    else if (message.length < MESSAGE_MIN) errors.message = 'messageShort';

    const firstError = FIELD_ORDER.find((field) => errors[field]) || null;

    return { ok: Object.keys(errors).length === 0, errors, firstError };
}
