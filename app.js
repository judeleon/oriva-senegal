/* =====================================================
   ORIVA SENEGAL - BOUTIQUE
   Dépend de : config.js (db)
===================================================== */

const CART_KEY = "orivaCart";
const LAST_ORDER_KEY = "orivaLastOrder";
const STATUS_STEPS = ["Nouvelle", "Confirmée", "En préparation", "En livraison", "Livrée"];

const state = {
    settings: {},
    categories: [],
    products: [],
    zones: [],
    cart: [],
    category: "Tous",
    search: "",
    sort: "recent",
    coupon: null,
    sending: false
};


/* ---------- Utilitaires ---------- */

const $ = id => document.getElementById(id);
const sameId = (a, b) => String(a) === String(b);
const money = n => (Number(n) || 0).toLocaleString("fr-FR").replace(/\u202f/g, " ") + " FCFA";
const digits = v => String(v || "").replace(/\D/g, "");

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]
    ));
}

function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; }
}

function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* stockage plein ou désactivé */ }
}

function toast(message, type = "") {
    const el = $("toast");
    el.textContent = message;
    el.className = "toast show " + type;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2800);
}

function errorMessage(err) {
    const msg = (err && (err.message || err.error_description)) || "";
    if (/fetch|network|Failed/i.test(msg)) return "Connexion impossible. Vérifiez votre connexion internet.";
    return msg || "Une erreur est survenue. Réessayez.";
}

function whatsappUrl(text = "") {
    const number = digits(state.settings.whatsapp_number);
    return "https://wa.me/" + number + (text ? "?text=" + encodeURIComponent(text) : "");
}

const productById = id => state.products.find(p => sameId(p.id, id));
const categoryIcon = name => (state.categories.find(c => c.name === name) || {}).icon || "🌿";


/* ---------- Ouverture / fermeture des fenêtres ---------- */

function openPanel(id) {
    closeAll(false);
    $(id).classList.add("open");
    $("overlay").classList.add("show");
    document.body.classList.add("no-scroll");
}

function closeAll(clearHash = true) {
    document.querySelectorAll(".modal.open, .drawer.open").forEach(el => el.classList.remove("open"));
    $("overlay").classList.remove("show");
    document.body.classList.remove("no-scroll");
    if (clearHash && location.hash.startsWith("#produit-")) history.replaceState(null, "", location.pathname);
}

function toggleMenu() {
    $("nav").classList.toggle("open");
}


/* ---------- Chargement ---------- */

async function loadData() {
    const [settings, categories, products, zones] = await Promise.all([
        db.from("settings").select("*").eq("id", 1).maybeSingle(),
        db.from("categories").select("*").eq("active", true).order("sort_order").order("name"),
        db.from("products").select("*").eq("active", true).order("created_at", { ascending: false }),
        db.from("delivery_zones").select("*").eq("active", true).order("sort_order").order("name")
    ]);

    const error = settings.error || categories.error || products.error || zones.error;
    if (error) throw error;

    state.settings = settings.data || {};
    state.categories = categories.data;
    state.zones = zones.data;
    state.products = products.data.map(p => ({ ...p, image: p.image_url || "" }));
}

async function refreshProducts() {
    const { data, error } = await db.from("products").select("*").eq("active", true)
        .order("created_at", { ascending: false });
    if (error) return;
    state.products = data.map(p => ({ ...p, image: p.image_url || "" }));
    syncCart();
    renderCatalog();
    renderCart();
}


/* ---------- Réglages de la boutique ---------- */

function applySettings() {
    const s = state.settings;

    document.querySelectorAll("[data-setting]").forEach(el => {
        const value = s[el.dataset.setting];
        if (value) el.textContent = value;
    });

    const bar = $("announcement");
    if (s.announcement) {
        bar.textContent = s.announcement;
        bar.hidden = false;
    }

    document.querySelectorAll("[data-whatsapp]").forEach(a => {
        a.href = whatsappUrl("Bonjour " + (s.store_name || "Oriva") + ", j'ai une question.");
        a.target = "_blank";
        a.rel = "noopener";
    });

    const contact = [];
    if (s.whatsapp_number) contact.push(["WhatsApp", "+" + digits(s.whatsapp_number), whatsappUrl()]);
    if (s.phone) contact.push(["Téléphone", s.phone, "tel:" + s.phone.replace(/\s/g, "")]);
    if (s.email) contact.push(["E-mail", s.email, "mailto:" + s.email]);
    if (s.address) contact.push(["Adresse", s.address, ""]);
    if (s.opening_hours) contact.push(["Horaires", s.opening_hours, ""]);

    $("contact-list").innerHTML = contact.map(([label, value, href]) => `
        <li><span>${esc(label)}</span>${href
            ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(value)}</a>`
            : `<strong>${esc(value)}</strong>`}</li>`).join("");

    const socials = [["Facebook", s.facebook_url], ["Instagram", s.instagram_url], ["TikTok", s.tiktok_url]]
        .filter(([, url]) => /^https?:\/\//.test(url || ""));
    $("socials").innerHTML = socials.map(([name, url]) =>
        `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(name)}</a>`).join("");

    const payments = s.payment_methods || [];
    if (payments.length) $("faq-payments").textContent = payments.join(", ") + ".";

    if (state.zones.length) {
        $("faq-zones").innerHTML = `<table class="zones-table"><thead><tr><th>Zone</th><th>Frais</th><th>Délai</th></tr></thead><tbody>${
            state.zones.map(z => `<tr><td>${esc(z.name)}</td><td>${money(z.fee)}</td><td>${esc(z.delay)}</td></tr>`).join("")
        }</tbody></table>${s.free_delivery_threshold > 0
            ? `<p>Livraison offerte dès ${money(s.free_delivery_threshold)} d'achat.</p>` : ""}`;
    }

    $("pay-options").innerHTML = payments.map((p, i) => `
        <label class="pay-option">
            <input type="radio" name="payment" value="${esc(p)}" ${i === 0 ? "checked" : ""}>
            <span>${esc(p)}</span>
        </label>`).join("");

    $("c-zone").innerHTML = `<option value="">Choisissez votre zone</option>` + state.zones.map(z =>
        `<option value="${z.id}">${esc(z.name)} — ${z.fee ? money(z.fee) : "Gratuit"} (${esc(z.delay)})</option>`).join("");
    $("zone-field").hidden = state.zones.length === 0;

    if (s.store_name) document.title = s.store_name + " – Produits de santé et de bien-être";
}


/* ---------- Catalogue ---------- */

function productCard(p) {
    const out = p.stock <= 0;
    const low = !out && p.stock <= (state.settings.low_stock_threshold || 5);
    const promo = p.compare_at_price && p.compare_at_price > p.price
        ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0;

    return `
        <article class="product-card ${out ? "is-out" : ""}">
            <button type="button" class="product-media" data-open="${p.id}" aria-label="Voir ${esc(p.name)}">
                ${p.image
                    ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`
                    : `<span class="product-emoji">${esc(p.icon || categoryIcon(p.category))}</span>`}
                <span class="tags">
                    ${promo ? `<span class="tag tag-promo">-${promo}%</span>` : ""}
                    ${p.featured ? `<span class="tag tag-star">Coup de cœur</span>` : ""}
                    ${out ? `<span class="tag tag-out">Rupture</span>` : ""}
                </span>
            </button>
            <div class="product-body">
                <span class="product-cat">${esc(p.category)}</span>
                <h3 class="product-name" data-open="${p.id}">${esc(p.name)}</h3>
                <p class="product-desc">${esc(p.description)}</p>
                ${low ? `<p class="low-stock">Plus que ${p.stock} en stock</p>` : ""}
                <div class="product-foot">
                    <div class="price">
                        <strong>${money(p.price)}</strong>
                        ${promo ? `<s>${money(p.compare_at_price)}</s>` : ""}
                    </div>
                    <button type="button" class="add-btn" data-add="${p.id}" ${out ? "disabled" : ""} aria-label="Ajouter au panier">
                        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                </div>
            </div>
        </article>`;
}

function filteredProducts() {
    const q = state.search.toLowerCase();
    const list = state.products.filter(p =>
        (state.category === "Tous" || p.category === state.category) &&
        `${p.name} ${p.description} ${p.category} ${p.sku || ""}`.toLowerCase().includes(q));

    const sorters = {
        recent: (a, b) => new Date(b.created_at) - new Date(a.created_at),
        popular: (a, b) => (b.sold_count || 0) - (a.sold_count || 0),
        "price-asc": (a, b) => a.price - b.price,
        "price-desc": (a, b) => b.price - a.price,
        name: (a, b) => a.name.localeCompare(b.name, "fr")
    };

    return list.sort((a, b) => (a.stock <= 0) - (b.stock <= 0) || sorters[state.sort](a, b));
}

function renderCatalog() {
    const list = filteredProducts();

    $("result-count").textContent = list.length
        ? `${list.length} produit${list.length > 1 ? "s" : ""}${state.category !== "Tous" ? " · " + state.category : ""}`
        : "";

    $("products-container").innerHTML = list.length ? list.map(productCard).join("") : `
        <div class="empty">
            <h3>Aucun produit trouvé</h3>
            <p>Essayez un autre mot-clé ou une autre catégorie.</p>
            <button type="button" class="btn btn-outline" onclick="resetFilters()">Voir tous les produits</button>
        </div>`;

    const featured = state.products.filter(p => p.featured && p.stock > 0).slice(0, 4);
    $("vedettes").hidden = featured.length === 0;
    $("featured-grid").innerHTML = featured.map(productCard).join("");
}

function renderHero() {
    const inStock = state.products.filter(p => p.stock > 0);
    const picks = [...inStock.filter(p => p.featured && p.image), ...inStock.filter(p => p.featured && !p.image),
                   ...inStock.filter(p => !p.featured && p.image), ...inStock.filter(p => !p.featured && !p.image)].slice(0, 3);

    $("hero-products").innerHTML = picks.length ? picks.map((p, i) => `
        <button type="button" class="hero-prod p${i}" data-open="${p.id}">
            <div class="hp-media">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">` : esc(p.icon || categoryIcon(p.category))}</div>
            <strong>${esc(p.name)}</strong><span>${money(p.price)}</span>
        </button>`).join("")
        : `<div class="hero-logo">${esc((state.settings.store_name || "ORIVA").split(" ")[0].toUpperCase())}</div>`;
}

function renderCategories() {
    const counts = {};
    state.products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    const used = state.categories.filter(c => counts[c.name]);
    const shown = used.length ? used : state.categories;

    $("category-grid").innerHTML = shown.map(c => `
        <button type="button" class="category-card" data-category="${esc(c.name)}">
            <span class="category-icon">${esc(c.icon)}</span>
            <strong>${esc(c.name)}</strong>
            <span>${counts[c.name] || 0} produit${(counts[c.name] || 0) > 1 ? "s" : ""}</span>
        </button>`).join("");

    $("category-chips").innerHTML = ["Tous", ...shown.map(c => c.name)].map(name => `
        <button type="button" class="chip ${name === state.category ? "active" : ""}" data-category="${esc(name)}">${esc(name)}</button>`).join("");
}

function setCategory(name, scroll) {
    state.category = name;
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset.category === name));
    renderCatalog();
    if (scroll) $("produits").scrollIntoView({ behavior: "smooth" });
}

function resetFilters() {
    state.search = "";
    $("search-input").value = "";
    setCategory("Tous");
}


/* ---------- Fiche produit ---------- */

function openProduct(id) {
    const p = productById(id);
    if (!p) return;

    const out = p.stock <= 0;
    const promo = p.compare_at_price && p.compare_at_price > p.price;
    const shareUrl = location.origin + location.pathname + "#produit-" + p.id;

    $("product-detail").innerHTML = `
        <div class="detail-grid">
            <div class="detail-media">
                ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">`
                          : `<span class="product-emoji big">${esc(p.icon || categoryIcon(p.category))}</span>`}
            </div>
            <div class="detail-info">
                <span class="product-cat">${esc(p.category)}</span>
                <h2>${esc(p.name)}</h2>
                <div class="price big">
                    <strong>${money(p.price)}</strong>
                    ${promo ? `<s>${money(p.compare_at_price)}</s>` : ""}
                </div>
                <p class="stock-line ${out ? "out" : ""}">${out ? "Rupture de stock" : p.stock <= (state.settings.low_stock_threshold || 5) ? `Plus que ${p.stock} en stock` : "En stock"}</p>
                ${p.description ? `<p class="detail-desc">${esc(p.description)}</p>` : ""}
                ${p.usage ? `<details class="detail-usage" open><summary>Conseils d'utilisation</summary><p>${esc(p.usage)}</p></details>` : ""}
                ${out ? "" : `
                <div class="detail-actions">
                    <div class="qty">
                        <button type="button" data-qty="-1" aria-label="Moins">−</button>
                        <input type="number" id="detail-qty" value="1" min="1" max="${p.stock}">
                        <button type="button" data-qty="1" aria-label="Plus">+</button>
                    </div>
                    <button type="button" class="btn btn-primary btn-lg grow" id="detail-add">Ajouter au panier</button>
                </div>`}
                <a class="share" target="_blank" rel="noopener"
                   href="https://wa.me/?text=${encodeURIComponent(p.name + " - " + money(p.price) + "\n" + shareUrl)}">
                    Partager sur WhatsApp
                </a>
                ${p.sku ? `<p class="muted small">Réf. ${esc(p.sku)}</p>` : ""}
            </div>
        </div>`;

    const qtyInput = $("detail-qty");
    $("product-detail").querySelectorAll("[data-qty]").forEach(b => b.addEventListener("click", () => {
        qtyInput.value = Math.min(p.stock, Math.max(1, (Number(qtyInput.value) || 1) + Number(b.dataset.qty)));
    }));
    $("detail-add")?.addEventListener("click", () => {
        addToCart(p.id, Math.min(p.stock, Math.max(1, Number(qtyInput.value) || 1)));
        closeAll();
    });

    openPanel("product-modal");
    history.replaceState(null, "", "#produit-" + p.id);
}


/* ---------- Panier ---------- */

function cartLines() {
    return state.cart.map(i => ({ ...productById(i.id), quantity: i.quantity })).filter(l => l.id !== undefined);
}

const cartSubtotal = () => cartLines().reduce((s, l) => s + l.price * l.quantity, 0);

function syncCart() {
    state.cart = state.cart
        .map(i => {
            const p = productById(i.id);
            return p && p.stock > 0 ? { id: p.id, quantity: Math.min(Math.max(1, Number(i.quantity) || 1), p.stock) } : null;
        })
        .filter(Boolean);
}

function addToCart(id, qty = 1) {
    const p = productById(id);
    if (!p || p.stock <= 0) return toast("Ce produit est en rupture de stock.", "error");

    const item = state.cart.find(i => sameId(i.id, id));
    const current = item ? item.quantity : 0;

    if (current + qty > p.stock) {
        toast(`Stock disponible : ${p.stock}`, "error");
        if (item) item.quantity = p.stock; else state.cart.push({ id: p.id, quantity: p.stock });
    } else if (item) {
        item.quantity += qty;
    } else {
        state.cart.push({ id: p.id, quantity: qty });
    }

    renderCart();
    toast(`${p.name} ajouté au panier`, "success");
    const badge = $("cart-count");
    badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
}

function changeQty(id, delta) {
    const item = state.cart.find(i => sameId(i.id, id));
    const p = productById(id);
    if (!item || !p) return;

    const next = item.quantity + delta;
    if (next <= 0) state.cart = state.cart.filter(i => !sameId(i.id, id));
    else if (next > p.stock) return toast(`Stock disponible : ${p.stock}`, "error");
    else item.quantity = next;

    renderCart();
}

function renderCart() {
    const lines = cartLines();
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = cartSubtotal();

    $("cart-count").textContent = count;
    $("cart-count").classList.toggle("hidden", count === 0);
    $("cart-subtotal").textContent = money(subtotal);
    $("cart-foot").hidden = lines.length === 0;

    $("cart-items").innerHTML = lines.length === 0 ? `
        <div class="empty">
            <svg viewBox="0 0 24 24" class="empty-icon"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>
            <h3>Votre panier est vide</h3>
            <p>Découvrez nos produits et ajoutez vos favoris.</p>
            <button type="button" class="btn btn-primary" onclick="closeAll(); location.hash='produits'">Voir les produits</button>
        </div>` : lines.map(l => `
        <div class="cart-line">
            <div class="cart-thumb">${l.image ? `<img src="${esc(l.image)}" alt="">` : esc(l.icon || "🌿")}</div>
            <div class="cart-info">
                <strong>${esc(l.name)}</strong>
                <span class="muted">${money(l.price)}</span>
                <div class="qty small">
                    <button type="button" data-cart-qty="-1" data-id="${l.id}" aria-label="Moins">−</button>
                    <span>${l.quantity}</span>
                    <button type="button" data-cart-qty="1" data-id="${l.id}" aria-label="Plus">+</button>
                </div>
            </div>
            <div class="cart-right">
                <strong>${money(l.price * l.quantity)}</strong>
                <button type="button" class="link-danger" data-cart-remove="${l.id}">Retirer</button>
            </div>
        </div>`).join("");

    const threshold = state.settings.free_delivery_threshold || 0;
    const fd = $("free-delivery");
    fd.hidden = !threshold || !lines.length;
    if (threshold) {
        const left = threshold - subtotal;
        fd.innerHTML = left > 0
            ? `Plus que <strong>${money(left)}</strong> pour la livraison offerte<div class="progress"><span style="width:${Math.min(100, subtotal / threshold * 100)}%"></span></div>`
            : `<strong>Livraison offerte !</strong><div class="progress"><span style="width:100%"></span></div>`;
    }

    writeJSON(CART_KEY, state.cart);
    if (state.coupon && $("checkout-modal").classList.contains("open")) renderCheckoutSummary();
}

function openCart() {
    renderCart();
    openPanel("cart-drawer");
}


/* ---------- Commande ---------- */

function selectedZone() {
    return state.zones.find(z => sameId(z.id, $("c-zone").value));
}

function computeTotals() {
    const subtotal = cartSubtotal();
    const discount = state.coupon ? Math.min(state.coupon.discount, subtotal) : 0;
    const zone = selectedZone();
    const threshold = state.settings.free_delivery_threshold || 0;
    let delivery = zone ? zone.fee : 0;
    if (threshold && subtotal - discount >= threshold) delivery = 0;
    return { subtotal, discount, delivery, zone, total: subtotal - discount + delivery };
}

function renderCheckoutSummary() {
    const lines = cartLines();
    const t = computeTotals();

    $("checkout-items").innerHTML = lines.map(l => `
        <div class="sum-line">
            <span>${esc(l.name)} <em>× ${l.quantity}</em></span>
            <span>${money(l.price * l.quantity)}</span>
        </div>`).join("");

    $("s-subtotal").textContent = money(t.subtotal);
    $("s-discount-row").hidden = !t.discount;
    $("s-discount").textContent = "− " + money(t.discount);
    $("s-delivery").textContent = state.zones.length && !t.zone ? "Choisissez une zone" : t.delivery ? money(t.delivery) : "Offerte";
    $("s-total").textContent = money(t.total);
}

function openCheckout() {
    syncCart();
    if (!state.cart.length) return toast("Votre panier est vide.", "error");
    if (state.settings.orders_open === false) {
        return toast("Les commandes sont momentanément fermées. Contactez-nous sur WhatsApp.", "error");
    }

    const saved = readJSON("orivaCustomer", null);
    if (saved) {
        if (!$("c-name").value) $("c-name").value = saved.name || "";
        if (!$("c-phone").value) $("c-phone").value = saved.phone || "";
        if (!$("c-address").value) $("c-address").value = saved.address || "";
        if (!$("c-zone").value && saved.zone) $("c-zone").value = saved.zone;
    }

    renderCheckoutSummary();
    openPanel("checkout-modal");
}

async function applyCoupon() {
    const code = $("c-coupon").value.trim();
    const msg = $("coupon-msg");

    if (!code) {
        state.coupon = null;
        msg.textContent = "";
        return renderCheckoutSummary();
    }

    $("coupon-btn").disabled = true;
    const { data, error } = await db.rpc("check_coupon", { p_code: code, p_subtotal: cartSubtotal() });
    $("coupon-btn").disabled = false;

    if (error) {
        state.coupon = null;
        msg.textContent = errorMessage(error);
        msg.className = "coupon-msg error";
    } else {
        state.coupon = data;
        msg.textContent = `Code ${data.code} appliqué : − ${money(data.discount)}`;
        msg.className = "coupon-msg success";
    }
    renderCheckoutSummary();
}

function buildWhatsAppMessage(order, customer) {
    const lines = [
        `*NOUVELLE COMMANDE ${(state.settings.store_name || "ORIVA").toUpperCase()}*`,
        "",
        "Commande : *" + order.id + "*",
        "Client : " + customer.name,
        "Téléphone : " + customer.phone,
        order.zone ? "Zone : " + order.zone : null,
        "Adresse : " + customer.address,
        customer.notes ? "Instructions : " + customer.notes : null,
        "",
        "*Produits :*",
        ...order.items.map(i => `• ${i.name} × ${i.quantity} = ${money(i.price * i.quantity)}`),
        "",
        "Sous-total : " + money(order.subtotal),
        order.discount ? `Réduction (${order.coupon}) : − ${money(order.discount)}` : null,
        "Livraison : " + (order.delivery_fee ? money(order.delivery_fee) : "Offerte"),
        "*TOTAL : " + money(order.total) + "*",
        "Paiement : " + order.payment
    ];
    return lines.filter(l => l !== null).join("\n");
}

async function submitOrder(event) {
    event.preventDefault();
    if (state.sending) return;
    if ($("c-website").value) return;

    const customer = {
        name: $("c-name").value.trim(),
        phone: $("c-phone").value.trim(),
        address: $("c-address").value.trim(),
        notes: $("c-notes").value.trim()
    };
    const payment = (document.querySelector('input[name="payment"]:checked') || {}).value;
    const zone = selectedZone();

    const invalid = [
        [!customer.name, "c-name", "Indiquez votre nom."],
        [digits(customer.phone).length < 8 || digits(customer.phone).length > 15, "c-phone", "Numéro de téléphone invalide."],
        [state.zones.length && !zone, "c-zone", "Choisissez votre zone de livraison."],
        [!customer.address, "c-address", "Indiquez votre adresse de livraison."]
    ].find(([bad]) => bad);

    document.querySelectorAll(".checkout-fields .invalid").forEach(el => el.classList.remove("invalid"));
    if (invalid) {
        $(invalid[1]).classList.add("invalid");
        $(invalid[1]).focus();
        return toast(invalid[2], "error");
    }

    syncCart();
    if (!state.cart.length) return toast("Votre panier est vide.", "error");

    state.sending = true;
    const button = $("checkout-submit");
    button.disabled = true;
    button.textContent = "Envoi en cours...";

    try {
        const { data, error } = await db.rpc("place_order", {
            p_name: customer.name,
            p_phone: customer.phone,
            p_address: customer.address,
            p_items: state.cart.map(i => ({ id: i.id, quantity: i.quantity })),
            p_zone_id: zone ? zone.id : null,
            p_payment: payment || null,
            p_coupon: state.coupon ? state.coupon.code : null,
            p_notes: customer.notes
        });
        if (error) throw error;

        writeJSON("orivaCustomer", { name: customer.name, phone: customer.phone, address: customer.address, zone: zone ? zone.id : "" });
        writeJSON(LAST_ORDER_KEY, { id: data.id, phone: customer.phone });

        state.cart = [];
        state.coupon = null;
        $("c-coupon").value = "";
        $("coupon-msg").textContent = "";
        $("c-notes").value = "";
        renderCart();
        showSuccess(data, customer);
    } catch (err) {
        toast(errorMessage(err), "error");
    } finally {
        state.sending = false;
        button.disabled = false;
        button.textContent = "Confirmer la commande";
        refreshProducts();
    }
}

function showSuccess(order, customer) {
    const url = whatsappUrl(buildWhatsAppMessage(order, customer));
    const mobileMoney = /wave|orange|free/i.test(order.payment);

    $("success-content").innerHTML = `
        <div class="success">
            <div class="success-icon"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg></div>
            <h2>Merci ${esc(customer.name.split(" ")[0])} !</h2>
            <p>Votre commande est enregistrée.</p>
            <div class="order-ref">
                <span>N° de commande</span>
                <strong id="order-ref">${esc(order.id)}</strong>
                <button type="button" class="btn btn-link" id="copy-ref">Copier</button>
            </div>
            <div class="sum-box">
                <div class="summary-row"><span>Total à payer</span><strong>${money(order.total)}</strong></div>
                <div class="summary-row"><span>Paiement</span><span>${esc(order.payment)}</span></div>
                ${order.zone ? `<div class="summary-row"><span>Livraison</span><span>${esc(order.zone)}</span></div>` : ""}
            </div>
            <p class="muted">${mobileMoney
                ? "Envoyez-nous votre commande sur WhatsApp : nous vous indiquerons le numéro pour le paiement."
                : "Envoyez-nous votre commande sur WhatsApp pour la confirmer rapidement."}</p>
            <a href="${esc(url)}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-lg btn-block">Envoyer ma commande sur WhatsApp</a>
            <button type="button" class="btn btn-link btn-block" onclick="openTracking('${esc(order.id)}')">Suivre ma commande</button>
        </div>`;

    $("copy-ref").addEventListener("click", () => {
        navigator.clipboard?.writeText(order.id).then(() => toast("Numéro copié", "success"));
    });

    openPanel("success-modal");
}


/* ---------- Suivi de commande ---------- */

function openTracking(id) {
    const last = readJSON(LAST_ORDER_KEY, null);
    $("t-id").value = id || $("t-id").value || (last ? last.id : "");
    if (!$("t-phone").value && last) $("t-phone").value = last.phone;
    $("tracking-result").innerHTML = "";
    openPanel("tracking-modal");
    if ($("t-id").value && $("t-phone").value) trackOrder();
}

async function trackOrder(event) {
    if (event) event.preventDefault();
    const result = $("tracking-result");
    result.innerHTML = `<p class="muted center">Recherche...</p>`;

    const { data, error } = await db.rpc("track_order", { p_id: $("t-id").value.trim(), p_phone: $("t-phone").value.trim() });
    if (error) {
        result.innerHTML = `<p class="alert">${esc(errorMessage(error))}</p>`;
        return;
    }

    const cancelled = data.status === "Annulée";
    const reached = STATUS_STEPS.indexOf(data.status);
    const dates = {};
    (data.events || []).forEach(e => { dates[e.status] = e.at; });
    const fmt = d => d ? new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "";

    result.innerHTML = `
        <div class="track">
            <div class="track-head">
                <div><span class="muted">Commande</span><strong>${esc(data.id)}</strong></div>
                <span class="status-pill s-${esc(data.status).replace(/\s/g, "-")}">${esc(data.status)}</span>
            </div>
            ${cancelled ? `<p class="alert">Cette commande a été annulée.</p>` : `
            <ol class="timeline">
                ${STATUS_STEPS.map((s, i) => `
                    <li class="${i <= reached ? "done" : ""} ${i === reached ? "current" : ""}">
                        <span class="dot"></span>
                        <div><strong>${s}</strong><small>${fmt(dates[s])}</small></div>
                    </li>`).join("")}
            </ol>`}
            <div class="sum-box">
                ${data.items.map(i => `<div class="sum-line"><span>${esc(i.name)} <em>× ${i.quantity}</em></span><span>${money(i.price * i.quantity)}</span></div>`).join("")}
                <div class="summary-row total"><span>Total</span><strong>${money(data.total)}</strong></div>
                <div class="summary-row"><span>Paiement</span><span>${esc(data.payment)}${data.paid ? " · Payé" : ""}</span></div>
            </div>
        </div>`;
}


/* ---------- Événements ---------- */

function bindEvents() {
    document.addEventListener("click", e => {
        const add = e.target.closest("[data-add]");
        if (add) return addToCart(add.dataset.add);

        const open = e.target.closest("[data-open]");
        if (open) return openProduct(open.dataset.open);

        const cat = e.target.closest("[data-category]");
        if (cat) return setCategory(cat.dataset.category, cat.classList.contains("category-card"));

        const qty = e.target.closest("[data-cart-qty]");
        if (qty) return changeQty(qty.dataset.id, Number(qty.dataset.cartQty));

        const remove = e.target.closest("[data-cart-remove]");
        if (remove) {
            state.cart = state.cart.filter(i => !sameId(i.id, remove.dataset.cartRemove));
            return renderCart();
        }

        if (e.target.closest(".nav a")) $("nav").classList.remove("open");
        if (e.target.classList.contains("modal")) closeAll();
    });

    let timer;
    $("search-input").addEventListener("input", e => {
        clearTimeout(timer);
        timer = setTimeout(() => { state.search = e.target.value.trim(); renderCatalog(); }, 150);
    });

    $("sort-select").addEventListener("change", e => { state.sort = e.target.value; renderCatalog(); });
    $("c-zone").addEventListener("change", renderCheckoutSummary);
    $("coupon-btn").addEventListener("click", applyCoupon);
    $("c-coupon").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } });
    $("checkout-form").addEventListener("submit", submitOrder);
    $("tracking-form").addEventListener("submit", trackOrder);

    document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

    window.addEventListener("scroll", () => {
        $("header").classList.toggle("scrolled", window.scrollY > 10);
    }, { passive: true });
}


/* ---------- Démarrage ---------- */

document.addEventListener("DOMContentLoaded", async () => {
    $("year").textContent = new Date().getFullYear();
    bindEvents();

    try {
        await loadData();
    } catch (err) {
        console.error(err);
        $("products-container").innerHTML = `
            <div class="empty">
                <h3>Produits indisponibles</h3>
                <p>Impossible de charger la boutique. Vérifiez votre connexion puis actualisez la page.</p>
                <button type="button" class="btn btn-primary" onclick="location.reload()">Actualiser</button>
            </div>`;
        return;
    }

    applySettings();
    state.cart = Array.isArray(readJSON(CART_KEY, [])) ? readJSON(CART_KEY, []) : [];
    syncCart();
    renderHero();
    renderCategories();
    renderCatalog();
    renderCart();

    const match = location.hash.match(/^#produit-(\d+)$/);
    if (match) openProduct(match[1]);
});
