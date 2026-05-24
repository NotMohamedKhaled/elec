let currentQty = 1;
let currentProduct = null;

async function initDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    window.location.href = "products.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error("Product not found");
    currentProduct = await res.json();
  } catch (err) {
    window.location.href = "products.html";
    return;
  }

  // Page title
  document.title = `ElectroHub - ${currentProduct.title}`;

  // Breadcrumb
  document.getElementById("breadcrumb-title").textContent =
    currentProduct.title;

  // Backdrop
  const backdrop = document.getElementById("detail-backdrop");

  // Poster
  const poster = document.getElementById("detail-poster");
  poster.src = currentProduct.img;
  poster.alt = `${currentProduct.title} product image`;
  poster.onerror = () => {
    poster.src =
      "https://via.placeholder.com/280x350/16161f/7a7a9a?text=" +
      encodeURIComponent(currentProduct.title);
  };

  // Category badge
  document.getElementById("detail-category").textContent =
    currentProduct.category;
  document.getElementById("detail-category-chip").textContent =
    currentProduct.category;

  // Title & rating
  document.getElementById("product-title").textContent = currentProduct.title;
  document.getElementById("detail-rating").textContent = "4.5 / 5";

  // Description
  document.getElementById("detail-description").textContent =
    currentProduct.description;

  // Specs
  const specsEl = document.getElementById("detail-specs");
  if (currentProduct.specs && currentProduct.specs.length > 0) {
    currentProduct.specs.forEach((spec) => {
      const li = document.createElement("li");
      li.textContent = spec;
      specsEl.appendChild(li);
    });
  } else {
    // Hide specs section if no specs available
    specsEl.parentElement.style.display = "none";
  }

  // Price
  document.getElementById("price-per").textContent =
    currentProduct.price.toFixed(2);
  updateTotal();

  // Related products (same category, excluding current)
  try {
    const relRes = await fetch(`${API_BASE_URL}/products?category=${encodeURIComponent(currentProduct.category)}`);
    const relProducts = await relRes.json();
    const related = relProducts.filter(
      (p) => (p._id || p.id) !== id,
    ).slice(0, 4);

    const relatedGrid = document.getElementById("related-grid");

    related.forEach((product) => {
      const relatedId = product._id || product.id;
      const card = document.createElement("article");
      card.className = "product-card";
      card.setAttribute("role", "listitem");
      card.style.cursor = "pointer";
      card.onclick = () => {
        window.location.href = `product-detail.html?id=${relatedId}`;
      };
      card.innerHTML = `
        <div class="product-card-poster">
          <img src="${product.img}" crossorigin="anonymous" alt="${product.title} product image" loading="lazy"
               onerror="this.src='https://via.placeholder.com/180x220/16161f/7a7a9a?text=${encodeURIComponent(product.title)}'">
          <div class="product-card-badge">${product.category}</div>
     
        </div>
        <div class="product-card-body">
          <h3 title="${product.title}">${product.title}</h3>
          <div class="product-card-meta">
            <span>${product.category}</span>
          </div>
          <div class="product-card-price">$${product.price.toFixed(2)}</div>
        </div>
      `;
      relatedGrid.appendChild(card);
    });

    if (related.length === 0) {
      document.querySelector(".related-section").style.display = "none";
    }
  } catch(e) {
    document.querySelector(".related-section").style.display = "none";
  }
}

function changeQty(delta) {
  currentQty = Math.max(1, Math.min(10, currentQty + delta));
  document.getElementById("qty-count").textContent = currentQty;
  document.getElementById("qty-minus").disabled = currentQty <= 1;
  document.getElementById("qty-plus").disabled = currentQty >= 10;
  updateTotal();
}

function updateTotal() {
  if (!currentProduct) return;
  const total = (currentProduct.price * currentQty).toFixed(2);
  document.getElementById("price-total").textContent = `$${total}`;
}

function addToCartFromDetail() {
  if (!currentProduct) return;
  addProductToCart(currentProduct, currentQty);

  const btn = document.getElementById("add-to-cart-btn");
  const original = btn.innerHTML;
  btn.innerHTML = `✓ Added to Cart!`;
  btn.style.background = "var(--green)";
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = "";
    btn.disabled = false;
  }, 2000);
}

// Fade-up animation for cards
const style = document.createElement("style");
style.textContent = `@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", initDetail);
