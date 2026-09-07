/* ==========================================================================
   Demo store: stands in for the API until the backend exists.

   This implements exactly the contract in docs/admin-api.md: same paths,
   same query parameters, same response shapes. When the real API answers,
   nothing in the pages changes.

   Edits persist to localStorage so a session survives a reload. The seed is
   dated relative to now and is rebuilt if it goes stale, so "new today"
   stays meaningful whenever you open the console.
   ========================================================================== */

const STORE_KEY = 'nx_admin_demo_v1';
const STALE_AFTER_DAYS = 3;

/* --------------------------------------------------------------------------
   Seed
   -------------------------------------------------------------------------- */

const hoursAgo = h => new Date(Date.now() - h * 3600_000).toISOString();
const daysFromNow = d => new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);

function seedRequests() {
    return [
        {
            id: 142, name: 'Anahit Grigoryan', phone: '+374 91 445 210',
            serviceType: 'cleaning', address: 'Nalbandyan St 24, apt 12, Yerevan',
            lat: 40.1789, lng: 44.5133,
            preferredDate: daysFromNow(1), preferredTime: 'morning',
            message: 'Three rooms plus kitchen, about 85 m². Moving out on Friday so it needs to be done before then.',
            status: 'new', quotedPrice: null, createdAt: hoursAgo(2),
            notes: []
        },
        {
            id: 141, name: 'Julien Marchand', phone: '+374 55 302 887',
            serviceType: 'relocation', address: 'Baghramyan Ave 41, Yerevan',
            lat: 40.1935, lng: 44.5087,
            preferredDate: daysFromNow(3), preferredTime: 'day',
            message: 'Two-bedroom flat, ground floor to third floor. No lift.',
            status: 'new', quotedPrice: null, createdAt: hoursAgo(5),
            notes: []
        },
        {
            id: 140, name: 'Sofia Ricci', phone: '+374 77 118 093',
            serviceType: 'restoration', address: 'Abovyan St 9, Yerevan',
            lat: 40.1830, lng: 44.5152,
            preferredDate: '', preferredTime: 'evening',
            message: 'Large ceramic garden pot, cracked at the base. Sending photos on WhatsApp.',
            status: 'new', quotedPrice: null, createdAt: hoursAgo(9),
            notes: []
        },
        {
            id: 139, name: 'Karen Sahakyan', phone: '+374 93 660 401',
            serviceType: 'furniture', address: 'Komitas Ave 52, apt 7, Yerevan',
            lat: 40.2011, lng: 44.4996,
            preferredDate: daysFromNow(0), preferredTime: 'day',
            message: 'Two IKEA wardrobes to assemble, flat-pack already delivered.',
            status: 'scheduled', quotedPrice: 160, createdAt: hoursAgo(28),
            notes: [
                { id: 1, text: 'Called. Confirmed for today at 13:00. Building code is 4402.', author: 'Operator', createdAt: hoursAgo(24) }
            ]
        },
        {
            id: 138, name: 'Marta Nowak', phone: '+374 98 774 512',
            serviceType: 'cleaning', address: 'Tumanyan St 15, office 3, Yerevan',
            lat: 40.1846, lng: 44.5122,
            preferredDate: daysFromNow(2), preferredTime: 'evening',
            message: 'Office cleaning, roughly 120 m², after hours only.',
            status: 'contacted', quotedPrice: 210, createdAt: hoursAgo(31),
            notes: [
                { id: 1, text: 'Quoted 210 € for the first visit. Waiting on their approval.', author: 'Operator', createdAt: hoursAgo(30) }
            ]
        },
        {
            id: 137, name: 'Davit Petrosyan', phone: '+374 94 220 176',
            serviceType: 'cleaning', address: 'Mashtots Ave 33, apt 21, Yerevan',
            lat: 40.1861, lng: 44.5061,
            preferredDate: daysFromNow(0), preferredTime: 'morning',
            message: 'Post-renovation cleaning. Lots of dust, some paint on the floor.',
            status: 'scheduled', quotedPrice: 340, createdAt: hoursAgo(50),
            notes: [
                { id: 1, text: 'Site visit done. 95 m², heavy dust. Quoted 340 €.', author: 'Operator', createdAt: hoursAgo(46) },
                { id: 2, text: 'Bring the second vacuum and extra filters.', author: 'Operator', createdAt: hoursAgo(20) }
            ]
        },
        {
            id: 136, name: 'Lena Fischer', phone: '+374 96 501 338',
            serviceType: 'furniture', address: 'Saryan St 8, Yerevan',
            lat: 40.1852, lng: 44.5049,
            preferredDate: daysFromNow(-1), preferredTime: 'day',
            message: 'Bed frame with a lifting mechanism.',
            status: 'done', quotedPrice: 75, createdAt: hoursAgo(74),
            notes: [
                { id: 1, text: 'Done in 90 minutes. Paid in cash.', author: 'Operator', createdAt: hoursAgo(26) }
            ]
        },
        {
            id: 135, name: 'Arman Hovhannisyan', phone: '+374 91 883 004',
            serviceType: 'relocation', address: 'Isahakyan St 2, Yerevan',
            lat: 40.1889, lng: 44.5104,
            preferredDate: daysFromNow(-2), preferredTime: 'morning',
            message: 'Studio flat, mostly boxes. Need help loading only.',
            status: 'done', quotedPrice: 120, createdAt: hoursAgo(96),
            notes: []
        },
        {
            id: 134, name: 'Elena Vargas', phone: '+374 77 940 615',
            serviceType: 'restoration', address: 'Pushkin St 40, Yerevan',
            lat: 40.1877, lng: 44.5145,
            preferredDate: '', preferredTime: 'day',
            message: 'Plaster wall sculpture, two fingers broken off. Piece kept.',
            status: 'contacted', quotedPrice: null, createdAt: hoursAgo(102),
            notes: [
                { id: 1, text: 'Needs a look in person before quoting. Offered Thursday.', author: 'Operator', createdAt: hoursAgo(98) }
            ]
        },
        {
            id: 133, name: 'Vahe Minasyan', phone: '+374 95 337 289',
            serviceType: 'cleaning', address: 'Amiryan St 12, apt 4, Yerevan',
            lat: 40.1815, lng: 44.5079,
            preferredDate: daysFromNow(-3), preferredTime: 'evening',
            message: 'Windows only, six large panes plus a balcony door.',
            status: 'done', quotedPrice: 45, createdAt: hoursAgo(128),
            notes: []
        },
        {
            id: 132, name: 'Bram de Vries', phone: '+374 98 102 447',
            serviceType: 'furniture', address: 'Charents St 27, Yerevan',
            lat: 40.1798, lng: 44.5241,
            preferredDate: '', preferredTime: 'morning',
            message: 'Wanted a full walk-in wardrobe fitted. Timeline did not work out.',
            status: 'cancelled', quotedPrice: null, createdAt: hoursAgo(150),
            notes: [
                { id: 1, text: 'Client went with a fitted-furniture company instead.', author: 'Operator', createdAt: hoursAgo(140) }
            ]
        },
        {
            id: 131, name: 'Nare Avetisyan', phone: '+374 93 774 900',
            serviceType: 'cleaning', address: 'Teryan St 105, apt 33, Yerevan',
            lat: 40.1908, lng: 44.5163,
            preferredDate: daysFromNow(-5), preferredTime: 'day',
            message: 'Deep clean before new tenants move in.',
            status: 'done', quotedPrice: 180, createdAt: hoursAgo(170),
            notes: []
        }
    ];
}

/* Mirrors the public site's catalog so the editor has something real to
   edit. Prices are strings because they are ranges, not amounts.

   `coverage` is square metres per hour, used by the calculator to turn a
   floor area into billable hours. It is set only where area actually drives
   the work: cleaning. Assembly and removals are priced by the job or the
   hour regardless of floor area, so they are deliberately left null.

   These are starting figures, meant to be corrected in the catalog against
   real jobs. */
function seedServices() {
    return [
        { id: 1,  category: 'cleaning',    title: 'Standard cleaning, flats and houses',   price: '30–35 €/hr',   description: 'Regular upkeep: vacuuming, wet wiping of surfaces and bathroom fittings.', popular: true,  active: true, coverage: 40 },
        { id: 2,  category: 'cleaning',    title: 'General cleaning',                      price: '35–45 €/hr',   description: 'Thorough clean including hard-to-reach spots, kitchen units and appliances.', popular: false, active: true, coverage: 30 },
        { id: 3,  category: 'cleaning',    title: 'Deep cleaning',                         price: '40–50 €/hr',   description: 'Detailed disinfection and removal of long-standing dirt.', popular: false, active: true, coverage: 20 },
        { id: 4,  category: 'cleaning',    title: 'Post-renovation cleaning',              price: '4–10 €/m²',    description: 'Construction dust, paint marks, grout and cement removed.', popular: true,  active: true },
        { id: 5,  category: 'cleaning',    title: 'Post-move cleaning',                    price: 'from 150 €',   description: 'Full clean of the property once everything is out.', popular: false, active: true },
        { id: 6,  category: 'cleaning',    title: 'End-of-tenancy cleaning',               price: 'from 150 €',   description: 'Property prepared to handover standard for new tenants.', popular: false, active: true },
        { id: 7,  category: 'cleaning',    title: 'Office and commercial cleaning',        price: '25–35 €/hr',   description: 'Desks, break areas and washrooms kept in order.', popular: false, active: true, coverage: 45 },
        { id: 8,  category: 'cleaning',    title: 'Window cleaning',                       price: '3–6 € / window', description: 'Frames, glass and sills. 30–45 €/hr for larger jobs.', popular: false, active: true },
        { id: 9,  category: 'cleaning',    title: 'Balcony or terrace cleaning',           price: '30–80 €',      description: 'Balconies, loggias and terraces cleared of dust and grime.', popular: false, active: true },

        { id: 10, category: 'furniture',   title: 'Chair assembly',                        price: 'from 20 €',    description: 'Bar, office and kitchen chairs.', popular: false, active: true },
        { id: 11, category: 'furniture',   title: 'Small table assembly',                  price: '30–50 €',      description: 'Coffee, desk and dining tables.', popular: false, active: true },
        { id: 12, category: 'furniture',   title: 'Chest of drawers assembly',             price: '40–70 €',      description: 'Carcass built, drawers fitted and aligned.', popular: false, active: true },
        { id: 13, category: 'furniture',   title: 'Bed assembly',                          price: '50–80 €',      description: 'Base, headboard and lifting mechanisms.', popular: true,  active: true },
        { id: 14, category: 'furniture',   title: 'Wardrobe assembly',                     price: '80–200 €',     description: 'Carcass, doors and hardware adjustment.', popular: true,  active: true },
        { id: 15, category: 'furniture',   title: 'Large wardrobe or walk-in',             price: 'on estimate',  description: 'Modular furniture and walk-in systems.', popular: false, active: true },
        { id: 16, category: 'furniture',   title: 'Furniture dismantling',                 price: '30–100 €',     description: 'Careful breakdown before transport or renovation.', popular: false, active: true },
        { id: 17, category: 'furniture',   title: 'Assembly and dismantling during a move', price: '30–40 €/hr',  description: 'Handled as part of the move itself.', popular: false, active: true },

        { id: 18, category: 'restoration', title: 'Small pot or planter restoration',      price: '30–50 €',      description: 'Small cracks and chips repaired, then repainted.', popular: false, active: true },
        { id: 19, category: 'restoration', title: 'Medium decorative pot restoration',     price: '50–100 €',     description: 'Structure and decorative surface both restored.', popular: false, active: true },
        { id: 20, category: 'restoration', title: 'Small sculpture repair',                price: '80–150 €',     description: 'Spot restoration and reinforcement.', popular: false, active: true },
        { id: 21, category: 'restoration', title: 'Large garden or interior sculpture',    price: 'from 150 €',   description: 'Full refresh of large-format pieces.', popular: false, active: true },
        { id: 22, category: 'restoration', title: 'Complex plaster and ceramic work',      price: 'on estimate',  description: 'Valuable and fragile items, handled individually.', popular: false, active: true },
        { id: 23, category: 'restoration', title: 'Cleaning and refinishing decor',        price: 'on estimate',  description: 'Careful cleaning and protective coating.', popular: false, active: true },

        { id: 24, category: 'relocation',  title: 'Moving assistance',                     price: '30–40 €/hr',   description: 'Loading, unloading and support through the move.', popular: true,  active: true },
        { id: 25, category: 'relocation',  title: 'Furniture handling during a move',      price: 'from 35 €/hr', description: 'Prepared for transport, rebuilt at the new address.', popular: false, active: true },
        { id: 26, category: 'relocation',  title: 'Packing',                               price: 'on estimate',  description: 'Boxes and fragile items packed safely.', popular: false, active: true },
        { id: 27, category: 'relocation',  title: 'Preparing the property for a move',     price: 'on estimate',  description: 'Rooms cleared and the space organised.', popular: false, active: true },
        { id: 28, category: 'relocation',  title: 'Post-move cleaning',                    price: 'from 150 €',   description: 'The property cleaned once everything is out.', popular: false, active: true }
    ];
}

/* A few entries so the Logs page has something to show before the operator
   has done anything. Dated relative to now, like the requests. */
function seedLogs() {
    return [
        { id: 3, at: hoursAgo(24), user: 'Operator', action: 'request.status',
          target: '#0139', targetId: 139, detail: { from: 'contacted', to: 'scheduled' } },
        { id: 2, at: hoursAgo(30), user: 'Operator', action: 'request.quote',
          target: '#0138', targetId: 138, detail: { amount: 210 } },
        { id: 1, at: hoursAgo(46), user: 'Operator', action: 'request.note',
          target: '#0137', targetId: 137, detail: null }
    ];
}

/* Points at the images already in the repo. */
function seedPortfolio() {
    return [
        { id: 1, caption: 'Balcony, before',   url: '../assets/img/portfolio/balcon.jpg',   category: 'cleaning',    order: 1, active: true },
        { id: 2, caption: 'Balcony, finished',           url: '../assets/img/portfolio/balcon1.jpg',  category: 'cleaning',    order: 2, active: true },
        { id: 3, caption: 'Sofa restoration, before',    url: '../assets/img/portfolio/divan.PNG',    category: 'restoration', order: 3, active: true },
        { id: 4, caption: 'Sofa restoration, after',     url: '../assets/img/portfolio/divan1.PNG',   category: 'restoration', order: 4, active: true },
        { id: 5, caption: 'Kitchen deep clean, before',  url: '../assets/img/portfolio/kitchen.jpg',  category: 'cleaning',    order: 5, active: true },
        { id: 6, caption: 'Kitchen deep clean, after',   url: '../assets/img/portfolio/kitchen1.jpg', category: 'cleaning',    order: 6, active: true }
    ];
}

/* --------------------------------------------------------------------------
   Persistence
   -------------------------------------------------------------------------- */

function freshStore() {
    return {
        seededAt: Date.now(),
        requests: seedRequests(),
        services: seedServices(),
        portfolio: seedPortfolio(),
        logs: seedLogs()
    };
}

let store = null;

function load() {
    if (store) return store;
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            const ageDays = (Date.now() - (parsed.seededAt || 0)) / 86_400_000;
            // Dates in the seed are relative to when it was made. Once they
            // drift, "new today" stops meaning anything, so rebuild instead.
            if (ageDays < STALE_AFTER_DAYS && Array.isArray(parsed.requests)) {
                // Stores written before the log existed have no logs array.
                if (!Array.isArray(parsed.logs)) parsed.logs = seedLogs();
                store = parsed;
                return store;
            }
        }
    } catch { /* corrupt or unavailable storage, so fall through to a fresh seed */ }
    store = freshStore();
    save();
    return store;
}

function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
    catch { /* storage full or blocked: the session still works in memory */ }
}

export function resetDemoStore() {
    store = freshStore();
    save();
}

/* --------------------------------------------------------------------------
   Handler: matches the documented contract, path for path
   -------------------------------------------------------------------------- */

const LATENCY_MS = 180;
const wait = () => new Promise(r => setTimeout(r, LATENCY_MS));

function nextId(list) {
    return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function matchesFilters(req, q) {
    if (q.status && q.status !== 'all' && req.status !== q.status) return false;
    if (q.category && q.category !== 'all' && req.serviceType !== q.category) return false;
    if (q.from && req.createdAt.slice(0, 10) < q.from) return false;
    if (q.to && req.createdAt.slice(0, 10) > q.to) return false;
    if (q.q) {
        const needle = String(q.q).toLowerCase();
        const hay = `${req.name} ${req.phone} ${req.address} ${req.message} ${req.id}`.toLowerCase();
        if (!hay.includes(needle)) return false;
    }
    return true;
}

function computeStats(requests) {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

    const byStatus = {};
    const byCategory = {};
    requests.forEach(r => {
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
        byCategory[r.serviceType] = (byCategory[r.serviceType] || 0) + 1;
    });

    return {
        newToday: requests.filter(r => r.createdAt.slice(0, 10) === today).length,
        newThisWeek: requests.filter(r => r.createdAt.slice(0, 10) >= weekAgo).length,
        openCount: requests.filter(r => ['new', 'contacted', 'scheduled'].includes(r.status)).length,
        scheduledToday: requests.filter(r => r.status === 'scheduled' && r.preferredDate === today).length,
        quotedTotal: requests
            .filter(r => ['scheduled', 'done'].includes(r.status))
            .reduce((sum, r) => sum + (Number(r.quotedPrice) || 0), 0),
        byStatus,
        byCategory,
        total: requests.length
    };
}

export async function demoRequest(method, path, { body, query } = {}) {
    await wait();
    const db = load();
    const route = `${method} ${path}`;

    // --- Session -----------------------------------------------------------
    if (route === 'GET /admin/session') {
        return { ok: true, name: 'Demo operator', mode: 'demo' };
    }

    // --- Stats -------------------------------------------------------------
    if (route === 'GET /admin/stats') {
        return computeStats(db.requests);
    }

    // --- Requests ----------------------------------------------------------
    if (route === 'GET /admin/requests') {
        const q = query || {};
        const filtered = db.requests
            .filter(r => matchesFilters(r, q))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const page = Number(q.page) || 1;
        const pageSize = Number(q.pageSize) || 50;
        return {
            items: filtered.slice((page - 1) * pageSize, page * pageSize),
            total: filtered.length,
            page,
            pageSize
        };
    }

    let m = path.match(/^\/admin\/requests\/(\d+)$/);
    if (m) {
        const id = Number(m[1]);
        const index = db.requests.findIndex(r => r.id === id);
        if (index === -1) throw new Error(`Request ${id} not found`);

        if (method === 'GET') return { ...db.requests[index] };

        if (method === 'PATCH') {
            db.requests[index] = { ...db.requests[index], ...body, id };
            save();
            return { ...db.requests[index] };
        }

        if (method === 'DELETE') {
            db.requests.splice(index, 1);
            save();
            return null;
        }
    }

    m = path.match(/^\/admin\/requests\/(\d+)\/notes$/);
    if (m && method === 'POST') {
        const id = Number(m[1]);
        const req = db.requests.find(r => r.id === id);
        if (!req) throw new Error(`Request ${id} not found`);
        const note = {
            id: nextId(req.notes || []),
            text: body.text,
            author: 'Operator',
            createdAt: new Date().toISOString()
        };
        req.notes = [...(req.notes || []), note];
        save();
        return note;
    }

    // --- Activity log ------------------------------------------------------
    if (route === 'GET /admin/logs') {
        const q = query || {};
        let items = [...db.logs].sort((a, b) => new Date(b.at) - new Date(a.at));
        const users = [...new Set(db.logs.map(l => l.user).filter(Boolean))].sort();

        if (q.user && q.user !== 'all') items = items.filter(l => l.user === q.user);
        if (q.group && q.group !== 'all') items = items.filter(l => l.action.startsWith(q.group + '.'));
        if (q.from) items = items.filter(l => l.at.slice(0, 10) >= q.from);
        if (q.to) items = items.filter(l => l.at.slice(0, 10) <= q.to);
        if (q.q) {
            const needle = String(q.q).toLowerCase();
            items = items.filter(l =>
                `${l.user} ${l.action} ${l.target || ''}`.toLowerCase().includes(needle));
        }
        return { items, total: items.length, users };
    }

    if (route === 'POST /admin/logs') {
        const entry = { ...body, id: nextId(db.logs) };
        db.logs.push(entry);
        // An unbounded log would eventually fill this browser's storage.
        if (db.logs.length > 500) db.logs = db.logs.slice(-500);
        save();
        return entry;
    }

    // --- Services ----------------------------------------------------------
    if (route === 'GET /admin/services') {
        return { items: [...db.services] };
    }
    if (route === 'POST /admin/services') {
        const service = { ...body, id: nextId(db.services) };
        db.services.push(service);
        save();
        return service;
    }
    m = path.match(/^\/admin\/services\/(\d+)$/);
    if (m) {
        const id = Number(m[1]);
        const index = db.services.findIndex(s => s.id === id);
        if (index === -1) throw new Error(`Service ${id} not found`);
        if (method === 'PUT') {
            db.services[index] = { ...db.services[index], ...body, id };
            save();
            return { ...db.services[index] };
        }
        if (method === 'DELETE') {
            db.services.splice(index, 1);
            save();
            return null;
        }
    }

    // --- Portfolio ---------------------------------------------------------
    if (route === 'GET /admin/portfolio') {
        return { items: [...db.portfolio].sort((a, b) => a.order - b.order) };
    }
    if (route === 'POST /admin/portfolio') {
        const item = { ...body, id: nextId(db.portfolio), order: db.portfolio.length + 1 };
        db.portfolio.push(item);
        save();
        return item;
    }
    if (route === 'PUT /admin/portfolio/order') {
        body.ids.forEach((id, i) => {
            const item = db.portfolio.find(p => p.id === Number(id));
            if (item) item.order = i + 1;
        });
        save();
        return { items: [...db.portfolio].sort((a, b) => a.order - b.order) };
    }
    m = path.match(/^\/admin\/portfolio\/(\d+)$/);
    if (m) {
        const id = Number(m[1]);
        const index = db.portfolio.findIndex(p => p.id === id);
        if (index === -1) throw new Error(`Portfolio item ${id} not found`);
        if (method === 'PUT') {
            db.portfolio[index] = { ...db.portfolio[index], ...body, id };
            save();
            return { ...db.portfolio[index] };
        }
        if (method === 'DELETE') {
            db.portfolio.splice(index, 1);
            save();
            return null;
        }
    }

    throw new Error(`No demo handler for ${route}`);
}
