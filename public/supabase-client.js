// ==========================================
// SHARED SUPABASE CLIENT
// Loaded on every page before its page script.
// Requires the supabase-js CDN script to be loaded first.
// ==========================================
(function () {
  const SUPABASE_URL = 'https://tnmrbwwenpspofladucp.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Bb0gSYSjgZijWpAVtrb1FA_aAnn_Q9C';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[v0] Supabase library not loaded. Check the CDN <script> tag.');
    return;
  }

  // Single shared client for the whole app. Auth sessions persist in
  // localStorage by default, so a login on login.html is visible to admin.html.
  window.appSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
})();
