let currentFilter = "all";
let currentSort = "default";
let allProducts = [];

function createProductCard(product) {
  const card = document.createElement("article");
  const id = product._id || product.id;
  card.className = "product-card";
  card.setAttribute("role", "listitem");
  card.setAttribute(
    "aria-label",
    `${product.title}, ${product.category}, $${product.price.toFixed(2)}`,
  );
  card.dataset.category = product.category;

  card.innerHTML = `
    <div class="product-card-poster">
      <img src="${product.img}" crossorigin="anonymous" alt="${product.title} product image" loading="lazy">
      <div class="product-card-badge" aria-hidden="true">${product.category}</div>
    </div>
    <div class="product-card-body">
      <h3 title="${product.title}">${product.title}</h3>
      <div class="product-card-meta" aria-label="${product.category}">
        <span>${product.category}</span>
      </div>
      <div class="product-card-footer">
        <span class="product-card-price" aria-label="Price: $${product.price.toFixed(2)}">$${product.price.toFixed(2)}</span>
        <button class="card-add-btn" aria-label="Add ${product.title} to cart">
          + Add to Cart
        </button>
      </div>
    </div>
  `;

  card.addEventListener("click", (e) => {
    if (e.target.closest(".card-add-btn")) return;
    window.location.href = `product-detail.html?id=${id}`;
  });

  card.querySelector(".card-add-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    addProductToCart(product);
  });

  return card;
}

function getFilteredSorted() {
  let list =
    currentFilter === "all"
      ? [...allProducts]
      : allProducts.filter((p) => p.category === currentFilter);
  if (currentSort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (currentSort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (currentSort === "title-asc")
    list.sort((a, b) => a.title.localeCompare(b.title));
  return list;
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const countEl = document.getElementById("products-count");
  if (!grid || !countEl) return;
  grid.innerHTML = "";
  const list = getFilteredSorted();
  countEl.textContent = `Showing ${list.length} product${list.length !== 1 ? "s" : ""}`;
  list.forEach((product, i) => {
    const card = createProductCard(product);
    card.style.animationDelay = `${i * 0.05}s`;
    card.style.animation = "fadeUp 0.4s ease forwards";
    card.style.opacity = "0";
    grid.appendChild(card);
  });
}

function applyFilter(category, btn) {
  currentFilter = category;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderProducts();
}

function applySort(val) {
  currentSort = val;
  renderProducts();
}

async function fetchProducts() {
  const grid = document.getElementById("products-grid");
  if (grid) grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px 0;">Loading products...</p>';
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    allProducts = await res.json();
    renderProducts();
  } catch (err) {
    if (grid) grid.innerHTML = `<p style="color:#ff4d4d;grid-column:1/-1;padding:40px 0">Failed to load products.</p>`;
  }
}

const style = document.createElement("style");
style.textContent = `@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", fetchProducts);
