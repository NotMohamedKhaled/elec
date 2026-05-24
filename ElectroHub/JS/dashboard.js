document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();
  if (!user || !user.isAdmin) {
    window.location.href = "home.html";
    return;
  }
  document.getElementById("admin-name").textContent = `Welcome, ${user.name}`;

  // Tabs logic
  document.querySelectorAll(".dashboard-nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dashboard-nav button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".dashboard-section").forEach(s => s.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.target).classList.add("active");
    });
  });

  loadAdminOrders();
  loadAdminProducts();
  loadAdminUsers();
});

function displayModal() {
  document.getElementById("add-product-modal").classList.add("active");
}

function hideModal() {
  document.getElementById("add-product-modal").classList.remove("active");
}

// Make sure to pass 'e' (the event object) into the function
async function addProduct(e) {
  // 1. Prevent the page from refreshing automatically
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;
  const specs = document.getElementById("specs").value;
  const image = document.getElementById("image").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", "Electronics"); // Add this to your addProduct function
  formData.append("price", price);
  formData.append("specs", specs);
  formData.append("image", image);

  const res = await fetchWithAuth(`${API_BASE_URL}/admin/products`, {
    method: "POST",
    body: formData
    // Note: DO NOT add 'Content-Type' headers when sending FormData. 
    // The browser automatically sets it to multipart/form-data with the correct boundary lines.
  });

  if (!res.ok) {
    alert("Failed to add product");
    return;
  }

  // 2. Clear out the form inputs so it's fresh for next time
  document.getElementById("add-product-form").reset();

  // 3. Hide the modal after a successful addition
  hideModal();

  // 4. Refresh your product list
  loadAdminProducts();
}

async function loadAdminOrders() {
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/orders`);
    if (!res.ok) return;
    const orders = await res.json();
    const tbody = document.querySelector("#admin-orders-table tbody");
    tbody.innerHTML = "";
    orders.forEach(order => {
      tbody.innerHTML += `
        <tr>
          <td>${order._id}</td>
          <td>${order.user?.name || 'Unknown'}</td>
          <td>$${order.totalAmount.toFixed(2)}</td>
          <td><span class="badge ${order.status.toLowerCase()}">${order.status}</span></td>
          <td>
            <select onchange="updateOrderStatus('${order._id}', this.value)">
              <option value="Pending" ${order.status==='Pending'?'selected':''}>Pending</option>
              <option value="Shipped" ${order.status==='Shipped'?'selected':''}>Shipped</option>
              <option value="Delivered" ${order.status==='Delivered'?'selected':''}>Delivered</option>
              <option value="Cancelled" ${order.status==='Cancelled'?'selected':''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    });
  } catch(e) { console.error(e); }
}

async function updateOrderStatus(id, status) {
  await fetchWithAuth(`${API_BASE_URL}/admin/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  loadAdminOrders();
}

async function loadAdminProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    const products = await res.json();
    const tbody = document.querySelector("#admin-products-table tbody");
    tbody.innerHTML = "";
    products.forEach(product => {
      const id = product._id || product.id;
      tbody.innerHTML += `
        <tr>
          <td><img src="${product.img}" crossorigin="anonymous" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
          <td>${product.title}</td>
          <td>${product.category}</td>
          <td>$${product.price.toFixed(2)}</td>
          <td>
            <button class="action-btn danger" onclick="deleteProduct('${id}')">Delete</button>
          </td>
        </tr>
      `;
    });
  } catch(e) { console.error(e); }
}

async function deleteProduct(id) {
  if(!confirm("Are you sure?")) return;
  await fetchWithAuth(`${API_BASE_URL}/admin/products/${id}`, { method: 'DELETE' });
  loadAdminProducts();
}

async function loadAdminUsers() {
  try {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/users`);
    if (!res.ok) return;
    const users = await res.json();
    const tbody = document.querySelector("#admin-users-table tbody");
    tbody.innerHTML = "";
    users.forEach(u => {
      tbody.innerHTML += `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.isAdmin ? 'Admin' : 'User'}</td>
          <td>
            ${!u.isAdmin ? `<button class="action-btn danger" onclick="deleteUser('${u._id}')">Delete</button>` : ''}
          </td>
        </tr>
      `;
    });
  } catch(e) { console.error(e); }
}

async function deleteUser(id) {
  if(!confirm("Are you sure?")) return;
  await fetchWithAuth(`${API_BASE_URL}/admin/users/${id}`, { method: 'DELETE' });
  loadAdminUsers();
}
