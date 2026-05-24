function renderCart() {
  const cart = getCart();
  const listEl = document.getElementById("cart-items-list");
  const emptyEl = document.getElementById("empty-cart");
  const actionsEl = document.getElementById("cart-actions");
  const countEl = document.getElementById("cart-item-count");
  const summaryLines = document.getElementById("summary-lines");
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryTotal = document.getElementById("summary-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  listEl.innerHTML = "";
  summaryLines.innerHTML = "";

  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  countEl.textContent = `${totalQty} item${totalQty !== 1 ? "s" : ""}`;

  if (cart.length === 0) {
    emptyEl.style.display = "block";
    actionsEl.style.display = "none";
    checkoutBtn.disabled = true;
    summarySubtotal.textContent = "$0.00";
    summaryTotal.textContent = "$0.00";
    return;
  }

  emptyEl.style.display = "none";
  actionsEl.style.display = "flex";
  checkoutBtn.disabled = false;

  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.totalPrice;

    // CART ITEM
    const el = document.createElement("div");
    el.className = "cart-item";
    el.setAttribute("role", "listitem");
    el.innerHTML = `
      <img class="cart-item-img"
           src="${item.img}"
           alt="${item.title}"
           loading="lazy"
           onerror="this.src='https://via.placeholder.com/72x100/16161f/7a7a9a?text=?'">
      <div class="cart-item-info">
        <h3>${item.title}</h3>
        <p class="cart-item-category">${item.category}</p>
        <div class="cart-item-qty-row">
          <span class="qty-label">Quantity:</span>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeItemQty(${index}, -1)" aria-label="Decrease" ${item.quantity <= 1 ? "disabled" : ""}>−</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="changeItemQty(${index}, 1)" aria-label="Increase" ${item.quantity >= 10 ? "disabled" : ""}>+</button>
          </div>
        </div>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-price">$${item.totalPrice.toFixed(2)}</span>
        <button class="remove-btn" onclick="removeCartItem(${index})" aria-label="Remove ${item.title}">Remove</button>
      </div>
    `;
    listEl.appendChild(el);

    // SUMMARY LINE
    const line = document.createElement("div");
    line.className = "summary-line";
    line.innerHTML = `
      <span class="product-name" title="${item.title}">${item.title} ×${item.quantity}</span>
      <span class="product-price">$${item.totalPrice.toFixed(2)}</span>
    `;
    summaryLines.appendChild(line);
  });

  const finalTotal = subtotal;

  summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
  summaryTotal.textContent = `$${finalTotal.toFixed(2)}`;
}

function changeItemQty(index, delta) {
  const cart = getCart();
  const item = cart[index];
  if (!item) return;

  const newQty = Math.max(1, Math.min(10, item.quantity + delta));
  const diff = newQty - item.quantity;

  if (diff === 0) return;

  item.quantity = newQty;
  item.totalPrice = parseFloat((item.pricePerUnit * newQty).toFixed(2));

  saveCart(cart);
  renderCart();
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function clearAllCart() {
  if (!confirm("Remove all items from your cart?")) return;
  saveCart([]);
  renderCart();
}

function goCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  window.location.href = "checkout.html";
}

document.addEventListener("DOMContentLoaded", renderCart);
