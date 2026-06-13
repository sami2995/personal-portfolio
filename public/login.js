// ==========================================
// LOGIN PAGE — Supabase Auth
// ==========================================
(function () {
  const db = window.appSupabase;

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = document.getElementById('login-submit-btn');
  const submitText = document.getElementById('login-submit-text');
  const statusEl = document.getElementById('login-status');

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.classList.remove('contact-status--success', 'contact-status--error');
    if (type === 'success') statusEl.classList.add('contact-status--success');
    if (type === 'error') statusEl.classList.add('contact-status--error');
  }

  // If already signed in, skip the login screen.
  async function redirectIfAuthenticated() {
    if (!db) return;
    try {
      const { data } = await db.auth.getSession();
      if (data && data.session) {
        window.location.replace('admin.html');
      }
    } catch (error) {
      console.error('[v0] Session check failed:', error);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showStatus('', '');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    submitBtn.disabled = true;
    submitText.textContent = 'Signing in...';

    try {
      if (!db) throw new Error('Authentication service unavailable. Please try again later.');

      const { error } = await db.auth.signInWithPassword({ email, password });

      if (error) throw error;

      showStatus('Login successful! Redirecting...', 'success');
      window.location.replace('admin.html');
    } catch (error) {
      console.error('Login failed:', error);
      showStatus(error.message || 'Invalid email or password.', 'error');
      submitBtn.disabled = false;
      submitText.textContent = 'Sign In';
    }
  });

  redirectIfAuthenticated();
})();
