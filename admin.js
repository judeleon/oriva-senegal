/* =====================================================
   ORIVA SENEGAL - ADMINISTRATION
   Dépend de : config.js (db), Chart.js
   Rôles : admin (tout), gestionnaire (catalogue + commandes),
           vendeur (commandes et clients)
===================================================== */

const BUCKET = "product-images";
const STATUSES = ["Nouvelle", "Confirmée", "En préparation", "En livraison", "Livrée", "Annulée"];
const ROLE_LABELS = { admin: "Administrateur", gestionnaire: "Gestionnaire", vendeur: "Vendeur" };
const ALL = ["admin", "gestionnaire", "vendeur"];
const MANAGERS = ["admin", "gestionnaire"];

const ICONS = {
    dashboard: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
    orders: '<path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>',
    products: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    categories: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    coupons: '<path d="M20 12V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v0a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v0a2 2 0 0 1 0-4z"/><path d="M10 9l4 6M10 10h.01M14 14h.01"/>',
    zones: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    customers: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
    users: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><circle cx="12" cy="10" r="2.5"/><path d="M8 16a4 4 0 0 1 8 0"/>',
    logs: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    account: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 21 2M16 7l3 3M18 5l2 2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
    money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'
};
const icon = name => `<svg viewBox="0 0 24 24">${ICONS[name] || ""}</svg>`;

const PAGES = [
    { id: "dashboard",  label: "Tableau de bord", roles: ALL, group: "Principal" },
    { id: "orders",     label: "Commandes",       roles: ALL },
    { id: "customers",  label: "Clients",         roles: ALL },
    { id: "products",   label: "Produits",        roles: MANAGERS, group: "Catalogue" },
    { id: "categories", label: "Catégories",      roles: MANAGERS },
    { id: "coupons",    label: "Codes promo",     roles: MANAGERS },
    { id: "zones",      label: "Livraison",       roles: MANAGERS },
    { id: "users",      label: "Utilisateurs",    roles: ["admin"], group: "Administration" },
    { id: "logs",       label: "Journal",         roles: ["admin"] },
    { id: "settings",   label: "Réglages",        roles: ["admin"] },
    { id: "account",    label: "Mon compte",      roles: ALL, group: "Compte" }
];

const S = {
    me: null,
    page: "dashboard",
    settings: {},
    orders: [],
    products: [],
    categories: [],
    coupons: [],
    zones: [],
    period: 30,
    orderFilter: { status: "all", search: "", from: "", to: "" },
    productFilter: { search: "", category: "", stock: "" },
    customerSearch: "",
    knownOrders: null,
    charts: {}
};


/* ---------- Utilitaires ---------- */

const $ = id => document.getElementById(id);
const sameId = (a, b) => String(a) === String(b);
const money = n => (Number(n) || 0).toLocaleString("fr-FR").replace(/\u202f/g, " ") + " FCFA";
const num = n => (Number(n) || 0).toLocaleString("fr-FR").replace(/\u202f/g, " ");
const digits = v => String(v || "").replace(/\D/g, "");
const can = roles => S.me && roles.includes(S.me.role);

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]
    ));
}

function fmtDate(d, withTime = true) {
    const date = new Date(d);
    if (!d || isNaN(date)) return "—";
    return date.toLocaleString("fr-FR", withTime ? { dateStyle: "short", timeStyle: "short" } : { dateStyle: "medium" });
}

function timeAgo(d) {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return "à l'instant";
    if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
    if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
    return `il y a ${Math.floor(s / 86400)} j`;
}

function toast(message, type = "") {
    const el = $("toast");
    el.textContent = message;
    el.className = "toast show " + type;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 3000);
}

function errMsg(err) {
    const m = (err && (err.message || err.error_description || err.error)) || "Erreur inconnue";
    if (/row-level security|permission denied/i.test(m)) return "Action non autorisée pour votre rôle.";
    if (/violates foreign key.*categor/i.test(m)) return "Catégorie utilisée par des produits : déplacez-les d'abord.";
    if (/duplicate key/i.test(m)) return "Cet élément existe déjà.";
    if (/Failed to fetch|NetworkError/i.test(m)) return "Connexion impossible. Vérifiez internet.";
    return m;
}

function fail(err, prefix = "") {
    console.error(err);
    toast((prefix ? prefix + " : " : "") + errMsg(err), "error");
}

function statusBadge(status) {
    return `<span class="badge b-${esc(status).replace(/\s/g, "-")}">${esc(status)}</span>`;
}

function emptyState(iconName, title, text = "") {
    return `<div class="empty">${icon(iconName)}<h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
}

function waLink(phone, text = "") {
    let d = digits(phone);
    if (d.length === 9) d = "221" + d;
    return "https://wa.me/" + d + (text ? "?text=" + encodeURIComponent(text) : "");
}

function downloadCSV(filename, headers, rows) {
    const cell = v => {
        const s = String(v ?? "");
        return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = "\ufeff" + [headers, ...rows].map(r => r.map(cell).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function beep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.setValueAtTime(.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .5);
        o.start(); o.stop(ctx.currentTime + .5);
    } catch (e) { /* audio indisponible */ }
}


/* ---------- Fenêtres ---------- */

function openModal(title, html, wide = false) {
    $("modal-title").textContent = title;
    $("modal-body").innerHTML = html;
    $("modal-box").classList.toggle("wide", wide);
    $("modal").classList.add("open");
    document.body.classList.add("no-scroll");
    setTimeout(() => $("modal-body").querySelector("input:not([type=hidden]):not([type=checkbox]), select, textarea")?.focus(), 50);
}

function closeModal() {
    $("modal").classList.remove("open");
    if (!$("drawer").classList.contains("open")) document.body.classList.remove("no-scroll");
}

function openDrawer(title, html) {
    $("drawer-title").textContent = title;
    $("drawer-body").innerHTML = html;
    $("drawer").classList.add("open");
    $("overlay").classList.add("show");
    document.body.classList.add("no-scroll");
}

function closeDrawer() {
    $("drawer").classList.remove("open");
    $("overlay").classList.remove("show");
    document.body.classList.remove("no-scroll");
}

function formData(form) {
    const data = {};
    form.querySelectorAll("[name]").forEach(el => {
        if (el.type === "checkbox") data[el.name] = el.checked;
        else if (el.type === "number") data[el.name] = el.value === "" ? null : Number(el.value);
        else if (el.type === "file") return;
        else data[el.name] = el.value.trim();
    });
    return data;
}

async function withButton(button, fn) {
    const label = button.innerHTML;
    button.disabled = true;
    button.textContent = "Enregistrement...";
    try { return await fn(); } finally { button.disabled = false; button.innerHTML = label; }
}


/* =====================================================
   AUTHENTIFICATION
===================================================== */

function showAuthForm(id) {
    ["login-form", "forgot-form", "recovery-form"].forEach(f => { $(f).hidden = f !== id; });
    $("auth-view").hidden = false;
    $("app").hidden = true;
}

async function startSession() {
    const { data: { user } } = await db.auth.getUser();
    if (!user) return showAuthForm("login-form");

    const { data: me, error } = await db.from("staff").select("*").eq("user_id", user.id).maybeSingle();
    if (error || !me || !me.active) {
        await db.auth.signOut();
        showAuthForm("login-form");
        $("login-error").textContent = error
            ? "Base non configurée : exécutez supabase-setup.sql."
            : "Ce compte n'a pas accès à l'administration.";
        return;
    }

    S.me = { ...me, email: user.email };
    $("auth-view").hidden = true;
    $("app").hidden = false;

    const name = me.full_name || user.email;
    $("user-name").textContent = name;
    $("user-role").textContent = ROLE_LABELS[me.role];
    $("user-avatar").textContent = name.trim()[0].toUpperCase();

    renderNav();
    const fromHash = location.hash.slice(1);
    const page = PAGES.find(p => p.id === fromHash && can(p.roles)) ? fromHash : "dashboard";
    await loadBase();
    go(page);
}

function bindAuth() {
    document.querySelectorAll("[data-auth]").forEach(b => b.addEventListener("click", () => showAuthForm(b.dataset.auth)));

    document.querySelectorAll(".pw-toggle").forEach(b => b.addEventListener("click", () => {
        const input = b.previousElementSibling;
        input.type = input.type === "password" ? "text" : "password";
        b.textContent = input.type === "password" ? "Afficher" : "Masquer";
    }));

    $("login-form").addEventListener("submit", async e => {
        e.preventDefault();
        const button = e.submitter || $("login-form").querySelector("[type=submit]");
        $("login-error").textContent = "";
        button.disabled = true;
        const { error } = await db.auth.signInWithPassword({
            email: $("login-email").value.trim(),
            password: $("login-password").value
        });
        button.disabled = false;
        if (error) {
            $("login-error").textContent = /confirm/i.test(error.message)
                ? "E-mail non confirmé." : "E-mail ou mot de passe incorrect.";
            return;
        }
        $("login-password").value = "";
        startSession();
    });

    $("forgot-form").addEventListener("submit", async e => {
        e.preventDefault();
        const msg = $("forgot-msg");
        const { error } = await db.auth.resetPasswordForEmail($("forgot-email").value.trim(), {
            redirectTo: location.origin + location.pathname
        });
        msg.className = "form-error " + (error ? "" : "ok");
        msg.textContent = error ? errMsg(error) : "Si ce compte existe, un e-mail vient d'être envoyé.";
    });

    $("recovery-form").addEventListener("submit", async e => {
        e.preventDefault();
        const p1 = $("recovery-password").value;
        const msg = $("recovery-msg");
        if (p1.length < 8) return (msg.textContent = "8 caractères minimum.");
        if (p1 !== $("recovery-password2").value) return (msg.textContent = "Les mots de passe ne correspondent pas.");
        const { error } = await db.auth.updateUser({ password: p1 });
        if (error) return (msg.textContent = errMsg(error));
        history.replaceState(null, "", location.pathname);
        toast("Mot de passe modifié", "success");
        startSession();
    });

    db.auth.onAuthStateChange(event => {
        if (event === "PASSWORD_RECOVERY") showAuthForm("recovery-form");
        if (event === "SIGNED_OUT") { S.me = null; showAuthForm("login-form"); }
    });

    $("logout-btn").addEventListener("click", () => db.auth.signOut());
    $("user-chip").addEventListener("click", () => window.innerWidth <= 900 && go("account"));
}


/* =====================================================
   NAVIGATION & CHARGEMENT
===================================================== */

function renderNav() {
    const newCount = S.orders.filter(o => o.status === "Nouvelle").length;
    $("side-nav").innerHTML = PAGES.filter(p => can(p.roles)).map(p => `
        ${p.group ? `<div class="side-label">${p.group}</div>` : ""}
        <button type="button" class="nav-item ${p.id === S.page ? "active" : ""}" data-page="${p.id}">
            ${icon(p.id)} ${p.label}
            ${p.id === "orders" && newCount ? `<span class="nav-count">${newCount}</span>` : ""}
        </button>`).join("");
    document.title = (newCount ? `(${newCount}) ` : "") + "Administration – Oriva Senegal";
}

function go(page) {
    const def = PAGES.find(p => p.id === page);
    if (!def || !can(def.roles)) page = "dashboard";
    S.page = page;
    history.replaceState(null, "", "#" + page);
    document.querySelectorAll(".page").forEach(p => { p.hidden = p.id !== "page-" + page; });
    $("page-title").textContent = PAGES.find(p => p.id === page).label;
    $("sidebar").classList.remove("open");
    $("side-overlay").classList.remove("show");
    renderNav();
    renderPage();
    window.scrollTo(0, 0);
}

async function loadBase() {
    const queries = [
        db.from("settings").select("*").eq("id", 1).maybeSingle(),
        db.from("orders").select("*").order("created_at", { ascending: false }).limit(5000),
        db.from("products").select("*").order("created_at", { ascending: false }),
        db.from("categories").select("*").order("sort_order").order("name")
    ];
    if (can(MANAGERS)) {
        queries.push(db.from("coupons").select("*").order("created_at", { ascending: false }));
        queries.push(db.from("delivery_zones").select("*").order("sort_order").order("name"));
    }

    const [settings, orders, products, categories, coupons, zones] = await Promise.all(queries);
    const error = [settings, orders, products, categories, coupons, zones].find(r => r && r.error);
    if (error) return fail(error.error, "Chargement");

    S.settings = settings.data || {};
    S.orders = orders.data;
    S.products = products.data;
    S.categories = categories.data;
    if (coupons) S.coupons = coupons.data;
    if (zones) S.zones = zones.data;

    const newIds = S.orders.filter(o => o.status === "Nouvelle").map(o => o.id);
    if (S.knownOrders) {
        const fresh = newIds.filter(id => !S.knownOrders.has(id));
        if (fresh.length) {
            beep();
            toast(fresh.length > 1 ? `${fresh.length} nouvelles commandes !` : "Nouvelle commande !", "success");
        }
    }
    S.knownOrders = new Set(S.orders.map(o => o.id));
}

async function refresh(silent = false) {
    const btn = $("refresh-btn");
    btn.classList.add("spin");
    await loadBase();
    btn.classList.remove("spin");
    renderNav();
    if (!$("modal").classList.contains("open")) renderPage();
    if (!silent) toast("Données actualisées");
}

function renderPage() {
    const renderers = {
        dashboard: renderDashboard, orders: renderOrders, customers: renderCustomers,
        products: renderProducts, categories: () => renderCrud(CRUD.categories),
        coupons: () => renderCrud(CRUD.coupons), zones: () => renderCrud(CRUD.zones),
        users: renderUsers, logs: renderLogs, settings: renderSettings, account: renderAccount
    };
    renderers[S.page]();
}


/* =====================================================
   TABLEAU DE BORD
===================================================== */

function periodOrders(days) {
    const since = days ? Date.now() - days * 86400000 : 0;
    return S.orders.filter(o => new Date(o.created_at) >= since);
}

function renderDashboard() {
    const days = S.period;
    const orders = periodOrders(days);
    const valid = orders.filter(o => o.status !== "Annulée");
    const revenue = valid.reduce((s, o) => s + o.total, 0);
    const delivered = valid.filter(o => o.status === "Livrée");
    const prev = days ? S.orders.filter(o => {
        const t = new Date(o.created_at);
        return o.status !== "Annulée" && t >= Date.now() - 2 * days * 86400000 && t < Date.now() - days * 86400000;
    }) : [];
    const prevRevenue = prev.reduce((s, o) => s + o.total, 0);
    const trend = days && prevRevenue ? Math.round((revenue - prevRevenue) / prevRevenue * 100) : null;
    const customers = new Set(valid.map(o => digits(o.customer_phone)));
    const toProcess = S.orders.filter(o => ["Nouvelle", "Confirmée", "En préparation"].includes(o.status));
    const threshold = S.settings.low_stock_threshold ?? 5;
    const lowStock = S.products.filter(p => p.active && p.stock <= threshold).sort((a, b) => a.stock - b.stock);

    const top = {};
    valid.forEach(o => (o.items || []).forEach(i => {
        top[i.name] ??= { name: i.name, qty: 0, revenue: 0 };
        top[i.name].qty += i.quantity;
        top[i.name].revenue += i.price * i.quantity;
    }));
    const topList = Object.values(top).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
    const maxTop = topList[0]?.revenue || 1;

    $("page-dashboard").innerHTML = `
        <div class="page-head">
            <p class="muted">Bonjour ${esc((S.me.full_name || "").split(" ")[0])}, voici l'activité de votre boutique.</p>
            <select id="period-select" style="width:auto;margin:0">
                ${[[7, "7 derniers jours"], [30, "30 derniers jours"], [90, "90 derniers jours"], [365, "12 derniers mois"], [0, "Depuis le début"]]
                    .map(([v, l]) => `<option value="${v}" ${v === days ? "selected" : ""}>${l}</option>`).join("")}
            </select>
        </div>

        <div class="kpis">
            <div class="card kpi"><div class="kpi-icon c1">${icon("money")}</div><div><span>Chiffre d'affaires</span><strong>${money(revenue)}</strong>
                <small>${trend === null ? "Commandes non annulées" : `${trend >= 0 ? "▲" : "▼"} ${Math.abs(trend)}% vs période précédente`}</small></div></div>
            <div class="card kpi"><div class="kpi-icon c2">${icon("orders")}</div><div><span>Commandes</span><strong>${num(valid.length)}</strong>
                <small>${delivered.length} livrée(s)</small></div></div>
            <div class="card kpi"><div class="kpi-icon c3">${icon("dashboard")}</div><div><span>Panier moyen</span><strong>${money(valid.length ? Math.round(revenue / valid.length) : 0)}</strong>
                <small>${customers.size} client(s)</small></div></div>
            <div class="card kpi"><div class="kpi-icon c4">${icon("alert")}</div><div><span>À traiter</span><strong>${toProcess.length}</strong>
                <small>${lowStock.length} produit(s) en stock bas</small></div></div>
        </div>

        <div class="grid-2">
            <div class="card"><div class="card-head"><h3>Ventes</h3><span class="muted small">Chiffre d'affaires par jour</span></div>
                <div class="chart-box"><canvas id="chart-sales"></canvas></div></div>
            <div class="card"><div class="card-head"><h3>Statuts</h3></div>
                <div class="chart-box"><canvas id="chart-status"></canvas></div></div>
        </div>

        <div class="grid-2-even">
            <div class="card">
                <div class="card-head"><h3>Commandes à traiter</h3><button type="button" class="btn btn-link btn-sm" data-page="orders">Tout voir</button></div>
                ${toProcess.length ? `<ul class="list">${toProcess.slice(0, 6).map(o => `
                    <li class="clickable" data-order="${esc(o.id)}" style="cursor:pointer">
                        <div><strong>${esc(o.customer_name)}</strong><div class="muted small">${esc(o.id)} · ${timeAgo(o.created_at)}</div></div>
                        <div class="right"><strong>${money(o.total)}</strong><div>${statusBadge(o.status)}</div></div>
                    </li>`).join("")}</ul>` : emptyState("orders", "Tout est à jour", "Aucune commande en attente.")}
            </div>
            <div class="card">
                <div class="card-head"><h3>Meilleures ventes</h3></div>
                ${topList.length ? `<ul class="list">${topList.map(t => `
                    <li><div style="flex:1"><strong>${esc(t.name)}</strong><div class="muted small">${t.qty} vendu(s)</div>
                        <div class="bar"><span style="width:${t.revenue / maxTop * 100}%"></span></div></div>
                        <strong class="nowrap">${money(t.revenue)}</strong></li>`).join("")}</ul>`
                    : emptyState("products", "Pas encore de ventes")}
            </div>
        </div>

        ${lowStock.length && can(MANAGERS) ? `
        <div class="card">
            <div class="card-head"><h3>Alertes de stock</h3><span class="muted small">Seuil : ${threshold}</span></div>
            <ul class="list">${lowStock.slice(0, 8).map(p => `
                <li><div><strong>${esc(p.name)}</strong><div class="muted small">${esc(p.category)}</div></div>
                    <div><span class="${p.stock === 0 ? "stock-out" : "stock-low"}">${p.stock === 0 ? "Rupture" : p.stock + " restant(s)"}</span>
                    <button type="button" class="btn btn-ghost btn-sm" data-edit-product="${p.id}" style="margin-left:10px">Réapprovisionner</button></div></li>`).join("")}
            </ul>
        </div>` : ""}`;

    $("period-select").addEventListener("change", e => { S.period = Number(e.target.value); renderDashboard(); });
    drawCharts(valid, orders, days);
}

function drawCharts(valid, orders, days) {
    if (typeof Chart === "undefined") return;
    Object.values(S.charts).forEach(c => c.destroy());
    Chart.defaults.font.family = "Plus Jakarta Sans, system-ui, sans-serif";
    Chart.defaults.color = "#64748b";

    const span = days || Math.max(7, Math.ceil((Date.now() - new Date(S.orders.at(-1)?.created_at || Date.now())) / 86400000) + 1);
    const byMonth = span > 92;
    const buckets = new Map();
    const now = new Date();

    if (byMonth) {
        const months = Math.min(24, Math.ceil(span / 30));
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            buckets.set(`${d.getFullYear()}-${d.getMonth()}`, { label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }), value: 0, count: 0 });
        }
    } else {
        for (let i = span - 1; i >= 0; i--) {
            const d = new Date(now); d.setDate(d.getDate() - i);
            buckets.set(d.toDateString(), { label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), value: 0, count: 0 });
        }
    }

    valid.forEach(o => {
        const d = new Date(o.created_at);
        const b = buckets.get(byMonth ? `${d.getFullYear()}-${d.getMonth()}` : d.toDateString());
        if (b) { b.value += o.total; b.count++; }
    });

    const data = [...buckets.values()];
    const ctx = $("chart-sales").getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, "rgba(15,118,110,.25)");
    gradient.addColorStop(1, "rgba(15,118,110,0)");

    S.charts.sales = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                label: "Chiffre d'affaires", data: data.map(d => d.value), borderColor: "#0f766e",
                backgroundColor: gradient, fill: true, tension: .35, pointRadius: data.length > 40 ? 0 : 3, borderWidth: 2.5
            }]
        },
        options: {
            maintainAspectRatio: false, interaction: { intersect: false, mode: "index" },
            plugins: { legend: { display: false }, tooltip: { callbacks: {
                label: c => money(c.parsed.y), afterLabel: c => `${data[c.dataIndex].count} commande(s)`
            } } },
            scales: { y: { beginAtZero: true, ticks: { callback: v => num(v) }, grid: { color: "#f1f5f9" } }, x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } } }
        }
    });

    const colors = { "Nouvelle": "#2563eb", "Confirmée": "#9333ea", "En préparation": "#d97706", "En livraison": "#0891b2", "Livrée": "#16a34a", "Annulée": "#dc2626" };
    const counts = STATUSES.map(s => orders.filter(o => o.status === s).length);
    S.charts.status = new Chart($("chart-status"), {
        type: "doughnut",
        data: { labels: STATUSES, datasets: [{ data: counts, backgroundColor: STATUSES.map(s => colors[s]), borderWidth: 2, borderColor: "#fff" }] },
        options: { maintainAspectRatio: false, cutout: "65%", plugins: { legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true, padding: 12 } } } }
    });
}


/* =====================================================
   COMMANDES
===================================================== */

function filteredOrders() {
    const f = S.orderFilter;
    const q = f.search.toLowerCase();
    const from = f.from ? new Date(f.from + "T00:00:00") : null;
    const to = f.to ? new Date(f.to + "T23:59:59") : null;
    return S.orders.filter(o =>
        (f.status === "all" || o.status === f.status) &&
        (!from || new Date(o.created_at) >= from) &&
        (!to || new Date(o.created_at) <= to) &&
        (!q || `${o.id} ${o.customer_name} ${o.customer_phone} ${o.customer_address} ${o.zone_name}`.toLowerCase().includes(q)));
}

function renderOrders() {
    const f = S.orderFilter;
    const page = $("page-orders");

    if (!page.dataset.ready) {
        page.dataset.ready = "1";
        page.innerHTML = `
            <div class="tabs" id="order-tabs"></div>
            <div class="toolbar">
                <input type="search" class="search-input" id="order-search" placeholder="Rechercher : n° de commande, nom, téléphone, adresse...">
                <input type="date" id="order-from" title="Du">
                <input type="date" id="order-to" title="Au">
                <button type="button" class="btn btn-ghost" id="order-export">${icon("download")} Exporter</button>
            </div>
            <div class="card"><div class="table-wrap" id="orders-table"></div></div>`;

        $("order-search").addEventListener("input", e => { f.search = e.target.value.trim(); renderOrders(); });
        $("order-from").addEventListener("change", e => { f.from = e.target.value; renderOrders(); });
        $("order-to").addEventListener("change", e => { f.to = e.target.value; renderOrders(); });
        $("order-export").addEventListener("click", exportOrders);
        $("order-tabs").addEventListener("click", e => {
            const t = e.target.closest("[data-status]");
            if (t) { f.status = t.dataset.status; renderOrders(); }
        });
    }

    $("order-tabs").innerHTML = ["all", ...STATUSES].map(s => {
        const count = s === "all" ? S.orders.length : S.orders.filter(o => o.status === s).length;
        return `<button type="button" class="tab ${f.status === s ? "active" : ""}" data-status="${s}">${s === "all" ? "Toutes" : s}<em>${count}</em></button>`;
    }).join("");

    const list = filteredOrders();
    $("orders-table").innerHTML = list.length ? `
        <table>
            <thead><tr><th>Commande</th><th>Client</th><th>Livraison</th><th>Total</th><th>Paiement</th><th>Statut</th></tr></thead>
            <tbody>${list.map(o => `
                <tr class="clickable" data-order="${esc(o.id)}">
                    <td><strong>${esc(o.id)}</strong><div class="muted small">${fmtDate(o.created_at)}</div></td>
                    <td><strong>${esc(o.customer_name)}</strong><div class="muted small">${esc(o.customer_phone)}</div></td>
                    <td>${esc(o.zone_name || "—")}<div class="muted small">${(o.items || []).reduce((s, i) => s + i.quantity, 0)} article(s)</div></td>
                    <td class="nowrap"><strong>${money(o.total)}</strong></td>
                    <td>${esc(o.payment_method)}<div>${o.paid ? '<span class="badge b-ok">Payé</span>' : '<span class="badge b-off">Non payé</span>'}</div></td>
                    <td>${statusBadge(o.status)}</td>
                </tr>`).join("")}
            </tbody>
        </table>
        <div class="pager"><span>${list.length} commande(s)</span><strong>Total : ${money(list.filter(o => o.status !== "Annulée").reduce((s, o) => s + o.total, 0))}</strong></div>`
        : emptyState("orders", "Aucune commande", "Aucune commande ne correspond à ces filtres.");
}

function exportOrders() {
    const list = filteredOrders();
    downloadCSV(`commandes-${new Date().toISOString().slice(0, 10)}.csv`,
        ["N°", "Date", "Client", "Téléphone", "Zone", "Adresse", "Produits", "Sous-total", "Réduction", "Code promo", "Livraison", "Total", "Paiement", "Payé", "Statut", "Note client", "Note interne"],
        list.map(o => [o.id, fmtDate(o.created_at), o.customer_name, o.customer_phone, o.zone_name, o.customer_address,
            (o.items || []).map(i => `${i.name} x${i.quantity}`).join(" | "), o.subtotal, o.discount, o.coupon_code || "",
            o.delivery_fee, o.total, o.payment_method, o.paid ? "Oui" : "Non", o.status, o.notes, o.internal_note]));
}

async function openOrder(id) {
    const o = S.orders.find(x => x.id === id);
    if (!o) return;

    const { data: events } = await db.from("order_events").select("*").eq("order_id", id).order("created_at");
    const locked = o.status === "Annulée";
    const msg = `Bonjour ${o.customer_name}, ici ${S.settings.store_name || "Oriva Senegal"}. Votre commande ${o.id} (${money(o.total)}) est : ${o.status}.`;

    openDrawer("Commande " + o.id, `
        <div class="block">
            <div class="row"><span class="muted">Passée le</span><strong>${fmtDate(o.created_at)}</strong></div>
            <div class="row"><span class="muted">Statut</span>${statusBadge(o.status)}</div>
        </div>

        <div class="block">
            <h4>Client</h4>
            <div class="info-box">
                <p><strong>${esc(o.customer_name)}</strong></p>
                <p>${esc(o.customer_phone)}</p>
                <p>${esc(o.zone_name ? o.zone_name + " — " : "")}${esc(o.customer_address)}</p>
                ${o.notes ? `<p class="muted">Instructions : ${esc(o.notes)}</p>` : ""}
            </div>
            <div class="btn-row">
                <a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${esc(waLink(o.customer_phone, msg))}">WhatsApp</a>
                <a class="btn btn-ghost btn-sm" href="tel:${esc(o.customer_phone.replace(/\s/g, ""))}">${icon("phone")} Appeler</a>
                <button type="button" class="btn btn-ghost btn-sm" id="print-invoice">${icon("print")} Facture</button>
            </div>
        </div>

        <div class="block">
            <h4>Produits</h4>
            <div class="info-box">
                ${(o.items || []).map(i => `<div class="row"><span>${esc(i.name)} <span class="muted">× ${i.quantity}</span></span><span>${money(i.price * i.quantity)}</span></div>`).join("")}
                <div class="row total" style="font-size:1em"><span>Sous-total</span><span>${money(o.subtotal || o.total)}</span></div>
                ${o.discount ? `<div class="row" style="color:var(--success)"><span>Réduction ${o.coupon_code ? "(" + esc(o.coupon_code) + ")" : ""}</span><span>− ${money(o.discount)}</span></div>` : ""}
                <div class="row"><span>Livraison</span><span>${o.delivery_fee ? money(o.delivery_fee) : "Offerte"}</span></div>
                <div class="row total"><strong>Total</strong><strong>${money(o.total)}</strong></div>
            </div>
        </div>

        <div class="block">
            <h4>Traitement</h4>
            <div class="form-grid">
                <label>Statut
                    <select id="o-status" ${locked ? "disabled" : ""}>${STATUSES.map(s => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select>
                </label>
                <label>Paiement (${esc(o.payment_method)})
                    <select id="o-paid"><option value="0" ${!o.paid ? "selected" : ""}>Non payé</option><option value="1" ${o.paid ? "selected" : ""}>Payé</option></select>
                </label>
                <label class="full" style="margin-top:12px">Note interne (visible par l'équipe uniquement)
                    <textarea id="o-note" rows="3" placeholder="Ex : client rappelé, livreur Moussa...">${esc(o.internal_note)}</textarea>
                </label>
            </div>
            <div class="btn-row" style="justify-content:space-between">
                ${can(["admin"]) ? `<button type="button" class="btn btn-danger btn-sm" id="o-delete">${icon("trash")} Supprimer</button>` : "<span></span>"}
                <button type="button" class="btn btn-primary" id="o-save">Enregistrer</button>
            </div>
        </div>

        <div class="block">
            <h4>Historique</h4>
            <ul class="timeline">${(events || []).map(e => `<li><strong>${esc(e.status)}</strong><small>${fmtDate(e.created_at)}${e.by_email ? " · " + esc(e.by_email) : ""}</small></li>`).join("") || '<li class="muted">Aucun historique</li>'}</ul>
        </div>`);

    $("print-invoice").addEventListener("click", () => printInvoice(o));
    $("o-save").addEventListener("click", e => withButton(e.currentTarget, () => saveOrder(o)));
    $("o-delete")?.addEventListener("click", () => deleteOrder(o));
}

async function saveOrder(o) {
    const status = $("o-status").value;
    const changes = { paid: $("o-paid").value === "1", internal_note: $("o-note").value.trim() };
    if (status !== o.status) {
        if (status === "Annulée" && !confirm("Annuler cette commande ? Le stock et le code promo seront remis. L'annulation est définitive.")) return;
        changes.status = status;
    }

    const { error } = await db.from("orders").update(changes).eq("id", o.id);
    if (error) return fail(error, "Enregistrement");

    toast("Commande mise à jour", "success");
    await loadBase();
    renderNav();
    renderPage();
    openOrder(o.id);
}

async function deleteOrder(o) {
    if (!confirm(`Supprimer définitivement la commande ${o.id} ?\n\nLe stock n'est pas remis : préférez « Annulée » si besoin.`)) return;
    const { error } = await db.from("orders").delete().eq("id", o.id);
    if (error) return fail(error, "Suppression");
    closeDrawer();
    toast("Commande supprimée", "success");
    await refresh(true);
}

function printInvoice(o) {
    const s = S.settings;
    const w = window.open("", "_blank");
    if (!w) return toast("Autorisez les fenêtres pop-up pour imprimer.", "error");

    w.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Facture ${esc(o.id)}</title>
        <style>
            body{font-family:Arial,sans-serif;color:#0f172a;max-width:780px;margin:30px auto;padding:0 20px;font-size:14px}
            .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f766e;padding-bottom:16px;margin-bottom:24px}
            h1{color:#0f766e;margin:0 0 4px;font-size:26px} .muted{color:#64748b} table{width:100%;border-collapse:collapse;margin:20px 0}
            th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left} th{background:#f1f5f9} .r{text-align:right}
            .tot td{font-weight:bold;font-size:16px;border-top:2px solid #0f172a} .box{background:#f8fafc;padding:14px;border-radius:8px}
            .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px} footer{margin-top:40px;text-align:center;color:#64748b;font-size:12px}
            @media print{button{display:none}}
        </style></head><body>
        <div class="head">
            <div><h1>${esc(s.store_name || "Oriva Senegal")}</h1><div class="muted">${esc(s.address || "")}<br>${esc(s.phone || "+" + digits(s.whatsapp_number))}${s.email ? "<br>" + esc(s.email) : ""}</div></div>
            <div class="r"><h2 style="margin:0">FACTURE</h2><div><strong>${esc(o.id)}</strong></div><div class="muted">${fmtDate(o.created_at, false)}</div></div>
        </div>
        <div class="grid">
            <div class="box"><strong>Client</strong><br>${esc(o.customer_name)}<br>${esc(o.customer_phone)}<br>${esc(o.zone_name ? o.zone_name + " — " : "")}${esc(o.customer_address)}</div>
            <div class="box"><strong>Paiement</strong><br>${esc(o.payment_method)}<br>${o.paid ? "Payée" : "À payer"}<br>Statut : ${esc(o.status)}</div>
        </div>
        <table><thead><tr><th>Produit</th><th class="r">Prix unitaire</th><th class="r">Qté</th><th class="r">Total</th></tr></thead><tbody>
            ${(o.items || []).map(i => `<tr><td>${esc(i.name)}</td><td class="r">${money(i.price)}</td><td class="r">${i.quantity}</td><td class="r">${money(i.price * i.quantity)}</td></tr>`).join("")}
            <tr><td colspan="3" class="r">Sous-total</td><td class="r">${money(o.subtotal || o.total)}</td></tr>
            ${o.discount ? `<tr><td colspan="3" class="r">Réduction ${esc(o.coupon_code || "")}</td><td class="r">− ${money(o.discount)}</td></tr>` : ""}
            <tr><td colspan="3" class="r">Livraison</td><td class="r">${money(o.delivery_fee)}</td></tr>
            <tr class="tot"><td colspan="3" class="r">TOTAL</td><td class="r">${money(o.total)}</td></tr>
        </tbody></table>
        <footer>Merci pour votre confiance !<br>${esc(s.store_name || "Oriva Senegal")} — ${esc(s.tagline || "")}</footer>
        <p style="text-align:center"><button onclick="print()" style="padding:10px 24px;font-size:15px;cursor:pointer">Imprimer / PDF</button></p>
        </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
}


/* =====================================================
   CLIENTS
===================================================== */

function customerList() {
    const map = new Map();
    S.orders.forEach(o => {
        const key = digits(o.customer_phone).slice(-9);
        if (!key) return;
        const c = map.get(key) || { name: o.customer_name, phone: o.customer_phone, address: o.customer_address, zone: o.zone_name, orders: 0, cancelled: 0, total: 0, last: o.created_at, first: o.created_at };
        if (o.status === "Annulée") c.cancelled++;
        else { c.orders++; c.total += o.total; }
        if (new Date(o.created_at) > new Date(c.last)) c.last = o.created_at;
        if (new Date(o.created_at) <= new Date(c.first)) { c.first = o.created_at; }
        map.set(key, c);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
}

function renderCustomers() {
    const page = $("page-customers");
    if (!page.dataset.ready) {
        page.dataset.ready = "1";
        page.innerHTML = `
            <div class="toolbar">
                <input type="search" class="search-input" id="customer-search" placeholder="Rechercher un client (nom, téléphone, adresse)...">
                <button type="button" class="btn btn-ghost" id="customer-export">${icon("download")} Exporter</button>
            </div>
            <div class="card"><div class="table-wrap" id="customers-table"></div></div>`;
        $("customer-search").addEventListener("input", e => { S.customerSearch = e.target.value.trim().toLowerCase(); renderCustomers(); });
        $("customer-export").addEventListener("click", () => downloadCSV("clients.csv",
            ["Nom", "Téléphone", "Zone", "Adresse", "Commandes", "Annulées", "Total dépensé", "Première commande", "Dernière commande"],
            customerList().map(c => [c.name, c.phone, c.zone, c.address, c.orders, c.cancelled, c.total, fmtDate(c.first), fmtDate(c.last)])));
    }

    const q = S.customerSearch;
    const list = customerList().filter(c => !q || `${c.name} ${c.phone} ${c.address}`.toLowerCase().includes(q));

    $("customers-table").innerHTML = list.length ? `
        <table>
            <thead><tr><th>Client</th><th>Adresse</th><th>Commandes</th><th>Total dépensé</th><th>Dernière commande</th><th></th></tr></thead>
            <tbody>${list.map((c, i) => `
                <tr>
                    <td><div class="cell-product" style="min-width:180px"><span class="avatar">${esc(c.name.trim()[0] || "?").toUpperCase()}</span>
                        <div><strong>${esc(c.name)}</strong><span class="muted small">${esc(c.phone)}</span></div></div></td>
                    <td>${esc(c.zone || "")}<div class="muted small">${esc(c.address)}</div></td>
                    <td>${c.orders}${c.orders >= 3 ? ' <span class="badge b-ok">Fidèle</span>' : ""}${c.cancelled ? `<div class="muted small">${c.cancelled} annulée(s)</div>` : ""}</td>
                    <td class="nowrap"><strong>${money(c.total)}</strong></td>
                    <td class="nowrap">${timeAgo(c.last)}</td>
                    <td class="cell-actions"><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${esc(waLink(c.phone))}">WhatsApp</a>
                        <button type="button" class="btn btn-ghost btn-sm" data-customer-orders="${esc(c.phone)}">Commandes</button></td>
                </tr>`).join("")}
            </tbody>
        </table>
        <div class="pager"><span>${list.length} client(s)</span></div>`
        : emptyState("customers", "Aucun client", "Les clients apparaissent après leur première commande.");
}


/* =====================================================
   PRODUITS
===================================================== */

function renderProducts() {
    const f = S.productFilter;
    const page = $("page-products");
    const threshold = S.settings.low_stock_threshold ?? 5;

    if (!page.dataset.ready) {
        page.dataset.ready = "1";
        page.innerHTML = `
            <div class="toolbar">
                <input type="search" class="search-input" id="product-search" placeholder="Rechercher un produit, une référence...">
                <select id="product-cat"></select>
                <select id="product-stock">
                    <option value="">Tous les stocks</option><option value="low">Stock bas</option><option value="out">Rupture</option>
                    <option value="inactive">Masqués</option>
                </select>
                <button type="button" class="btn btn-ghost" id="product-export">${icon("download")} Exporter</button>
                <button type="button" class="btn btn-primary" id="product-add">${icon("plus")} Nouveau produit</button>
            </div>
            <div class="card"><div class="table-wrap" id="products-table"></div></div>`;

        $("product-search").addEventListener("input", e => { f.search = e.target.value.trim().toLowerCase(); renderProducts(); });
        $("product-cat").addEventListener("change", e => { f.category = e.target.value; renderProducts(); });
        $("product-stock").addEventListener("change", e => { f.stock = e.target.value; renderProducts(); });
        $("product-add").addEventListener("click", () => openProductForm());
        $("product-export").addEventListener("click", () => downloadCSV("produits.csv",
            ["ID", "Nom", "Référence", "Catégorie", "Prix", "Prix barré", "Stock", "Vendus", "Actif", "Vedette"],
            S.products.map(p => [p.id, p.name, p.sku, p.category, p.price, p.compare_at_price ?? "", p.stock, p.sold_count, p.active ? "Oui" : "Non", p.featured ? "Oui" : "Non"])));
    }

    $("product-cat").innerHTML = `<option value="">Toutes les catégories</option>` +
        S.categories.map(c => `<option ${c.name === f.category ? "selected" : ""}>${esc(c.name)}</option>`).join("");

    const list = S.products.filter(p =>
        (!f.category || p.category === f.category) &&
        (!f.search || `${p.name} ${p.sku} ${p.description}`.toLowerCase().includes(f.search)) &&
        (f.stock !== "low" || (p.stock > 0 && p.stock <= threshold)) &&
        (f.stock !== "out" || p.stock === 0) &&
        (f.stock !== "inactive" || !p.active));

    $("products-table").innerHTML = list.length ? `
        <table>
            <thead><tr><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Vendus</th><th>En ligne</th><th></th></tr></thead>
            <tbody>${list.map(p => `
                <tr>
                    <td><div class="cell-product">
                        <span class="thumb">${p.image_url ? `<img src="${esc(p.image_url)}" alt="">` : esc(p.icon)}</span>
                        <div><strong>${esc(p.name)}</strong>
                            <span class="muted small">${p.sku ? "Réf. " + esc(p.sku) : ""}${p.featured ? ' <span class="badge b-warn">Vedette</span>' : ""}</span></div>
                    </div></td>
                    <td>${esc(p.category)}</td>
                    <td class="nowrap"><strong>${money(p.price)}</strong>${p.compare_at_price > p.price ? `<div class="muted small"><s>${money(p.compare_at_price)}</s></div>` : ""}</td>
                    <td><span class="${p.stock === 0 ? "stock-out" : p.stock <= threshold ? "stock-low" : ""}">${p.stock === 0 ? "Rupture" : p.stock}</span></td>
                    <td>${p.sold_count || 0}</td>
                    <td><label class="switch"><input type="checkbox" data-toggle-product="${p.id}" ${p.active ? "checked" : ""}><span></span></label></td>
                    <td class="cell-actions">
                        <button type="button" class="action-btn" data-edit-product="${p.id}" title="Modifier">${icon("edit")}</button>
                        <button type="button" class="action-btn" data-duplicate-product="${p.id}" title="Dupliquer">${icon("copy")}</button>
                        <button type="button" class="action-btn danger" data-delete-product="${p.id}" title="Supprimer">${icon("trash")}</button>
                    </td>
                </tr>`).join("")}
            </tbody>
        </table>
        <div class="pager"><span>${list.length} produit(s)</span><span>Valeur du stock : <strong>${money(list.reduce((s, p) => s + p.price * p.stock, 0))}</strong></span></div>`
        : emptyState("products", "Aucun produit", S.products.length ? "Aucun produit ne correspond aux filtres." : "Ajoutez votre premier produit.");
}

function openProductForm(id = null, duplicate = false) {
    const p = id ? S.products.find(x => sameId(x.id, id)) : null;
    const v = p || { name: "", sku: "", category: S.categories[0]?.name || "", price: "", compare_at_price: "", stock: "", description: "", usage: "", image_url: "", featured: false, active: true };
    const editing = p && !duplicate;

    if (!S.categories.length) return toast("Créez d'abord une catégorie.", "error");

    openModal(editing ? "Modifier le produit" : duplicate ? "Dupliquer le produit" : "Nouveau produit", `
        <form id="product-form">
            <div class="img-field">
                <div class="img-preview" id="img-preview">${v.image_url && !duplicate ? `<img src="${esc(v.image_url)}" alt="">` : "📷"}</div>
                <div>
                    <label>Photo du produit<input type="file" id="p-image" accept="image/jpeg,image/png,image/webp"></label>
                    <span class="hint">JPG, PNG ou WebP. Réduite automatiquement.</span>
                    ${v.image_url && editing ? `<label class="check" style="margin-top:8px"><input type="checkbox" id="p-remove-image"> Retirer la photo</label>` : ""}
                </div>
            </div>
            <div class="form-grid">
                <label class="field full">Nom *<input type="text" name="name" value="${esc(duplicate ? v.name + " (copie)" : v.name)}" maxlength="150" required></label>
                <label class="field">Catégorie *<select name="category" required>${S.categories.map(c => `<option ${c.name === v.category ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
                <label class="field">Référence (SKU)<input type="text" name="sku" value="${esc(duplicate ? "" : v.sku)}" maxlength="50"></label>
                <label class="field">Prix (FCFA) *<input type="number" name="price" value="${esc(v.price)}" min="0" step="1" required></label>
                <label class="field">Prix barré (FCFA)<input type="number" name="compare_at_price" value="${esc(v.compare_at_price ?? "")}" min="0" step="1"><span class="hint">Affiche une promotion si supérieur au prix.</span></label>
                <label class="field">Stock *<input type="number" name="stock" value="${esc(v.stock)}" min="0" step="1" required></label>
                <div class="field" style="padding-top:26px">
                    <label class="check"><input type="checkbox" name="active" ${v.active ? "checked" : ""}> Visible dans la boutique</label>
                    <label class="check"><input type="checkbox" name="featured" ${v.featured ? "checked" : ""}> Coup de cœur (mis en avant)</label>
                </div>
                <label class="field full">Description<textarea name="description" rows="3" maxlength="2000">${esc(v.description)}</textarea></label>
                <label class="field full">Conseils d'utilisation<textarea name="usage" rows="2" maxlength="2000">${esc(v.usage)}</textarea></label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-close>Annuler</button>
                <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
        </form>`, true);

    $("p-image").addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) $("img-preview").innerHTML = `<img src="${URL.createObjectURL(file)}" alt="">`;
    });

    $("product-form").addEventListener("submit", e => {
        e.preventDefault();
        withButton(e.submitter, () => saveProduct(editing ? p : null, duplicate ? v.image_url : ""));
    });
}

async function saveProduct(existing, inheritedImage) {
    const form = $("product-form");
    const d = formData(form);

    if (!d.name || !d.category) return toast("Nom et catégorie obligatoires.", "error");
    for (const k of ["price", "stock"]) {
        if (!Number.isInteger(d[k]) || d[k] < 0) return toast("Prix et stock : nombres entiers positifs.", "error");
    }
    if (d.compare_at_price !== null && (!Number.isInteger(d.compare_at_price) || d.compare_at_price < 0)) {
        return toast("Prix barré invalide.", "error");
    }

    const cat = S.categories.find(c => c.name === d.category);
    const row = { ...d, icon: cat?.icon || "🌿" };

    try {
        const file = $("p-image").files[0];
        if (file) row.image_url = await uploadImage(file);
        else if ($("p-remove-image")?.checked) row.image_url = "";
        else if (!existing && inheritedImage) row.image_url = inheritedImage;

        const { error } = existing
            ? await db.from("products").update(row).eq("id", existing.id)
            : await db.from("products").insert(row);
        if (error) throw error;

        if (existing && existing.image_url && row.image_url !== undefined && row.image_url !== existing.image_url
            && !S.products.some(p => p.id !== existing.id && p.image_url === existing.image_url)) {
            removeImage(existing.image_url);
        }

        closeModal();
        toast("Produit enregistré", "success");
        await refresh(true);
    } catch (err) {
        fail(err, "Enregistrement");
    }
}

function compressImage(file, max = 1000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onerror = () => reject(new Error("Image invalide."));
        img.onload = () => {
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(img.src);
            canvas.toBlob(b => b ? resolve(b) : reject(new Error("Compression impossible.")), "image/jpeg", .82);
        };
        img.src = URL.createObjectURL(file);
    });
}

async function uploadImage(file) {
    if (file.size > 15 * 1024 * 1024) throw new Error("Image trop lourde (15 Mo max).");
    const blob = await compressImage(file);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await db.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" });
    if (error) throw error;
    return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function removeImage(url) {
    const marker = `/${BUCKET}/`;
    if (!url || !url.includes(marker)) return;
    const path = decodeURIComponent(url.split(marker)[1].split("?")[0]);
    await db.storage.from(BUCKET).remove([path]).catch(() => {});
}

async function toggleProduct(id, active) {
    const { error } = await db.from("products").update({ active }).eq("id", id);
    if (error) { fail(error); return renderProducts(); }
    const p = S.products.find(x => sameId(x.id, id));
    if (p) p.active = active;
    toast(active ? "Produit visible dans la boutique" : "Produit masqué", "success");
}

async function deleteProduct(id) {
    const p = S.products.find(x => sameId(x.id, id));
    if (!p || !confirm(`Supprimer « ${p.name} » ?\n\nAstuce : vous pouvez aussi simplement le masquer.`)) return;
    const { error } = await db.from("products").delete().eq("id", id);
    if (error) return fail(error, "Suppression");
    removeImage(p.image_url);
    toast("Produit supprimé", "success");
    await refresh(true);
}


/* =====================================================
   CATÉGORIES, CODES PROMO, ZONES (formulaires génériques)
===================================================== */

const CRUD = {
    categories: {
        page: "categories", table: "categories", key: "id", state: "categories", singular: "catégorie",
        intro: "Les catégories organisent votre catalogue dans la boutique.",
        columns: [
            ["Catégorie", c => `<div class="cell-product" style="min-width:160px"><span class="thumb">${esc(c.icon)}</span><div><strong>${esc(c.name)}</strong><span class="muted small">${esc(c.description)}</span></div></div>`],
            ["Produits", c => S.products.filter(p => p.category === c.name).length],
            ["Ordre", c => c.sort_order],
            ["Statut", c => c.active ? '<span class="badge b-ok">Active</span>' : '<span class="badge b-off">Masquée</span>']
        ],
        fields: [
            { name: "name", label: "Nom *", type: "text", required: true, max: 60 },
            { name: "icon", label: "Icône (emoji)", type: "text", max: 8, default: "🌿" },
            { name: "description", label: "Description", type: "text", max: 200, full: true },
            { name: "sort_order", label: "Ordre d'affichage", type: "number", default: 0 },
            { name: "active", label: "Visible dans la boutique", type: "checkbox", default: true }
        ],
        beforeDelete: c => S.products.some(p => p.category === c.name) ? "Cette catégorie contient des produits : déplacez-les d'abord." : null
    },
    coupons: {
        page: "coupons", table: "coupons", key: "code", state: "coupons", singular: "code promo",
        intro: "Créez des réductions en pourcentage ou en montant fixe. Les codes sont vérifiés côté serveur.",
        columns: [
            ["Code", c => `<strong style="font-family:monospace;font-size:1.05em">${esc(c.code)}</strong>`],
            ["Réduction", c => c.kind === "percent" ? `${c.value} %` : money(c.value)],
            ["Minimum", c => c.min_order ? money(c.min_order) : "—"],
            ["Utilisations", c => `${c.used_count}${c.max_uses ? " / " + c.max_uses : ""}`],
            ["Expire", c => c.expires_at ? fmtDate(c.expires_at) : "Jamais"],
            ["Statut", c => !c.active ? '<span class="badge b-off">Inactif</span>'
                : c.expires_at && new Date(c.expires_at) < new Date() ? '<span class="badge b-warn">Expiré</span>'
                : c.max_uses && c.used_count >= c.max_uses ? '<span class="badge b-warn">Épuisé</span>'
                : '<span class="badge b-ok">Actif</span>']
        ],
        fields: [
            { name: "code", label: "Code *", type: "text", required: true, max: 30, upper: true, lockOnEdit: true, hint: "Ex : BIENVENUE10 (lettres et chiffres)" },
            { name: "kind", label: "Type", type: "select", options: [["percent", "Pourcentage (%)"], ["fixed", "Montant fixe (FCFA)"]] },
            { name: "value", label: "Valeur *", type: "number", required: true, min: 1 },
            { name: "min_order", label: "Commande minimum (FCFA)", type: "number", default: 0, min: 0 },
            { name: "max_uses", label: "Utilisations max.", type: "number", min: 1, hint: "Vide = illimité" },
            { name: "expires_at", label: "Date d'expiration", type: "datetime-local", hint: "Vide = jamais" },
            { name: "active", label: "Actif", type: "checkbox", default: true }
        ],
        transform: d => {
            d.code = (d.code || "").toUpperCase().replace(/\s/g, "");
            d.expires_at = d.expires_at ? new Date(d.expires_at).toISOString() : null;
            if (d.kind === "percent" && d.value > 100) throw new Error("Un pourcentage ne peut pas dépasser 100.");
            return d;
        }
    },
    zones: {
        page: "zones", table: "delivery_zones", key: "id", state: "zones", singular: "zone",
        intro: "Zones proposées au client lors de la commande, avec leurs frais. Laissez vide pour ne pas demander de zone.",
        columns: [
            ["Zone", z => `<strong>${esc(z.name)}</strong>`],
            ["Frais", z => z.fee ? money(z.fee) : "Gratuit"],
            ["Délai", z => esc(z.delay)],
            ["Ordre", z => z.sort_order],
            ["Statut", z => z.active ? '<span class="badge b-ok">Active</span>' : '<span class="badge b-off">Inactive</span>']
        ],
        fields: [
            { name: "name", label: "Nom de la zone *", type: "text", required: true, max: 80, full: true },
            { name: "fee", label: "Frais (FCFA)", type: "number", default: 0, min: 0 },
            { name: "delay", label: "Délai", type: "text", default: "24h", max: 40 },
            { name: "sort_order", label: "Ordre d'affichage", type: "number", default: 0 },
            { name: "active", label: "Active", type: "checkbox", default: true }
        ]
    }
};

function renderCrud(cfg) {
    const rows = S[cfg.state];
    $("page-" + cfg.page).innerHTML = `
        <div class="page-head">
            <p class="muted">${esc(cfg.intro)}</p>
            <button type="button" class="btn btn-primary" data-crud-add="${cfg.page}">${icon("plus")} Ajouter</button>
        </div>
        <div class="card"><div class="table-wrap">${rows.length ? `
            <table>
                <thead><tr>${cfg.columns.map(c => `<th>${c[0]}</th>`).join("")}<th></th></tr></thead>
                <tbody>${rows.map(r => `
                    <tr>${cfg.columns.map(c => `<td>${c[1](r)}</td>`).join("")}
                        <td class="cell-actions">
                            <button type="button" class="action-btn" data-crud-edit="${cfg.page}" data-key="${esc(r[cfg.key])}" title="Modifier">${icon("edit")}</button>
                            <button type="button" class="action-btn danger" data-crud-delete="${cfg.page}" data-key="${esc(r[cfg.key])}" title="Supprimer">${icon("trash")}</button>
                        </td></tr>`).join("")}
                </tbody>
            </table>` : emptyState(cfg.page, "Rien pour l'instant", "Cliquez sur « Ajouter » pour commencer.")}
        </div></div>`;
}

function toLocalInput(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function openCrudForm(cfg, key = null) {
    const row = key !== null ? S[cfg.state].find(r => sameId(r[cfg.key], key)) : null;

    const fieldHtml = f => {
        const val = row ? row[f.name] : f.default;
        if (f.type === "checkbox") {
            return `<label class="check full"><input type="checkbox" name="${f.name}" ${val ? "checked" : ""}> ${f.label}</label>`;
        }
        const control = f.type === "select"
            ? `<select name="${f.name}">${f.options.map(([v, l]) => `<option value="${v}" ${v === val ? "selected" : ""}>${l}</option>`).join("")}</select>`
            : `<input type="${f.type}" name="${f.name}" value="${esc(f.type === "datetime-local" ? toLocalInput(val) : val ?? "")}"
                ${f.required ? "required" : ""} ${f.max ? `maxlength="${f.max}"` : ""} ${f.min !== undefined ? `min="${f.min}"` : ""}
                ${f.type === "number" ? 'step="1"' : ""} ${row && f.lockOnEdit ? "readonly" : ""}
                ${f.upper ? 'style="text-transform:uppercase"' : ""}>`;
        return `<label class="field ${f.full ? "full" : ""}">${f.label}${control}${f.hint ? `<span class="hint">${f.hint}</span>` : ""}</label>`;
    };

    openModal((row ? "Modifier : " : "Ajouter : ") + cfg.singular, `
        <form id="crud-form">
            <div class="form-grid">${cfg.fields.map(fieldHtml).join("")}</div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-close>Annuler</button>
                <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
        </form>`);

    $("crud-form").addEventListener("submit", e => {
        e.preventDefault();
        withButton(e.submitter, async () => {
            try {
                let data = formData($("crud-form"));
                cfg.fields.forEach(f => { if (f.type === "number" && data[f.name] === null && f.default !== undefined) data[f.name] = f.default; });
                if (cfg.transform) data = cfg.transform(data);
                if (row && cfg.fields.find(f => f.lockOnEdit)) delete data[cfg.key];

                const { error } = row
                    ? await db.from(cfg.table).update(data).eq(cfg.key, row[cfg.key])
                    : await db.from(cfg.table).insert(data);
                if (error) throw error;

                closeModal();
                toast("Enregistré", "success");
                await refresh(true);
            } catch (err) {
                fail(err, "Enregistrement");
            }
        });
    });
}

async function deleteCrud(cfg, key) {
    const row = S[cfg.state].find(r => sameId(r[cfg.key], key));
    if (!row) return;
    const blocked = cfg.beforeDelete && cfg.beforeDelete(row);
    if (blocked) return toast(blocked, "error");
    if (!confirm(`Supprimer cette ${cfg.singular} ?`)) return;

    const { error } = await db.from(cfg.table).delete().eq(cfg.key, row[cfg.key]);
    if (error) return fail(error, "Suppression");
    toast("Supprimé", "success");
    await refresh(true);
}


/* =====================================================
   UTILISATEURS (fonction serveur "admin-users")
===================================================== */

async function callUsers(body) {
    const { data, error } = await db.functions.invoke("admin-users", { body });
    if (error) {
        let message = error.message;
        try {
            const res = await error.context.json();
            if (res && res.error) message = res.error;
        } catch (e) {
            if (/Failed to send|fetch/i.test(message)) {
                message = "Fonction « admin-users » introuvable : déployez-la (voir le guide d'installation).";
            }
        }
        throw new Error(message);
    }
    return data;
}

async function renderUsers() {
    const page = $("page-users");
    page.innerHTML = `
        <div class="page-head">
            <p class="muted">Gérez les membres de votre équipe et leurs droits d'accès.</p>
            <button type="button" class="btn btn-primary" id="user-add">${icon("plus")} Nouvel utilisateur</button>
        </div>
        <div class="card"><div class="table-wrap" id="users-table"><div class="loading">Chargement...</div></div></div>
        <div class="card card-pad" style="margin-top:20px">
            <h3 style="margin-bottom:10px">Rôles</h3>
            <p><span class="badge b-admin">Administrateur</span> Accès complet : utilisateurs, réglages, journal, suppression des commandes.</p>
            <p><span class="badge b-gestionnaire">Gestionnaire</span> Produits, catégories, codes promo, livraison et commandes.</p>
            <p style="margin:0"><span class="badge b-vendeur">Vendeur</span> Commandes et clients uniquement.</p>
        </div>`;
    $("user-add").addEventListener("click", () => openUserForm());

    try {
        const { users } = await callUsers({ action: "list" });
        S.users = users;
        $("users-table").innerHTML = `
            <table>
                <thead><tr><th>Utilisateur</th><th>Rôle</th><th>Statut</th><th>Dernière connexion</th><th></th></tr></thead>
                <tbody>${users.map(u => `
                    <tr>
                        <td><div class="cell-product" style="min-width:200px"><span class="avatar">${esc((u.full_name || u.email)[0].toUpperCase())}</span>
                            <div><strong>${esc(u.full_name || "—")}${u.is_me ? ' <span class="muted small">(vous)</span>' : ""}</strong><span class="muted small">${esc(u.email)}</span></div></div></td>
                        <td><span class="badge b-${u.role}">${ROLE_LABELS[u.role]}</span></td>
                        <td>${u.active ? '<span class="badge b-ok">Actif</span>' : '<span class="badge b-off">Désactivé</span>'}</td>
                        <td>${u.last_sign_in_at ? timeAgo(u.last_sign_in_at) : "Jamais"}</td>
                        <td class="cell-actions">
                            <button type="button" class="action-btn" data-user-edit="${u.user_id}" title="Modifier">${icon("edit")}</button>
                            <button type="button" class="action-btn" data-user-password="${u.user_id}" title="Nouveau mot de passe">${icon("key")}</button>
                            ${u.is_me ? "" : `<button type="button" class="action-btn danger" data-user-delete="${u.user_id}" title="Supprimer">${icon("trash")}</button>`}
                        </td>
                    </tr>`).join("")}
                </tbody>
            </table>`;
    } catch (err) {
        $("users-table").innerHTML = `<div class="empty">${icon("alert")}<h3>Gestion des utilisateurs indisponible</h3><p>${esc(err.message)}</p></div>`;
    }
}

function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const bytes = crypto.getRandomValues(new Uint32Array(12));
    return [...bytes].map(b => chars[b % chars.length]).join("");
}

function passwordField(id, label = "Mot de passe") {
    return `
        <label class="field full">${label}
            <span class="pw"><input type="text" id="${id}" minlength="8" maxlength="72" required autocomplete="new-password">
            <button type="button" class="pw-toggle" data-generate="${id}">Générer</button></span>
            <span class="hint">8 caractères minimum. Communiquez-le à la personne de façon privée.</span>
        </label>`;
}

function bindGenerate() {
    document.querySelectorAll("[data-generate]").forEach(b => b.addEventListener("click", () => {
        $(b.dataset.generate).value = generatePassword();
    }));
}

function openUserForm(userId = null) {
    const u = userId ? S.users.find(x => x.user_id === userId) : null;
    openModal(u ? "Modifier l'utilisateur" : "Nouvel utilisateur", `
        <form id="user-form">
            <div class="form-grid">
                <label class="field full">Nom complet<input type="text" id="u-name" value="${esc(u?.full_name || "")}" maxlength="100"></label>
                ${u ? `<label class="field full">E-mail<input type="email" value="${esc(u.email)}" readonly></label>`
                    : `<label class="field full">E-mail *<input type="email" id="u-email" required></label>`}
                <label class="field ${u ? "" : "full"}">Rôle
                    <select id="u-role" ${u?.is_me ? "disabled" : ""}>${Object.entries(ROLE_LABELS).map(([k, l]) => `<option value="${k}" ${k === (u?.role || "vendeur") ? "selected" : ""}>${l}</option>`).join("")}</select>
                </label>
                ${u ? `<div class="field" style="padding-top:28px"><label class="check"><input type="checkbox" id="u-active" ${u.active ? "checked" : ""} ${u.is_me ? "disabled" : ""}> Compte actif</label></div>`
                    : passwordField("u-password")}
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-close>Annuler</button>
                <button type="submit" class="btn btn-primary">${u ? "Enregistrer" : "Créer le compte"}</button>
            </div>
        </form>`);
    bindGenerate();
    if (!u) $("u-password").value = generatePassword();

    $("user-form").addEventListener("submit", e => {
        e.preventDefault();
        withButton(e.submitter, async () => {
            try {
                if (u) {
                    const body = { action: "update", user_id: u.user_id, full_name: $("u-name").value };
                    if (!u.is_me) { body.role = $("u-role").value; body.active = $("u-active").checked; }
                    await callUsers(body);
                    toast("Utilisateur mis à jour", "success");
                } else {
                    const email = $("u-email").value.trim();
                    const password = $("u-password").value;
                    await callUsers({ action: "create", email, password, full_name: $("u-name").value, role: $("u-role").value });
                    toast("Compte créé", "success");
                    showCredentials(email, password);
                    return renderUsers();
                }
                closeModal();
                renderUsers();
            } catch (err) {
                toast(err.message, "error");
            }
        });
    });
}

function showCredentials(email, password) {
    const loginUrl = location.origin + location.pathname;
    const text = `Bonjour, voici vos accès à l'administration ${S.settings.store_name || "Oriva"} :\n${loginUrl}\nE-mail : ${email}\nMot de passe : ${password}\nPensez à le changer dans « Mon compte ».`;
    openModal("Identifiants à transmettre", `
        <p class="muted">Copiez ces informations maintenant : le mot de passe ne sera plus affiché.</p>
        <div class="info-box"><p>Adresse : <strong>${esc(loginUrl)}</strong></p><p>E-mail : <strong>${esc(email)}</strong></p><p>Mot de passe : <strong style="font-family:monospace">${esc(password)}</strong></p></div>
        <div class="form-actions">
            <button type="button" class="btn btn-ghost" id="copy-creds">${icon("copy")} Copier</button>
            <a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text)}">Envoyer sur WhatsApp</a>
            <button type="button" class="btn btn-primary" data-close>Terminé</button>
        </div>`);
    $("copy-creds").addEventListener("click", () => navigator.clipboard?.writeText(text).then(() => toast("Copié", "success")));
}

function openPasswordForm(userId) {
    const u = S.users.find(x => x.user_id === userId);
    if (!u) return;
    openModal("Nouveau mot de passe", `
        <form id="pw-form">
            <p class="muted">Définir un nouveau mot de passe pour <strong>${esc(u.full_name || u.email)}</strong>.</p>
            <div class="form-grid">${passwordField("pw-new", "Nouveau mot de passe")}</div>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-close>Annuler</button>
                <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
        </form>`);
    bindGenerate();
    $("pw-new").value = generatePassword();

    $("pw-form").addEventListener("submit", e => {
        e.preventDefault();
        withButton(e.submitter, async () => {
            try {
                const password = $("pw-new").value;
                await callUsers({ action: "set_password", user_id: userId, password });
                toast("Mot de passe modifié", "success");
                showCredentials(u.email, password);
            } catch (err) {
                toast(err.message, "error");
            }
        });
    });
}

async function deleteUser(userId) {
    const u = S.users.find(x => x.user_id === userId);
    if (!u || !confirm(`Supprimer définitivement le compte de ${u.full_name || u.email} ?\n\nAstuce : vous pouvez aussi le désactiver.`)) return;
    try {
        await callUsers({ action: "delete", user_id: userId });
        toast("Utilisateur supprimé", "success");
        renderUsers();
    } catch (err) {
        toast(err.message, "error");
    }
}


/* =====================================================
   JOURNAL D'ACTIVITÉ
===================================================== */

const ENTITY_LABELS = { products: "Produits", categories: "Catégories", delivery_zones: "Livraison", coupons: "Codes promo", settings: "Réglages", staff: "Équipe", orders: "Commandes", utilisateurs: "Utilisateurs" };
const ACTION_LABELS = { INSERT: "Création", UPDATE: "Modification", DELETE: "Suppression" };

async function renderLogs() {
    const page = $("page-logs");
    const entity = page.dataset.entity || "";
    page.innerHTML = `
        <div class="toolbar">
            <select id="log-entity"><option value="">Toutes les activités</option>
                ${Object.entries(ENTITY_LABELS).map(([k, l]) => `<option value="${k}" ${k === entity ? "selected" : ""}>${l}</option>`).join("")}
            </select>
            <span class="muted small">300 dernières actions</span>
        </div>
        <div class="card"><div class="table-wrap" id="logs-table"><div class="loading">Chargement...</div></div></div>`;
    $("log-entity").addEventListener("change", e => { page.dataset.entity = e.target.value; renderLogs(); });

    let query = db.from("audit_log").select("*").order("created_at", { ascending: false }).limit(300);
    if (entity) query = query.eq("entity", entity);
    const { data, error } = await query;
    if (error) return ($("logs-table").innerHTML = emptyState("alert", "Erreur", errMsg(error)));

    const describe = d => !d ? "" : Object.entries(d).map(([k, v]) =>
        v && typeof v === "object" && "avant" in v ? `${k} : ${JSON.stringify(v.avant)} → ${JSON.stringify(v.apres)}` : `${k} : ${JSON.stringify(v)}`).join("\n");

    $("logs-table").innerHTML = data.length ? `
        <table>
            <thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Élément</th><th>Détails</th></tr></thead>
            <tbody>${data.map(l => `
                <tr>
                    <td class="nowrap">${fmtDate(l.created_at)}</td>
                    <td>${esc(l.user_email || "—")}</td>
                    <td><span class="badge ${l.action === "DELETE" || l.action === "SUPPRESSION" ? "b-Annulée" : l.action === "INSERT" || l.action === "CRÉATION" ? "b-ok" : "b-Nouvelle"}">${esc(ACTION_LABELS[l.action] || l.action)}</span></td>
                    <td><strong>${esc(ENTITY_LABELS[l.entity] || l.entity)}</strong><div class="muted small">${esc(l.label)}</div></td>
                    <td><div class="json">${esc(describe(l.details))}</div></td>
                </tr>`).join("")}
            </tbody>
        </table>` : emptyState("logs", "Aucune activité");
}


/* =====================================================
   RÉGLAGES
===================================================== */

function renderSettings() {
    const s = S.settings;
    const text = (name, label, hint = "", type = "text") =>
        `<label class="field">${label}<input type="${type}" name="${name}" value="${esc(s[name] ?? "")}">${hint ? `<span class="hint">${hint}</span>` : ""}</label>`;

    $("page-settings").innerHTML = `
        <form id="settings-form">
            <div class="grid-2-even">
                <div class="card card-pad">
                    <h3 style="margin-bottom:16px">Boutique</h3>
                    ${text("store_name", "Nom de la boutique")}
                    ${text("tagline", "Slogan")}
                    ${text("announcement", "Bandeau d'annonce", "Affiché tout en haut de la boutique. Laissez vide pour le masquer.")}
                    <label class="check"><input type="checkbox" name="orders_open" ${s.orders_open ? "checked" : ""}> Commandes ouvertes</label>
                    <span class="hint" style="margin-top:-8px">Décochez pour suspendre temporairement les commandes (vacances, inventaire...).</span>
                </div>
                <div class="card card-pad">
                    <h3 style="margin-bottom:16px">Contact</h3>
                    ${text("whatsapp_number", "Numéro WhatsApp des commandes", "Format international sans + ni espaces. Ex : 221771234567")}
                    ${text("phone", "Téléphone affiché")}
                    ${text("email", "E-mail", "", "email")}
                    ${text("address", "Adresse")}
                    ${text("opening_hours", "Horaires")}
                </div>
                <div class="card card-pad">
                    <h3 style="margin-bottom:16px">Ventes</h3>
                    <label class="field">Moyens de paiement<textarea name="payment_methods" rows="3">${esc((s.payment_methods || []).join("\n"))}</textarea><span class="hint">Un par ligne. Le premier est sélectionné par défaut.</span></label>
                    <label class="field">Livraison offerte dès (FCFA)<input type="number" name="free_delivery_threshold" min="0" step="1" value="${s.free_delivery_threshold ?? 0}"><span class="hint">0 = jamais offerte.</span></label>
                    <label class="field">Seuil d'alerte stock bas<input type="number" name="low_stock_threshold" min="0" step="1" value="${s.low_stock_threshold ?? 5}"></label>
                </div>
                <div class="card card-pad">
                    <h3 style="margin-bottom:16px">Réseaux sociaux</h3>
                    ${text("facebook_url", "Facebook", "Lien complet : https://...", "url")}
                    ${text("instagram_url", "Instagram", "", "url")}
                    ${text("tiktok_url", "TikTok", "", "url")}
                </div>
            </div>
            <div class="form-actions" style="border:0">
                <button type="submit" class="btn btn-primary">Enregistrer les réglages</button>
            </div>
        </form>`;

    $("settings-form").addEventListener("submit", e => {
        e.preventDefault();
        withButton(e.submitter, async () => {
            const d = formData(e.target);
            d.payment_methods = (d.payment_methods || "").split("\n").map(x => x.trim()).filter(Boolean);
            d.whatsapp_number = digits(d.whatsapp_number);
            if (!d.payment_methods.length) return toast("Indiquez au moins un moyen de paiement.", "error");
            if (d.whatsapp_number.length < 8) return toast("Numéro WhatsApp invalide.", "error");
            d.free_delivery_threshold = d.free_delivery_threshold ?? 0;
            d.low_stock_threshold = d.low_stock_threshold ?? 5;

            const { error } = await db.from("settings").update(d).eq("id", 1);
            if (error) return fail(error, "Enregistrement");
            toast("Réglages enregistrés", "success");
            await refresh(true);
        });
    });
}


/* =====================================================
   MON COMPTE
===================================================== */

function renderAccount() {
    $("page-account").innerHTML = `
        <div class="grid-2-even">
            <div class="card card-pad">
                <h3 style="margin-bottom:16px">Mon profil</h3>
                <div class="cell-product" style="margin-bottom:16px"><span class="avatar" style="width:52px;height:52px;font-size:1.3em">${esc((S.me.full_name || S.me.email)[0].toUpperCase())}</span>
                    <div><strong>${esc(S.me.full_name || "—")}</strong><span class="muted small">${esc(S.me.email)}</span></div></div>
                <div class="row"><span class="muted">Rôle</span><span class="badge b-${S.me.role}">${ROLE_LABELS[S.me.role]}</span></div>
                <div class="row"><span class="muted">Membre depuis</span><span>${fmtDate(S.me.created_at, false)}</span></div>
                <button type="button" class="btn btn-ghost" style="margin-top:16px" id="logout-2">Se déconnecter</button>
            </div>
            <div class="card card-pad">
                <h3 style="margin-bottom:16px">Changer mon mot de passe</h3>
                <form id="account-pw">
                    <label class="field">Mot de passe actuel<input type="password" id="a-current" autocomplete="current-password" required></label>
                    <label class="field">Nouveau mot de passe<input type="password" id="a-new" minlength="8" autocomplete="new-password" required><span class="hint">8 caractères minimum.</span></label>
                    <label class="field">Confirmer<input type="password" id="a-new2" minlength="8" autocomplete="new-password" required></label>
                    <div class="form-actions"><button type="submit" class="btn btn-primary">Modifier</button></div>
                </form>
            </div>
        </div>`;

    $("logout-2").addEventListener("click", () => db.auth.signOut());
    $("account-pw").addEventListener("submit", e => {
        e.preventDefault();
        withButton(e.submitter, async () => {
            const pw = $("a-new").value;
            if (pw.length < 8) return toast("8 caractères minimum.", "error");
            if (pw !== $("a-new2").value) return toast("Les mots de passe ne correspondent pas.", "error");

            const check = await db.auth.signInWithPassword({ email: S.me.email, password: $("a-current").value });
            if (check.error) return toast("Mot de passe actuel incorrect.", "error");

            const { error } = await db.auth.updateUser({ password: pw });
            if (error) return fail(error);
            e.target.reset();
            toast("Mot de passe modifié", "success");
        });
    });
}


/* =====================================================
   ÉVÉNEMENTS & DÉMARRAGE
===================================================== */

function bindApp() {
    document.addEventListener("click", e => {
        const t = e.target;
        const pick = sel => t.closest(sel);
        let el;

        if ((el = pick("[data-page]"))) return go(el.dataset.page);
        if ((el = pick("[data-close]"))) return el.closest("#drawer") ? closeDrawer() : closeModal();
        if (t.id === "modal") return closeModal();
        if (t.id === "overlay") return closeDrawer();
        if ((el = pick("[data-order]"))) return openOrder(el.dataset.order);
        if ((el = pick("[data-edit-product]"))) return openProductForm(el.dataset.editProduct);
        if ((el = pick("[data-duplicate-product]"))) return openProductForm(el.dataset.duplicateProduct, true);
        if ((el = pick("[data-delete-product]"))) return deleteProduct(el.dataset.deleteProduct);
        if ((el = pick("[data-crud-add]"))) return openCrudForm(CRUD[el.dataset.crudAdd]);
        if ((el = pick("[data-crud-edit]"))) return openCrudForm(CRUD[el.dataset.crudEdit], el.dataset.key);
        if ((el = pick("[data-crud-delete]"))) return deleteCrud(CRUD[el.dataset.crudDelete], el.dataset.key);
        if ((el = pick("[data-user-edit]"))) return openUserForm(el.dataset.userEdit);
        if ((el = pick("[data-user-password]"))) return openPasswordForm(el.dataset.userPassword);
        if ((el = pick("[data-user-delete]"))) return deleteUser(el.dataset.userDelete);
        if ((el = pick("[data-customer-orders]"))) {
            S.orderFilter = { status: "all", search: el.dataset.customerOrders, from: "", to: "" };
            const input = $("order-search");
            if (input) { input.value = S.orderFilter.search; $("order-from").value = ""; $("order-to").value = ""; }
            return go("orders");
        }
    });

    document.addEventListener("change", e => {
        const el = e.target.closest("[data-toggle-product]");
        if (el) toggleProduct(el.dataset.toggleProduct, el.checked);
    });

    document.addEventListener("keydown", e => {
        if (e.key !== "Escape") return;
        if ($("modal").classList.contains("open")) closeModal();
        else closeDrawer();
    });

    $("menu-toggle").addEventListener("click", () => {
        $("sidebar").classList.add("open");
        $("side-overlay").classList.add("show");
    });
    $("side-overlay").addEventListener("click", () => {
        $("sidebar").classList.remove("open");
        $("side-overlay").classList.remove("show");
    });
    $("refresh-btn").addEventListener("click", () => refresh());

    setInterval(() => {
        if (S.me && !document.hidden && !$("modal").classList.contains("open") && !$("drawer").classList.contains("open")) refresh(true);
    }, 30000);
}

document.addEventListener("DOMContentLoaded", () => {
    bindAuth();
    bindApp();

    // Lien « mot de passe oublié » : la session de récupération arrive par l'URL
    if (/type=recovery/.test(location.hash)) return showAuthForm("recovery-form");
    startSession();
});
