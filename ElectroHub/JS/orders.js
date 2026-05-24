document.addEventListener("DOMContentLoaded", async () => {
  const user = getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const container = document.getElementById("orders-list");

  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/orders`);
    if (!res.ok) {
      container.innerHTML = '<p style="color:red">Failed to load orders.</p>';
      return;
    }

    const orders = await res.json();

    if (orders.length === 0) {
      container.innerHTML = '<p>You have no previous orders.</p>';
      return;
    }

    container.innerHTML = "";
    orders.forEach(order => {
      let itemsHtml = order.items.map(i => `
        <div class="order-item">
          <span>${i.title} (x${i.quantity})</span>
          <span>$${(i.pricePerUnit * i.quantity).toFixed(2)}</span>
        </div>
      `).join('');

      container.innerHTML += `
        <div class="order-card">
          <div class="order-header">
            <div>
              <strong>Order ID:</strong> ${order._id}<br>
              <span style="color:var(--text-muted); font-size: 14px;">${new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span class="badge ${order.status.toLowerCase()}">${order.status}</span>
            </div>
          </div>
          <div class="order-items">
            ${itemsHtml}
            <div class="order-item" style="border-top: 1px solid var(--border); padding-top: 12px; margin-top: 12px;">
              <strong>Total</strong>
              <strong>$${order.totalAmount.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      `;
    });

  } catch(e) {
    console.error(e);
    container.innerHTML = '<p style="color:red">Failed to load orders.</p>';
  }
});
