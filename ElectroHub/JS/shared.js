const API_BASE_URL = 'http://localhost:5000/api';

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('electrohub_token');
  
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  // 🔥 ONLY apply application/json if the body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, { ...options, headers });
}
// async function fetchWithAuth(url, options = {}) {
//   // Ensure headers object exists
//   options.headers = options.headers || {};

//   // 1. Get your token from wherever you store it (localStorage/cookies)
//   const token = localStorage.getItem('token'); 
//   if (token) {
//     options.headers['Authorization'] = `Bearer ${token}`;
//   }

//   // 2. 🔥 THE FIX: Only set Content-Type to JSON if the body is NOT FormData
//   if (!(options.body instanceof FormData)) {
//     options.headers['Content-Type'] = 'application/json';
//   } else {
//     // Explicitly delete it if it was accidentally set elsewhere
//     delete options.headers['Content-Type'];
//   }

//   return fetch(url, options);
// }

// Use this for multipart/form-data (file uploads) — do NOT set Content-Type manually
async function uploadWithAuth(url, formData) {
  const token = localStorage.getItem('electrohub_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { method: 'POST', headers, body: formData });
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('electrohub_user'));
  } catch {
    return null;
  }
}

function handleAuthNav() {
  const user = getUser();
  const authNavLinks = document.querySelectorAll('.auth-nav-link a');
  authNavLinks.forEach(link => {
    if (user) {
      link.textContent = user.isAdmin ? 'Dashboard' : 'Orders';
      link.href = user.isAdmin ? 'dashboard.html' : 'orders.html';
      // Add a logout button next to it
      const li = link.parentElement;
      if (!li.querySelector('.logout-btn')) {
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.onclick = (e) => {
          e.preventDefault();
          localStorage.removeItem('electrohub_token');
          localStorage.removeItem('electrohub_user');
          localStorage.removeItem('electrohub_cart');
          window.location.href = 'home.html';
        };
        li.appendChild(logoutBtn);
      }
    } else {
      link.textContent = 'Login';
      link.href = 'login.html';
      const logoutBtn = link.parentElement.querySelector('.logout-btn');
      if (logoutBtn) logoutBtn.remove();
    }
  });
}

// ===== CART HELPERS =====
function getCart() {
  return JSON.parse(localStorage.getItem("electrohub_cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("electrohub_cart", JSON.stringify(cart));
  updateCartCount();
}

function addProductToCart(product, quantity = 1) {
  if (!product) return;

  const cart = getCart();
  const productId = product._id || product.id;
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
    existing.totalPrice = parseFloat(
      (existing.pricePerUnit * existing.quantity).toFixed(2),
    );
  } else {
    cart.push({
      productId: productId,
      title: product.title,
      img: product.img,
      category: product.category,
      pricePerUnit: product.price,
      quantity: quantity,
      totalPrice: parseFloat((product.price * quantity).toFixed(2)),
    });
  }

  saveCart(cart);
  showAddedToast(product.title);
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  const badge = document.querySelector(".cart-count");
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? "flex" : "none";
  }
}

function showAddedToast(title) {
  const existing = document.getElementById("cart-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "cart-toast";
  toast.style.cssText = `
    position: fixed; bottom: 32px; right: 32px; z-index: 9999;
    background: #16161f; border: 1px solid #2a2a3a; border-left: 3px solid #0071e3;
    padding: 14px 20px; border-radius: 10px;
    font-family: 'Outfit', sans-serif; font-size: 14px; color: #f0f0f8;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    animation: slideIn 0.3s ease;
  `;
  toast.innerHTML = `<strong style="color:#0071e3">Added!</strong> ${title}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== SEARCH =====
function initSearch() {
  const toggleBtns = document.querySelectorAll(".search-toggle-btn");
  const overlay = document.getElementById("search-overlay");
  const input = document.getElementById("search-input");
  const closeBtn = document.getElementById("search-close");
  const resultsEl = document.getElementById("search-results");

  if (!overlay) return;

  function openSearch() {
    overlay.classList.add("open");
    input?.focus();
    toggleBtns.forEach((b) => b.setAttribute("aria-expanded", "true"));
  }

  function closeSearch() {
    overlay.classList.remove("open");
    toggleBtns.forEach((b) => b.setAttribute("aria-expanded", "false"));
  }

  toggleBtns.forEach((btn) => btn.addEventListener("click", openSearch));
  closeBtn?.addEventListener("click", closeSearch);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSearch();
  });

  input?.addEventListener("input", async () => {
    const q = input.value.trim().toLowerCase();
    resultsEl.innerHTML = "";

    if (!q) return;

    try {
      const res = await fetch(`${API_BASE_URL}/products?q=${encodeURIComponent(q)}`);
      const found = await res.json();

      if (!found || found.length === 0) {
        resultsEl.innerHTML = `<div class="no-results" role="status">No products found for "<strong>${q}</strong>"</div>`;
        return;
      }

      found.forEach((product) => {
        const id = product._id || product.id;
        const el = document.createElement("div");
        el.className = "search-result-item";
        el.setAttribute("role", "option");
        el.setAttribute("tabindex", "0");
        el.setAttribute(
          "aria-label",
          `${product.title}, ${product.category}, $${product.price}`,
        );
        el.innerHTML = `
          <img src="${product.img}" alt="" aria-hidden="true" onerror="this.src='https://via.placeholder.com/44x60/16161f/7a7a9a?text=?'">
          <div class="search-result-info">
            <h4>${product.title}</h4>
            <p>${product.category} · $${product.price}</p>
          </div>
          <a href="product-detail.html?id=${id}" class="search-result-link" aria-label="View ${product.title} details">Details</a>
        `;
        el.addEventListener("click", () => {
          window.location.href = `product-detail.html?id=${id}`;
        });
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.location.href = `product-detail.html?id=${id}`;
          }
        });
        resultsEl.appendChild(el);
      });
    } catch (e) {
      console.error(e);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSearch();
  });
}

// ===== HAMBURGER =====
function initHamburger() {
  const btn = document.querySelector(".hamburger");
  const links = document.querySelector(".nav-links");
  if (!btn || !links) return;

  btn.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

// ===== ACTIVE LINK =====
function setActiveNav() {
  const page = location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links li a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  handleAuthNav();
  updateCartCount();
  initSearch();
  initHamburger();
  setActiveNav();
});
