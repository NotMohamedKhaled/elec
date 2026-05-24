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
      <img src="${product.img}" alt="${product.title} product image" loading="lazy"
           onerror="this.src='https://via.placeholder.com/200x300/16161f/9a9ab8?text=${encodeURIComponent(product.title)}'">
      <div class="product-card-badge" aria-hidden="true">${product.category}</div>
    </div>
    <div class="product-card-body">
      <h3 title="${product.title}">${product.title}</h3>
      <div class="product-card-meta" aria-label="${product.category}">
        <span>${product.category}</span>
      </div>
      <div class="product-card-footer">
        <span class="product-card-price" aria-label="Price: $${product.price.toFixed(2)}">$${product.price.toFixed(2)}</span>
        <button class="card-add-btn"
          aria-label="Add ${product.title} to cart">
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

async function renderFeatured(category = "all") {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px 0;">Loading products...</p>';

  try {
    const res = await fetch(`${API_BASE_URL}/products${category !== 'all' ? '?category=' + encodeURIComponent(category) : ''}`);
    const products = await res.json();

    grid.innerHTML = "";

    if (!products || products.length === 0) {
      grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;padding:40px 0">No products in this category yet.</p>`;
      return;
    }

    products.slice(0, 8).forEach((product, i) => {
      const card = createProductCard(product);
      card.style.animationDelay = `${i * 0.06}s`;
      card.style.animation = "fadeUp 0.4s ease forwards";
      card.style.opacity = "0";
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p style="color:#ff4d4d;grid-column:1/-1;padding:40px 0">Failed to load products.</p>`;
  }
}

function filterFeatured(category, btn) {
  document
    .querySelectorAll(".category-chip")
    .forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
  renderFeatured(category);
}

// Add fade-up animation
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", () => {
  renderFeatured("all");
});
