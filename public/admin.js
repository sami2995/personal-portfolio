// ==========================================
// ADMIN DASHBOARD — Supabase Auth guard + CRUD
// ==========================================
(function () {
  const db = window.appSupabase;

  // ---------- small helpers ----------
  function setStatus(el, message, ok) {
    if (!el) return;
    el.textContent = message;
    el.style.color = ok ? '#34d399' : '#f87171';
    if (message) {
      setTimeout(() => { el.textContent = ''; }, 2500);
    }
  }

  function parseList(value) {
    return String(value || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  function redirectToLogin() {
    window.location.replace('login.html');
  }

  // ---------- auth guard ----------
  async function requireAuth() {
    if (!db) {
      redirectToLogin();
      return null;
    }
    const { data, error } = await db.auth.getSession();
    if (error || !data || !data.session) {
      redirectToLogin();
      return null;
    }
    return data.session;
  }

  // ---------- data loading ----------
  async function loadAboutAndSkills() {
    const { data, error } = await db
      .from('portfolio_data')
      .select('section, data')
      .in('section', ['about', 'skills']);

    if (error) throw error;

    const sections = {};
    for (const row of data || []) sections[row.section] = row.data;

    // About
    const aboutText = document.getElementById('about-text');
    const about = Array.isArray(sections.about) ? sections.about : [];
    aboutText.value = about.join('\n\n');

    // Skills
    const skills = sections.skills && typeof sections.skills === 'object'
      ? sections.skills
      : { frontend: [], backend: [], tools: [] };
    document.getElementById('skills-frontend').value = (skills.frontend || []).join(', ');
    document.getElementById('skills-backend').value = (skills.backend || []).join(', ');
    document.getElementById('skills-tools').value = (skills.tools || []).join(', ');
  }

  async function loadProjects() {
    const { data, error } = await db
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  function renderProjectsTable(projects) {
    const table = document.getElementById('projects-admin-table');
    table.innerHTML = '';

    if (projects.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="4" class="admin-help">No projects yet. Add your first one above.</td>';
      table.appendChild(tr);
      return;
    }

    projects.forEach((project, index) => {
      const tr = document.createElement('tr');
      const linkBadge = project.link
        ? '<span class="badge-pill bg-success-themed">Yes</span>'
        : '<span class="badge-pill bg-secondary-themed">No</span>';
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHtml(project.title || '')}</td>
        <td>${linkBadge}</td>
        <td>
          <button class="btn-outline-primary" style="margin-right: 6px;" data-action="edit" data-id="${project.id}">Edit</button>
          <button class="btn-outline-danger" data-action="delete" data-id="${project.id}">Delete</button>
        </td>
      `;
      table.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------- init after auth ----------
  async function init() {
    const session = await requireAuth();
    if (!session) return;

    // Reveal the dashboard.
    document.getElementById('admin-loading').style.display = 'none';
    document.getElementById('admin-shell').style.display = 'block';

    const userLine = document.getElementById('admin-user-line');
    if (session.user && session.user.email) {
      userLine.textContent = `Signed in as ${session.user.email}. Changes save directly to Supabase.`;
    }

    // Redirect if the session is signed out in another tab.
    db.auth.onAuthStateChange((event, currentSession) => {
      if (!currentSession) redirectToLogin();
    });

    // Load existing content.
    try {
      await loadAboutAndSkills();
      renderProjectsTable(await loadProjects());
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }

    // ----- Logout -----
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await db.auth.signOut();
      redirectToLogin();
    });

    // ----- About form -----
    document.getElementById('about-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('about-status');
      const paragraphs = String(document.getElementById('about-text').value || '')
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean);

      try {
        const { error } = await db
          .from('portfolio_data')
          .upsert({ section: 'about', data: paragraphs }, { onConflict: 'section' });
        if (error) throw error;
        setStatus(status, 'Saved!', true);
      } catch (error) {
        console.error('Save about failed:', error);
        setStatus(status, 'Error: ' + error.message, false);
      }
    });

    // ----- Skills form -----
    document.getElementById('skills-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('skills-status');
      const skills = {
        frontend: parseList(document.getElementById('skills-frontend').value),
        backend: parseList(document.getElementById('skills-backend').value),
        tools: parseList(document.getElementById('skills-tools').value)
      };

      try {
        const { error } = await db
          .from('portfolio_data')
          .upsert({ section: 'skills', data: skills }, { onConflict: 'section' });
        if (error) throw error;
        setStatus(status, 'Saved!', true);
      } catch (error) {
        console.error('Save skills failed:', error);
        setStatus(status, 'Error: ' + error.message, false);
      }
    });

    // ----- Projects form (add / update) -----
    const projectForm = document.getElementById('project-form');
    const projectIdInput = document.getElementById('project-index');
    const projectSubmitBtn = document.getElementById('project-submit-btn');
    const projectCancelBtn = document.getElementById('project-cancel-btn');

    function resetProjectForm() {
      projectIdInput.value = '';
      projectForm.reset();
      projectSubmitBtn.textContent = 'Add Project';
      projectSubmitBtn.className = 'btn-success';
      projectCancelBtn.style.display = 'none';
    }

    async function refreshProjects() {
      renderProjectsTable(await loadProjects());
    }

    projectCancelBtn.addEventListener('click', resetProjectForm);

    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('projects-status');
      const project = {
        title: document.getElementById('project-title').value.trim(),
        image: document.getElementById('project-image').value.trim(),
        link: document.getElementById('project-link').value.trim(),
        link_label: document.getElementById('project-link-label').value.trim(),
        description: document.getElementById('project-description').value.trim()
      };
      const projectId = projectIdInput.value;

      try {
        if (projectId) {
          const { error } = await db.from('projects').update(project).eq('id', projectId);
          if (error) throw error;
          setStatus(status, 'Project updated!', true);
        } else {
          const { error } = await db.from('projects').insert([project]);
          if (error) throw error;
          setStatus(status, 'Project added!', true);
        }
        resetProjectForm();
        await refreshProjects();
      } catch (error) {
        console.error('Save project failed:', error);
        setStatus(status, 'Error: ' + error.message, false);
      }
    });

    // ----- Projects table (edit / delete) -----
    document.getElementById('projects-admin-table').addEventListener('click', async (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const action = target.getAttribute('data-action');
      const projectId = target.getAttribute('data-id');
      if (!action || !projectId) return;

      if (action === 'edit') {
        try {
          const { data, error } = await db.from('projects').select('*').eq('id', projectId).single();
          if (error) throw error;
          if (data) {
            document.getElementById('project-title').value = data.title || '';
            document.getElementById('project-image').value = data.image || '';
            document.getElementById('project-link').value = data.link || '';
            document.getElementById('project-link-label').value = data.link_label || '';
            document.getElementById('project-description').value = data.description || '';
            projectIdInput.value = String(data.id);
            projectSubmitBtn.textContent = 'Update Project';
            projectSubmitBtn.className = 'btn-primary';
            projectCancelBtn.style.display = 'inline-block';
            window.scrollTo({ top: document.getElementById('project-form').offsetTop - 100, behavior: 'smooth' });
          }
        } catch (error) {
          alert('Error loading project: ' + error.message);
        }
      } else if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
          const { error } = await db.from('projects').delete().eq('id', projectId);
          if (error) throw error;
          resetProjectForm();
          await refreshProjects();
          setStatus(document.getElementById('projects-status'), 'Project deleted.', true);
        } catch (error) {
          alert('Error deleting project: ' + error.message);
        }
      }
    });
  }

  init();
})();
