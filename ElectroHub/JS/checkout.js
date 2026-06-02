function renderCheckout() {
  const cart = getCart();

  if (cart.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  document.getElementById("checkout-date").textContent =
    "Order date: " + new Date().toLocaleString("en-US", {
      weekday: "long", year: "numeric", month: "long",
      day: "numeric", hour: "2-digit", minute: "2-digit"
    });

  const orderItemsEl = document.getElementById("order-items");
  const summaryLinesEl = document.getElementById("payment-summary-lines");
  orderItemsEl.innerHTML = "";
  summaryLinesEl.innerHTML = "";

  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.totalPrice;

    const el = document.createElement("div");
    el.className = "order-item";
    el.setAttribute("role", "listitem");
    el.innerHTML = `
      <img class="order-item-img"
           src="${item.img}" alt="${item.title}"
           loading="lazy"
           onerror="this.src='https://via.placeholder.com/80x112/16161f/7a7a9a?text=?'">
      <div>
        <p class="order-item-title">${item.title}</p>
        <p class="order-item-category">${item.category} · Quantity: ${item.quantity}</p>
        <div class="order-item-row">
          <span class="order-qty-info">$${item.pricePerUnit.toFixed(2)} × ${item.quantity}</span>
          <span class="order-item-price">$${item.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    `;
    orderItemsEl.appendChild(el);

    const line = document.createElement("div");
    line.className = "payment-summary-line";
    line.innerHTML = `
      <span class="name">${item.title} ×${item.quantity}</span>
      <span>$${item.totalPrice.toFixed(2)}</span>
    `;
    summaryLinesEl.appendChild(line);
  });

  const finalTotal = subtotal;
  document.getElementById("final-total").textContent = `$${finalTotal.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  renderCheckout();
});

async function confirmOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const shippingAddress = document.getElementById("shipping-address").value.trim();
  if (!shippingAddress) {
    alert("Please enter a shipping address.");
    document.getElementById("shipping-address").focus();
    return;
  }

  const btn = document.getElementById("confirm-btn");
  btn.disabled = true;
  btn.textContent = "Processing...";

  try {
    // 0. Sync frontend cart to backend
    await fetchWithAuth(`${API_BASE_URL}/cart`, { method: "DELETE" });
    for (let item of cart) {
      const syncRes = await fetchWithAuth(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity
        })
      });
      if (!syncRes.ok) {
        throw new Error("Failed to sync cart with server");
      }
    }
// 1. Create order
const orderRes = await fetchWithAuth(`${API_BASE_URL}/orders`, {
  method: "POST",
  body: JSON.stringify({
    shippingAddress
  })
});

const orderData = await orderRes.json();

if (!orderRes.ok) {
  alert(orderData.error || "Failed to create order");
  btn.disabled = false;
  btn.textContent = "Proceed to Payment";
  return;
}

    // 2. Create Stripe Session
    const sessionRes = await fetchWithAuth(`${API_BASE_URL}/checkout/create-session`, {
      method: "POST",
      body: JSON.stringify({ orderId: orderData.orderId || orderData.order._id || orderData._id })
    });

    const sessionData = await sessionRes.json();

    if (!sessionRes.ok) {
      alert(sessionData.error || "Failed to initiate payment");
      btn.disabled = false;
      btn.textContent = "Proceed to Payment";
      return;
    }

    if (sessionData.url) {
      // Redirect to Stripe Checkout page
      window.location.href = sessionData.url;
    } else {
      alert("No redirect URL provided by Stripe.");
      btn.disabled = false;
      btn.textContent = "Proceed to Payment";
    }

  } catch (e) {
    console.error(e);
    alert("Network error. Please try again.");
    btn.disabled = false;
    btn.textContent = "Proceed to Payment";
  }
}