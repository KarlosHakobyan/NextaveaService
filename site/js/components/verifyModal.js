// The code-entry window shown between "Submit" and the order actually being
// sent. Six single-character boxes rather than one text field: it makes the
// expected length obvious, and it lets a pasted code fill the whole row.
//
// Focus is trapped while it is open and returned to the submit button on close,
// following the same pattern as the map dialog in components/locationPicker.js.

import { CODE_LENGTH } from '../verification/codeService.js';

function digitsOnly(value) {
    return String(value || '').replace(/\D/g, '');
}

function formatClock(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * @param {object}   options
 * @param {object}   options.strings  localised copy for this dialog
 * @param {function} options.onSubmit async (code) => void; throw to show an error
 * @param {function} options.onResend async () => session
 * @param {function} options.onCancel called when the visitor backs out
 */
export function createVerifyModal({ strings: t, onSubmit, onResend, onCancel }) {
    const root = document.createElement('div');
    root.className = 'verify-modal';
    root.hidden = true;

    const boxes = Array.from({ length: CODE_LENGTH }, (_, i) => `
        <input class="verify-digit" type="text" inputmode="numeric" autocomplete="${i === 0 ? 'one-time-code' : 'off'}"
               maxlength="1" aria-label="${t.digitLabel.replace('{n}', i + 1)}" data-index="${i}">
    `).join('');

    root.innerHTML = `
        <div class="verify-modal-backdrop" data-close-verify></div>
        <div class="verify-modal-panel" role="dialog" aria-modal="true"
             aria-labelledby="verify-title" aria-describedby="verify-sent">
            <div class="verify-modal-head">
                <h3 id="verify-title">${t.title}</h3>
                <button type="button" class="btn-icon" data-close-verify
                        title="${t.close}" aria-label="${t.close}">
                    <span class="icon-close" aria-hidden="true"></span>
                </button>
            </div>

            <p class="verify-demo" id="verify-demo" hidden></p>
            <p class="verify-sent" id="verify-sent"></p>

            <div class="verify-digits" id="verify-digits">${boxes}</div>

            <p class="verify-error" id="verify-error" role="alert" aria-live="assertive"></p>

            <button type="button" class="btn-primary verify-submit" id="verify-submit" disabled>
                ${t.confirm}
            </button>

            <div class="verify-foot">
                <span class="verify-expiry" id="verify-expiry"></span>
                <button type="button" class="verify-resend" id="verify-resend" disabled></button>
            </div>
        </div>
    `;

    const panel = root.querySelector('.verify-modal-panel');
    const demoEl = root.querySelector('#verify-demo');
    const sentEl = root.querySelector('#verify-sent');
    const errorEl = root.querySelector('#verify-error');
    const submitEl = root.querySelector('#verify-submit');
    const resendEl = root.querySelector('#verify-resend');
    const expiryEl = root.querySelector('#verify-expiry');
    const inputs = Array.from(root.querySelectorAll('.verify-digit'));

    let ticker = null;
    let expiresAt = 0;
    let resendAt = 0;
    let busy = false;
    let lastFocus = null;
    let open = false;

    function code() {
        return inputs.map((input) => input.value).join('');
    }

    function setError(message) {
        errorEl.textContent = message || '';
        root.classList.toggle('has-error', Boolean(message));
    }

    function syncSubmit() {
        submitEl.disabled = busy || code().length !== CODE_LENGTH;
    }

    function clearDigits(focusFirst = true) {
        inputs.forEach((input) => { input.value = ''; });
        if (focusFirst) inputs[0].focus();
        syncSubmit();
    }

    function setBusy(next) {
        busy = next;
        root.classList.toggle('is-busy', next);
        inputs.forEach((input) => { input.disabled = next; });
        submitEl.textContent = next ? t.checking : t.confirm;
        syncSubmit();
    }

    // One ticker drives both countdowns; they are only ever shown together.
    function tick() {
        const now = Date.now();
        const leftMs = expiresAt - now;

        if (leftMs <= 0) {
            expiryEl.textContent = t.expired;
            expiryEl.classList.add('is-expired');
        } else {
            expiryEl.textContent = t.expiresIn.replace('{time}', formatClock(leftMs / 1000));
            expiryEl.classList.remove('is-expired');
        }

        const resendLeft = Math.ceil((resendAt - now) / 1000);
        if (resendLeft > 0) {
            resendEl.disabled = true;
            resendEl.textContent = t.resendIn.replace('{seconds}', resendLeft);
        } else {
            resendEl.disabled = busy;
            resendEl.textContent = t.resend;
        }
    }

    function startTicker() {
        stopTicker();
        tick();
        ticker = setInterval(tick, 1000);
    }

    function stopTicker() {
        if (ticker) clearInterval(ticker);
        ticker = null;
    }

    function applySession(session, contact) {
        expiresAt = Date.now() + session.expiresIn * 1000;
        resendAt = Date.now() + session.resendAfter * 1000;

        sentEl.innerHTML = t.sentTo
            .replace('{email}', `<strong>${contact.email}</strong>`)
            .replace('{phone}', `<strong>${contact.phone}</strong>`);

        if (session.demo) {
            demoEl.hidden = false;
            demoEl.innerHTML = `<strong>${t.demoTitle}</strong> ${t.demoBody} <b class="verify-demo-code">${session.demoCode}</b>`;
        } else {
            demoEl.hidden = true;
            demoEl.textContent = '';
        }

        setError('');
        clearDigits(false);
        startTicker();
    }

    async function submit() {
        if (busy || code().length !== CODE_LENGTH) return;
        setBusy(true);
        setError('');
        try {
            await onSubmit(code());
            // The caller closes the dialog on success; leave it busy until then
            // so a double-press cannot send the order twice.
        } catch (err) {
            setBusy(false);
            setError(err.message || t.errWrongCode);
            root.classList.add('shake');
            setTimeout(() => root.classList.remove('shake'), 420);
            clearDigits();
        }
    }

    async function resend() {
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            const next = await onResend();
            setBusy(false);
            applySession(next.session, next.contact);
        } catch (err) {
            setBusy(false);
            setError(err.message || t.errSendFailed);
        }
    }

    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            const value = digitsOnly(input.value);
            input.value = value.slice(-1);          // keep the last digit typed
            setError('');
            if (input.value && index < inputs.length - 1) inputs[index + 1].focus();
            syncSubmit();
            // Typing the final digit is the whole intent; don't make them reach
            // for the button as well.
            if (code().length === CODE_LENGTH) submit();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                e.preventDefault();
                inputs[index - 1].value = '';
                inputs[index - 1].focus();
                syncSubmit();
            } else if (e.key === 'ArrowLeft' && index > 0) {
                e.preventDefault();
                inputs[index - 1].focus();
            } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                e.preventDefault();
                inputs[index + 1].focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                submit();
            }
        });

        // A code arrives as one string, from a paste or from an SMS autofill.
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = digitsOnly((e.clipboardData || window.clipboardData).getData('text'));
            if (!pasted) return;
            pasted.slice(0, CODE_LENGTH - index).split('').forEach((digit, offset) => {
                inputs[index + offset].value = digit;
            });
            const filled = Math.min(index + pasted.length, CODE_LENGTH - 1);
            inputs[filled].focus();
            setError('');
            syncSubmit();
            if (code().length === CODE_LENGTH) submit();
        });

        input.addEventListener('focus', () => input.select());
    });

    submitEl.addEventListener('click', submit);
    resendEl.addEventListener('click', resend);
    root.querySelectorAll('[data-close-verify]').forEach((el) => {
        el.addEventListener('click', () => close(true));
    });

    // Escape closes; Tab cycles inside the panel so focus cannot wander back to
    // the form behind the backdrop.
    function onKeydown(e) {
        if (!open) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            close(true);
            return;
        }
        if (e.key !== 'Tab') return;

        const focusable = Array.from(
            panel.querySelectorAll('button:not([disabled]), input:not([disabled])')
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function show(session, contact) {
        lastFocus = document.activeElement;
        open = true;
        root.hidden = false;
        document.body.classList.add('map-modal-open');   // reuses the scroll lock
        document.addEventListener('keydown', onKeydown);
        setBusy(false);
        applySession(session, contact);
        requestAnimationFrame(() => inputs[0].focus());
    }

    function close(cancelled) {
        if (!open) return;
        open = false;
        root.hidden = true;
        document.body.classList.remove('map-modal-open');
        document.removeEventListener('keydown', onKeydown);
        stopTicker();
        setBusy(false);
        clearDigits(false);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
        if (cancelled && onCancel) onCancel();
    }

    return {
        el: root,
        show,
        close: () => close(false),
        update: applySession,
        setError,
        setBusy,
        destroy() {
            stopTicker();
            document.removeEventListener('keydown', onKeydown);
            document.body.classList.remove('map-modal-open');
        }
    };
}
