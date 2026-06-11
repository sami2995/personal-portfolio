(function () {
    // ==========================================
    // PARTICLES ANIMATION
    // ==========================================
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = -1000, mouseY = -1000;
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 150;

    const SUPABASE_URL =
  'https://tnmrbwwenpspofladucp.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Bb0gSYSjgZijWpAVtrb1FA_aAnn_Q9C';

const publicSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 58, 237, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Mouse interaction
        const dx = particles[i].x - mouseX;
        const dy = particles[i].y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseX, mouseY);
          const alpha = (1 - dist / 200) * 0.2;
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ==========================================
    // TYPEWRITER EFFECT
    // ==========================================
    const typewriterEl = document.getElementById('typewriter-text');
    const roles = [
      'Full Stack Developer',
      'UI/UX Enthusiast',
      'React Developer',
      'Node.js Developer',
      'Problem Solver'
    ];
    let roleIndex = 0, charIndex = 0, isDeleting = false;

    function typewrite() {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === currentRole.length) {
        speed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 400;
      }

      setTimeout(typewrite, speed);
    }
    typewrite();

    // ==========================================
    // NAVBAR SCROLL EFFECT
    // ==========================================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      navbar.classList.toggle('scrolled', scrollY > 50);
      lastScroll = scrollY;
    });

    // ==========================================
    // MOBILE NAV TOGGLE
    // ==========================================
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });

    // ==========================================
    // SCROLL REVEAL (IntersectionObserver)
    // ==========================================
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ==========================================
    // STAT COUNTER ANIMATION
    // ==========================================
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'));
          let current = 0;
          const step = Math.max(1, Math.floor(target / 40));
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = current + '+';
          }, 40);
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat__number').forEach(el => statObserver.observe(el));

    // ==========================================
    // SKILL BAR ANIMATION
    // ==========================================
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.skill-bar__fill').forEach(fill => {
            fill.style.width = fill.getAttribute('data-width');
          });
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    // ==========================================
    // ACTIVE NAV LINK ON SCROLL
    // ==========================================
    const sections = document.querySelectorAll('.section, .hero');
    const navLinkElements = document.querySelectorAll('.nav__link');

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinkElements.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(s => sectionObserver.observe(s));

    // ==========================================
    // API / AUTH HELPERS
    // ==========================================
    const API_BASE = '';

    function getToken() {
      return localStorage.getItem('portfolioToken');
    }
    function setToken(token) {
      localStorage.setItem('portfolioToken', token);
    }
    function removeToken() {
      localStorage.removeItem('portfolioToken');
    }

    async function apiRequest(url, options = {}) {
      const token = getToken();

      const headers = {
        ...(options.body
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(options.headers || {})
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE}${url}`,
        {
          ...options,
          headers
        }
      );

      const responseText = await response.text();

      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          console.error(
            'Non-JSON server response:',
            responseText
          );

          throw new Error(
            `Server returned ${response.status}`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Request failed with status ${response.status}`
        );
      }

      return data;
    }

    function showLogin() {
      document.getElementById('admin-login').style.display = 'block';
      document.getElementById('admin-panel').style.display = 'none';
    }

    function showAdminPanel() {
      document.getElementById('admin-login').style.display = 'none';
      document.getElementById('admin-panel').style.display = 'block';
    }

    async function checkAuth() {
      const token = getToken();
      if (!token) { showLogin(); return; }
      try {
        await apiRequest('/api/admin/verify');
        showAdminPanel();
        await loadAdminData();
      } catch {
        removeToken();
        showLogin();
      }
    }

    // ==========================================
    // PORTFOLIO DATA LOADING
    // ==========================================
    async function loadPortfolioData() {
  const emptyPortfolio = {
    about: [],
    skills: {
      frontend: [],
      backend: [],
      tools: []
    },
    projects: []
  };

  try {
    const [portfolioResult, projectsResult] =
      await Promise.all([
        publicSupabase
          .from('portfolio_data')
          .select('section, data')
          .in('section', ['about', 'skills']),

        publicSupabase
          .from('projects')
          .select('*')
          .order('display_order', {
            ascending: true
          })
          .order('id', {
            ascending: true
          })
      ]);

    if (portfolioResult.error) {
      throw portfolioResult.error;
    }

    if (projectsResult.error) {
      throw projectsResult.error;
    }

    const sections = {};

    for (const row of portfolioResult.data || []) {
      sections[row.section] = row.data;
    }

    return {
      about: Array.isArray(sections.about)
        ? sections.about
        : [],

      skills:
        sections.skills &&
        typeof sections.skills === 'object'
          ? {
              frontend:
                sections.skills.frontend || [],
              backend:
                sections.skills.backend || [],
              tools:
                sections.skills.tools || []
            }
          : emptyPortfolio.skills,

      projects: Array.isArray(projectsResult.data)
        ? projectsResult.data
        : []
    };
  } catch (error) {
    console.error(
      'Failed to load portfolio from Supabase:',
      error
    );

    return emptyPortfolio;
  }
}

    async function loadAdminData() {
      try {
        const data = await apiRequest('/api/portfolio');
        const aboutText = document.getElementById('about-text');
        if (aboutText && data.about) {
          aboutText.value = Array.isArray(data.about) ? data.about.join('\n\n') : '';
        }
        if (data.skills) {
          document.getElementById('skills-frontend').value = (data.skills.frontend || []).join(', ');
          document.getElementById('skills-backend').value = (data.skills.backend || []).join(', ');
          document.getElementById('skills-tools').value = (data.skills.tools || []).join(', ');
        }
        const projects = await apiRequest('/api/admin/projects');
        renderProjectsAdminTable(projects);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      }
    }

    // ==========================================
    // SKILL PERCENTAGE MAP
    // ==========================================
    function getSkillLevel(skill) {
      const map = {
        'html': 95, 'css': 90, 'javascript': 88, 'js': 88, 'react': 82,
        'node.js': 80, 'nodejs': 80, 'express.js': 78, 'expressjs': 78,
        'django': 65, 'php': 70,
        'sql': 75, 'postgresql': 70, 'postgres': 70, 'mongodb': 68, 'mongo': 68,
        'git': 85, 'github': 85, 'vs code': 90, 'vscode': 90
      };
      return map[skill.toLowerCase()] || 70;
    }

    function getSkillIcon(category) {
      const icons = {
        frontend: 'fa-solid fa-palette',
        backend: 'fa-solid fa-server',
        tools: 'fa-solid fa-database'
      };
      return icons[category] || 'fa-solid fa-code';
    }

    function getCategoryTitle(key) {
      const titles = {
        frontend: 'Frontend',
        backend: 'Backend',
        tools: 'Database & Tools'
      };
      return titles[key] || key;
    }

    // ==========================================
    // RENDER FUNCTIONS
    // ==========================================
    function showEmptyState(container, message) {
      container.innerHTML = '';

      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = message;
      container.appendChild(empty);
    }

    function renderAbout(about, container) {
      container.innerHTML = '';

      if (!Array.isArray(about) || about.length === 0) {
        showEmptyState(container, 'About information has not been added yet.');
        return;
      }

      about.forEach(text => {
        if (typeof text !== 'string' || !text.trim()) return;
        const p = document.createElement('p');
        p.textContent = text.trim();
        container.appendChild(p);
      });
    }

    function renderSkills(skills, container) {
      container.innerHTML = '';

      const safeSkills = skills && typeof skills === 'object'
        ? skills
        : { frontend: [], backend: [], tools: [] };

      const categories = ['frontend', 'backend', 'tools'];
      const hasAnySkill = categories.some(key => Array.isArray(safeSkills[key]) && safeSkills[key].length > 0);

      if (!hasAnySkill) {
        showEmptyState(container, 'Skills have not been added yet.');
        return;
      }

      categories.forEach((key, index) => {
        const skillList = Array.isArray(safeSkills[key]) ? safeSkills[key] : [];
        if (skillList.length === 0) return;

        const card = document.createElement('div');
        card.className = `skill-card glass reveal reveal-delay-${index + 1}`;

        const icon = document.createElement('div');
        icon.className = 'skill-card__icon';
        icon.innerHTML = `<i class="${getSkillIcon(key)}"></i>`;
        card.appendChild(icon);

        const title = document.createElement('h3');
        title.className = 'skill-card__title';
        title.textContent = getCategoryTitle(key);
        card.appendChild(title);

        skillList.forEach(skill => {
          if (typeof skill !== 'string' || !skill.trim()) return;

          const level = getSkillLevel(skill);
          const bar = document.createElement('div');
          bar.className = 'skill-bar';

          const header = document.createElement('div');
          header.className = 'skill-bar__header';

          const name = document.createElement('span');
          name.className = 'skill-bar__name';
          name.textContent = skill;

          const percentage = document.createElement('span');
          percentage.className = 'skill-bar__pct';
          percentage.textContent = `${level}%`;

          const track = document.createElement('div');
          track.className = 'skill-bar__track';

          const fill = document.createElement('div');
          fill.className = 'skill-bar__fill';
          fill.setAttribute('data-width', `${level}%`);

          header.appendChild(name);
          header.appendChild(percentage);
          track.appendChild(fill);
          bar.appendChild(header);
          bar.appendChild(track);
          card.appendChild(bar);
        });

        container.appendChild(card);

        revealObserver.observe(card);
        skillObserver.observe(card);
      });
    }

    function renderProjects(projects, grid) {
      grid.innerHTML = '';

      if (!Array.isArray(projects) || projects.length === 0) {
        showEmptyState(grid, 'Projects have not been added yet.');
        return;
      }

      projects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = `project-card reveal reveal-delay-${(index % 4) + 1}`;

        const imageDiv = document.createElement('div');
        imageDiv.className = 'project-card__image';

        if (project.image) {
          const img = document.createElement('img');
          img.src = project.image;
          img.alt = project.title || 'Project';
          img.loading = 'lazy';
          imageDiv.appendChild(img);
        } else {
          imageDiv.classList.add('project-card__image--empty');
          imageDiv.innerHTML = '<i class="fa-solid fa-code"></i>';
        }

        if (project.link) {
          const overlay = document.createElement('div');
          overlay.className = 'project-card__overlay';

          const overlayBtn = document.createElement('span');
          overlayBtn.className = 'project-card__overlay-btn';
          overlayBtn.textContent = project.link_label || 'View Project';

          overlay.appendChild(overlayBtn);
          imageDiv.appendChild(overlay);
        }

        card.appendChild(imageDiv);

        const body = document.createElement('div');
        body.className = 'project-card__body';

        const title = document.createElement('h3');
        title.className = 'project-card__title';
        title.textContent = project.title || 'Untitled Project';

        const desc = document.createElement('p');
        desc.className = 'project-card__desc';
        desc.textContent = project.description || '';

        body.appendChild(title);
        body.appendChild(desc);
        card.appendChild(body);

        if (project.link) {
          card.addEventListener('click', () => {
            window.open(project.link, '_blank', 'noopener');
          });
        }

        grid.appendChild(card);
        revealObserver.observe(card);
      });
    }

    function renderProjectsAdminTable(projects) {
      const table = document.getElementById('projects-admin-table');
      if (!table) return;
      table.innerHTML = '';

      projects.forEach((project, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${project.title || ''}</td>
          <td>${project.link ? '<span class="badge-pill bg-success-themed">Yes</span>' : '<span class="badge-pill bg-secondary-themed">No</span>'}</td>
          <td>
            <button class="btn-outline-primary" style="padding: 4px 12px; border-radius: 6px; cursor: pointer; margin-right: 6px;" data-action="edit" data-id="${project.id}">Edit</button>
            <button class="btn-outline-danger" style="padding: 4px 12px; border-radius: 6px; cursor: pointer;" data-action="delete" data-id="${project.id}">Delete</button>
          </td>
        `;
        table.appendChild(tr);
      });
    }

    // ==========================================
    // DOM READY
    // ==========================================
    document.addEventListener('DOMContentLoaded', async function () {
      const portfolioData = await loadPortfolioData();
      const aboutContent = document.getElementById('about-content');
      const skillsContent = document.getElementById('skills-content');
      const projectsGrid = document.getElementById('projects-grid');

      renderAbout(portfolioData.about, aboutContent);
      renderSkills(portfolioData.skills, skillsContent);
      renderProjects(portfolioData.projects, projectsGrid);

      // Update project count stat
      const projectCountEl = document.querySelector('.stat__number[data-count]');
      if (projectCountEl && portfolioData.projects) {
        projectCountEl.setAttribute('data-count', portfolioData.projects.length);
      }

      await checkAuth();

      // Login form
      document.getElementById('login-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        try {
          const response = await apiRequest('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
          });
          setToken(response.token);
          showAdminPanel();
          await loadAdminData();
          errorDiv.style.display = 'none';
        } catch (error) {
          errorDiv.textContent = error.message || 'Login failed.';
          errorDiv.style.display = 'block';
        }
      });

      // Logout
      document.getElementById('logout-btn').addEventListener('click', function () {
        removeToken();
        showLogin();
      });

      // About form
      document.getElementById('about-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const raw = document.getElementById('about-text').value || '';
        const paragraphs = raw.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
        const status = document.getElementById('about-status');

        try {
          await apiRequest('/api/admin/about', {
            method: 'PUT',
            body: JSON.stringify({ about: paragraphs })
          });
          const data = await loadPortfolioData();
          renderAbout(data.about, aboutContent);
          status.textContent = 'Saved!';
          status.style.color = '#34d399';
          setTimeout(() => { status.textContent = ''; }, 2000);
        } catch (error) {
          status.textContent = 'Error: ' + error.message;
          status.style.color = '#f87171';
        }
      });

      // Skills form
      document.getElementById('skills-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const parseSkills = (v) => v.split(',').map(s => s.trim()).filter(Boolean);
        const skills = {
          frontend: parseSkills(document.getElementById('skills-frontend').value),
          backend: parseSkills(document.getElementById('skills-backend').value),
          tools: parseSkills(document.getElementById('skills-tools').value)
        };
        const status = document.getElementById('skills-status');

        try {
          await apiRequest('/api/admin/skills', {
            method: 'PUT',
            body: JSON.stringify({ skills })
          });
          const data = await loadPortfolioData();
          renderSkills(data.skills, skillsContent);
          status.textContent = 'Saved!';
          status.style.color = '#34d399';
          setTimeout(() => { status.textContent = ''; }, 2000);
        } catch (error) {
          status.textContent = 'Error: ' + error.message;
          status.style.color = '#f87171';
        }
      });

      // Projects form
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

      projectCancelBtn.addEventListener('click', resetProjectForm);

      projectForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const project = {
          title: document.getElementById('project-title').value.trim(),
          image: document.getElementById('project-image').value.trim(),
          link: document.getElementById('project-link').value.trim(),
          link_label: document.getElementById('project-link-label').value.trim(),
          description: document.getElementById('project-description').value.trim()
        };

        const projectId = projectIdInput.value;
        const status = document.getElementById('projects-status');

        try {
          if (projectId) {
            await apiRequest(`/api/admin/projects/${projectId}`, {
              method: 'PUT',
              body: JSON.stringify(project)
            });
          } else {
            await apiRequest('/api/admin/projects', {
              method: 'POST',
              body: JSON.stringify(project)
            });
          }

          const data = await loadPortfolioData();
          renderProjects(data.projects, projectsGrid);
          await loadAdminData();
          status.textContent = projectId ? 'Project updated!' : 'Project added!';
          status.style.color = '#34d399';
          setTimeout(() => { status.textContent = ''; }, 2000);
          resetProjectForm();
        } catch (error) {
          status.textContent = 'Error: ' + error.message;
          status.style.color = '#f87171';
        }
      });

      // Project table actions (edit / delete)
      document.getElementById('projects-admin-table').addEventListener('click', async function (e) {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const action = target.getAttribute('data-action');
        const projectId = target.getAttribute('data-id');
        if (!projectId) return;

        if (action === 'edit') {
          try {
            const projects = await apiRequest('/api/admin/projects');
            const project = projects.find(p => p.id == projectId);
            if (project) {
              document.getElementById('project-title').value = project.title || '';
              document.getElementById('project-image').value = project.image || '';
              document.getElementById('project-link').value = project.link || '';
              document.getElementById('project-link-label').value = project.link_label || '';
              document.getElementById('project-description').value = project.description || '';
              projectIdInput.value = String(project.id);
              projectSubmitBtn.textContent = 'Update Project';
              projectSubmitBtn.className = 'btn-primary';
              projectCancelBtn.style.display = 'inline-block';
            }
          } catch (error) {
            alert('Error loading project: ' + error.message);
          }
        } else if (action === 'delete') {
          if (!confirm('Are you sure you want to delete this project?')) return;
          try {
            await apiRequest(`/api/admin/projects/${projectId}`, { method: 'DELETE' });
            const data = await loadPortfolioData();
            renderProjects(data.projects, projectsGrid);
            await loadAdminData();
            const status = document.getElementById('projects-status');
            status.textContent = 'Project deleted.';
            status.style.color = '#34d399';
            setTimeout(() => { status.textContent = ''; }, 2000);
            resetProjectForm();
          } catch (error) {
            alert('Error deleting project: ' + error.message);
          }
        }
      });

      const contactForm =
        document.getElementById('contact-form');

      const contactSubmitButton =
        document.getElementById('contact-submit-btn');

      const contactSubmitText =
        document.getElementById('contact-submit-text');

      const contactStatus =
        document.getElementById('contact-status');

      function showContactStatus(message, type) {
        contactStatus.textContent = message;

        contactStatus.classList.remove(
          'contact-status--success',
          'contact-status--error'
        );

        if (type === 'success') {
          contactStatus.classList.add(
            'contact-status--success'
          );
        }

        if (type === 'error') {
          contactStatus.classList.add(
            'contact-status--error'
          );
        }
      }

      contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        showContactStatus('', '');

        if (!contactForm.checkValidity()) {
          contactForm.reportValidity();
          return;
        }

        const formData = new FormData(contactForm);

        const submission = {
          name: String(formData.get('name') || '').trim(),
          email: String(formData.get('email') || '').trim(),
          subject: String(formData.get('subject') || '').trim(),
          message: String(formData.get('message') || '').trim(),
          website: String(formData.get('website') || '').trim()
        };

        contactSubmitButton.disabled = true;
        contactSubmitText.textContent = 'Sending...';

        try {
          const response = await apiRequest('/api/contact', {
            method: 'POST',
            body: JSON.stringify(submission)
          });

          showContactStatus(
            response.message || 'Message sent successfully!',
            'success'
          );

          contactForm.reset();
        } catch (error) {
          console.error('Contact submission failed:', error);

          showContactStatus(
            error.message ||
              'Unable to send your message. Please try again.',
            'error'
          );
        } finally {
          contactSubmitButton.disabled = false;
          contactSubmitText.textContent = 'Send Message';
        }
      });

      // Admin shortcut: Ctrl+Shift+A
      document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
          e.preventDefault();
          const adminSection = document.getElementById('admin');
          if (adminSection) {
            adminSection.style.display = 'block';
            adminSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  })();