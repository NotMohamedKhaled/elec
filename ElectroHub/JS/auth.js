const API_URL = `${API_BASE_URL}/auth`;

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('error-message');

      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok && data.token) {
          localStorage.setItem('electrohub_token', data.token);
          localStorage.setItem('electrohub_user', JSON.stringify(data.user));
          window.location.href = data.user.isAdmin ? 'dashboard.html' : 'orders.html';
        } else {
          errorEl.textContent = data.error || data.errors?.[0]?.msg || 'Login failed';
          errorEl.style.display = 'block';
        }
      } catch (err) {
        errorEl.textContent = 'Network error. Please try again.';
        errorEl.style.display = 'block';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('error-message');

      try {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (res.ok && data.token) {
          localStorage.setItem('electrohub_token', data.token);
          localStorage.setItem('electrohub_user', JSON.stringify(data.user));
          window.location.href = 'home.html';
        } else {
          errorEl.textContent = data.error || data.errors?.[0]?.msg || 'Registration failed';
          errorEl.style.display = 'block';
        }
      } catch (err) {
        errorEl.textContent = 'Network error. Please try again.';
        errorEl.style.display = 'block';
      }
    });
  }
});
