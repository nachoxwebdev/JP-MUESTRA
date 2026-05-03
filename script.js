// Productos
const productsData = [
  { id: 1, name: "Kit de Frenos Delanteros", category: "Frenos", price: 18500, icon: "fa-brake-warning" },
  { id: 2, name: "Pastillas de Freno Traseras", category: "Frenos", price: 12200, icon: "fa-brake-warning" },
  { id: 3, name: "Batería Sellada 12V 7Ah", category: "Eléctricos", price: 27900, icon: "fa-car-battery" },
  { id: 4, name: "Cadena de Transmisión O-Ring", category: "Transmisión", price: 34500, icon: "fa-chain" },
  { id: 5, name: "Filtro de Aceite Original", category: "Filtros", price: 5400, icon: "fa-oil-can" },
  { id: 6, name: "Bujía Iridium", category: "Motor", price: 8900, icon: "fa-plug" },
  { id: 7, name: "Correa de Distribución", category: "Motor", price: 22900, icon: "fa-tachometer-alt" },
  { id: 8, name: "Manillar Rizoma Style", category: "Motor", price: 45700, icon: "fa-motorcycle" },
  { id: 9, name: "Bobina de encendido", category: "Eléctricos", price: 18900, icon: "fa-bolt" },
  { id: 10, name: "Filtro de Aire Deportivo", category: "Filtros", price: 11200, icon: "fa-wind" },
  { id: 11, name: "Pinza de freno trasero", category: "Frenos", price: 29300, icon: "fa-brake-warning" },
  { id: 12, name: "Juego de Platos y Cadena", category: "Transmisión", price: 59800, icon: "fa-cogs" }
];

let cart = [];
let activeCategory = "all";
let searchTerm = "";

// DOM seguro
const $ = (id) => document.getElementById(id);
const productsGrid = $("productsGrid");
const searchInput = $("searchInput");
const sortSelect = $("sortSelect");
const categoryContainerDesktop = document.querySelector('#categoryFiltersDesktop');
const categoryContainerMobile = document.querySelector('#categoryFiltersMobile');
const cartDrawer = $("cartDrawer");
const cartOverlay = $("cartOverlay");
const cartItemsList = $("cartItemsList");
const cartSubtotal = $("cartSubtotal");
const cartCount = $("cartCount");
const toast = $("toastMsg");
const scrollTopBtn = $("scrollTopBtn");
const cartIconBtn = $("cartIconBtn");
const themeToggle = $("themeToggle");
const themeIcon = $("themeIcon");

// Menú móvil
const menuToggleBtn = $("menuToggleBtn");
const mobileMenu = $("mobileMenu");
const mobileMenuOverlay = $("mobileMenuOverlay");
const closeMobileMenuBtn = $("closeMobileMenuBtn");

// Tema
function initTheme() {
  const saved = localStorage.getItem("motorAlmaTheme") || "light";
  setTheme(saved);
}
function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("motorAlmaTheme", t);
  if (themeIcon) themeIcon.className = t === "dark" ? "fas fa-moon" : "fas fa-sun";
}
if (themeToggle) themeToggle.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme");
  setTheme(cur === "dark" ? "light" : "dark");
});

// Toast
function showToast(msg, dur = 2000) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), dur);
}

// Render productos
function renderProducts() {
  if (!productsGrid) return;
  let filtered = [...productsData];
  if (activeCategory !== "all") filtered = filtered.filter(p => p.category === activeCategory);
  if (searchTerm.trim()) {
    const t = searchTerm.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(t));
  }
  if (sortSelect) {
    const sort = sortSelect.value;
    if (sort === "price-asc") filtered.sort((a,b) => a.price - b.price);
    else if (sort === "price-desc") filtered.sort((a,b) => b.price - a.price);
    else filtered.sort((a,b) => a.id - b.id);
  }
  if (!filtered.length) {
    productsGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-secondary)"><i class="fas fa-search"></i> No se encontraron repuestos</div>`;
    return;
  }
  productsGrid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img"><i class="fas ${p.icon || 'fa-motorcycle'} fa-3x"></i></div>
      <div class="product-info">
        <h3 class="product-title">${p.name}</h3>
        <span class="product-category">${p.category}</span>
        <div class="product-price">$${p.price.toLocaleString('es-AR')}</div>
        <button class="add-to-cart" data-action="add" data-id="${p.id}">🛒 Agregar</button>
      </div>
    </div>`).join('');
}

// Delegación en grilla
if (productsGrid) {
  productsGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='add']");
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    addToCart(id);
  });
}

// Carrito
function addToCart(id) {
  const product = productsData.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  existing ? existing.quantity++ : cart.push({ id, name: product.name, price: product.price, quantity: 1 });
  updateCart();
  showToast(`${product.name} agregado`);
  saveCart();
  if (cartIconBtn) {
    cartIconBtn.classList.add("cart-pop");
    setTimeout(() => cartIconBtn.classList.remove("cart-pop"), 400);
  }
}
function removeFromCart(id, all = false) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  if (all || cart[idx].quantity === 1) cart.splice(idx, 1);
  else cart[idx].quantity--;
  updateCart();
  saveCart();
  showToast("Carrito actualizado");
}
function clearCart() { cart = []; updateCart(); saveCart(); showToast("Carrito vaciado"); }
function getTotal() { return cart.reduce((s, i) => s + i.price * i.quantity, 0); }
function getCount() { return cart.reduce((s, i) => s + i.quantity, 0); }

function updateCart() {
  if (!cartSubtotal || !cartCount || !cartItemsList) return;
  const total = getTotal();
  const count = getCount();
  cartSubtotal.textContent = `$${total.toLocaleString('es-AR')}`;
  cartCount.textContent = count;
  if (!cart.length) {
    cartItemsList.innerHTML = `<div class="empty-cart-msg"><i class="fas fa-box-open"></i> No hay productos aún</div>`;
    return;
  }
  cartItemsList.innerHTML = cart.map(i => `
    <div class="cart-item" data-id="${i.id}">
      <div class="cart-item-info">
        <h4>${i.name}</h4><p>$${i.price.toLocaleString()} x ${i.quantity}</p>
      </div>
      <div class="cart-item-actions">
        <button data-action="dec" data-id="${i.id}">−</button>
        <span>${i.quantity}</span>
        <button data-action="inc" data-id="${i.id}">+</button>
        <button data-action="remove" data-id="${i.id}" class="cart-remove"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
}

if (cartItemsList) {
  cartItemsList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn || !btn.dataset.action) return;
    const id = parseInt(btn.dataset.id, 10);
    if (btn.dataset.action === "inc") {
      const item = cart.find(i => i.id === id);
      if (item) { item.quantity++; updateCart(); saveCart(); }
    } else if (btn.dataset.action === "dec") removeFromCart(id, false);
    else if (btn.dataset.action === "remove") removeFromCart(id, true);
  });
}

// LocalStorage
function saveCart() { localStorage.setItem("motorAlmaCart", JSON.stringify(cart)); }
function loadCart() {
  const saved = localStorage.getItem("motorAlmaCart");
  if (saved) { try { cart = JSON.parse(saved); updateCart(); } catch { cart = []; } }
}

// Scroll top
window.addEventListener("scroll", () => {
  if (scrollTopBtn) scrollTopBtn.classList.toggle("show", window.scrollY > 400);
});
if (scrollTopBtn) scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Drawer
function openCart() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add("open"); cartOverlay.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false"); cartOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("closeCartBtn")?.focus();
    if (cartIconBtn) cartIconBtn.setAttribute("aria-expanded", "true");
  }
}
function closeCart() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove("open"); cartOverlay.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true"); cartOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (cartIconBtn) {
      cartIconBtn.setAttribute("aria-expanded", "false");
      cartIconBtn.focus();
    }
  }
}
if (cartIconBtn) cartIconBtn.addEventListener("click", openCart);
$("closeCartBtn")?.addEventListener("click", closeCart);
if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
$("clearCartBtn")?.addEventListener("click", clearCart);

// Checkout con WhatsApp (número nuevo)
$("checkoutBtn")?.addEventListener("click", () => {
  if (!cart.length) { showToast("Carrito vacío"); return; }
  const phone = "5491166010902";   // +54 9 11 6601-0902
  let msg = "Hola MOTOR ALMA, quiero pedir:%0A";
  cart.forEach(i => msg += `- ${i.name} x${i.quantity} $${i.price.toLocaleString()}%0A`);
  msg += `%0ATotal: $${getTotal().toLocaleString()}`;
  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  showToast("Redirigiendo a WhatsApp…");
  setTimeout(closeCart, 1000);
});

// Filtros y búsqueda robustos
function updateURL() {
  const url = new URL(window.location);
  url.searchParams.set("cat", activeCategory);
  searchTerm ? url.searchParams.set("q", searchTerm) : url.searchParams.delete("q");
  history.pushState({}, "", url);
}
function applyURL() {
  const p = new URLSearchParams(location.search);
  const cat = p.get("cat");
  if (cat && ["all","Motor","Frenos","Transmisión","Eléctricos","Filtros"].includes(cat)) {
    activeCategory = cat;
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.toggle("active", c.dataset.category === cat));
  }
  const q = p.get("q");
  if (q && searchInput) { searchTerm = q; searchInput.value = q; }
}

// Manejo de clics en categorías (compartido para ambos contenedores)
function handleCategoryClick(e) {
  const chip = e.target.closest(".filter-chip");
  if (!chip) return;
  const category = chip.dataset.category;
  // Actualizar todos los chips (escritorio y móvil)
  document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
  document.querySelectorAll(`.filter-chip[data-category="${category}"]`).forEach(c => c.classList.add("active"));
  activeCategory = category;
  renderProducts();
  updateURL();
  // Cerrar menú móvil si está abierto
  closeMobileMenu();
}

if (categoryContainerDesktop) {
  categoryContainerDesktop.addEventListener("click", handleCategoryClick);
}
if (categoryContainerMobile) {
  categoryContainerMobile.addEventListener("click", handleCategoryClick);
}

// Menú hamburguesa móvil
function openMobileMenu() {
  if (mobileMenu && mobileMenuOverlay) {
    mobileMenu.classList.add("open");
    mobileMenuOverlay.classList.add("open");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
}
function closeMobileMenu() {
  if (mobileMenu && mobileMenuOverlay) {
    mobileMenu.classList.remove("open");
    mobileMenuOverlay.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}
if (menuToggleBtn) menuToggleBtn.addEventListener("click", openMobileMenu);
if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener("click", closeMobileMenu);
if (mobileMenuOverlay) mobileMenuOverlay.addEventListener("click", closeMobileMenu);

// Búsqueda
if (searchInput) {
  let debounceTimer;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchTerm = e.target.value.trim();
      renderProducts();
      updateURL();
    }, 300);
  });
}
if (sortSelect) sortSelect.addEventListener("change", () => renderProducts());
window.addEventListener("popstate", () => { applyURL(); renderProducts(); });

// Click en logo / nombre vuelve al inicio
const logoArea = document.querySelector('.logo-area');
if (logoArea) {
  logoArea.addEventListener('click', (e) => {
    e.preventDefault();
    activeCategory = 'all';
    searchTerm = '';
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.category === 'all');
    });
    renderProducts();
    history.pushState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeCart();
  });
}

// Inicialización
function init() {
  initTheme();
  applyURL();
  loadCart();
  renderProducts();
}
init();