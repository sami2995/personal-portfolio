const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const rateLimit = require('express-rate-limit');

/*
|--------------------------------------------------------------------------
| Environment validation
|--------------------------------------------------------------------------
*/

const missingEnvironmentVariables = [];

if (!SUPABASE_URL) {
  missingEnvironmentVariables.push('SUPABASE_URL');
}

if (!SUPABASE_SECRET_KEY) {
  missingEnvironmentVariables.push('SUPABASE_SECRET_KEY');
}

if (!JWT_SECRET) {
  missingEnvironmentVariables.push('JWT_SECRET');
}

if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`
  );
}

if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

/*
|--------------------------------------------------------------------------
| Supabase client
|--------------------------------------------------------------------------
|
| The Secret key must only be used on this backend.
| It must never be included in public/index.html.
|
*/

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.disable('x-powered-by');

app.use(
  express.json({
    limit: '100kb'
  })
);

// Serves public/index.html and public/image locally.
// Vercel also recognizes files placed inside public/.
app.use(express.static(path.join(__dirname, 'public')));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many messages submitted. Please try again later.'
  }
});

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const TOKEN_OPTIONS = {
  expiresIn: '24h',
  algorithm: 'HS256',
  issuer: 'samiyas-portfolio-api',
  audience: 'samiyas-portfolio-admin'
};

const TOKEN_VERIFICATION_OPTIONS = {
  algorithms: ['HS256'],
  issuer: 'samiyas-portfolio-api',
  audience: 'samiyas-portfolio-admin'
};

/*
|--------------------------------------------------------------------------
| Utility functions
|--------------------------------------------------------------------------
*/

function cleanString(value, maximumLength = 5000) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maximumLength);
}

function cleanStringArray(value, maximumItems = 100) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maximumItems);
}

function normalizeSkills(skills) {
  if (
    !skills ||
    typeof skills !== 'object' ||
    Array.isArray(skills)
  ) {
    return null;
  }

  return {
    frontend: cleanStringArray(skills.frontend),
    backend: cleanStringArray(skills.backend),
    tools: cleanStringArray(skills.tools)
  };
}

function normalizeDisplayOrder(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    return 0;
  }

  return number;
}

function normalizeProject(body = {}) {
  return {
    title: cleanString(body.title, 200),
    description: cleanString(body.description, 5000),
    image: cleanString(body.image, 2000),
    link: cleanString(body.link, 2000),
    link_label: cleanString(body.link_label, 100),
    display_order: normalizeDisplayOrder(body.display_order)
  };
}

function parseProjectId(value) {
  const projectId = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(projectId) || projectId <= 0) {
    return null;
  }

  return projectId;
}

function logServerError(label, error) {
  console.error(label, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint
  });
}

/*
|--------------------------------------------------------------------------
| JWT authentication middleware
|--------------------------------------------------------------------------
*/

function authenticateToken(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith('Bearer ')
  ) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  const token = authorizationHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  try {
    req.user = jwt.verify(
      token,
      JWT_SECRET,
      TOKEN_VERIFICATION_OPTIONS
    );

    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid or expired token'
    });
  }
}

/*
|--------------------------------------------------------------------------
| Supabase helper functions
|--------------------------------------------------------------------------
*/

async function getPortfolioData(section) {
  const { data, error } = await supabase
    .from('portfolio_data')
    .select('data')
    .eq('section', section)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.data ?? null;
}

async function setPortfolioData(section, value) {
  const { data, error } = await supabase
    .from('portfolio_data')
    .upsert(
      {
        section,
        data: value,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'section'
      }
    )
    .select('section, data, updated_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function getAllProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', {
      ascending: true
    })
    .order('id', {
      ascending: true
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { error } = await supabase
      .from('portfolio_data')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    return res.json({
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    logServerError('Health check failed', error);

    return res.status(503).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});

// Get all public portfolio data
app.get('/api/portfolio', async (req, res) => {
  try {
    const [about, skills, projects] = await Promise.all([
      getPortfolioData('about'),
      getPortfolioData('skills'),
      getAllProjects()
    ]);

    return res.json({
      about: Array.isArray(about) ? about : [],
      skills: skills || {
        frontend: [],
        backend: [],
        tools: []
      },
      projects
    });
  } catch (error) {
    logServerError('Failed to fetch portfolio data', error);

    return res.status(500).json({
      error: 'Failed to fetch portfolio data'
    });
  }
});

/*
|--------------------------------------------------------------------------
| Authentication routes
|--------------------------------------------------------------------------
*/

app.post('/api/admin/login', async (req, res) => {
  const username = cleanString(req.body?.username, 50);
  const password =
    typeof req.body?.password === 'string'
      ? req.body.password
      : '';

  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password are required'
    });
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, username, password_hash')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // Use the same message whether the username or password is incorrect.
    if (!admin) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        sub: String(admin.id),
        username: admin.username,
        role: 'admin'
      },
      JWT_SECRET,
      TOKEN_OPTIONS
    );

    return res.json({
      token,
      username: admin.username,
      expiresIn: '24h'
    });
  } catch (error) {
    logServerError('Admin login failed', error);

    return res.status(500).json({
      error: 'Authentication error'
    });
  }
});

/*
|--------------------------------------------------------------------------
| Protected portfolio routes
|--------------------------------------------------------------------------
*/

// Verify the current JWT
app.get(
  '/api/admin/verify',
  authenticateToken,
  (req, res) => {
    return res.json({
      valid: true,
      user: {
        id: req.user.sub,
        username: req.user.username,
        role: req.user.role
      }
    });
  }
);

// Update About section
app.put(
  '/api/admin/about',
  authenticateToken,
  async (req, res) => {
    if (!Array.isArray(req.body?.about)) {
      return res.status(400).json({
        error: 'About must be an array'
      });
    }

    const about = cleanStringArray(req.body.about, 20).map(
      (paragraph) => paragraph.slice(0, 5000)
    );

    try {
      await setPortfolioData('about', about);

      return res.json({
        message: 'About section updated successfully',
        about
      });
    } catch (error) {
      logServerError('Failed to update About section', error);

      return res.status(500).json({
        error: 'Failed to update about section'
      });
    }
  }
);

// Update Skills section
app.put(
  '/api/admin/skills',
  authenticateToken,
  async (req, res) => {
    const skills = normalizeSkills(req.body?.skills);

    if (!skills) {
      return res.status(400).json({
        error: 'Invalid skills data'
      });
    }

    try {
      await setPortfolioData('skills', skills);

      return res.json({
        message: 'Skills section updated successfully',
        skills
      });
    } catch (error) {
      logServerError('Failed to update Skills section', error);

      return res.status(500).json({
        error: 'Failed to update skills section'
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Protected project routes
|--------------------------------------------------------------------------
*/

// Get all projects for the admin panel
app.get(
  '/api/admin/projects',
  authenticateToken,
  async (req, res) => {
    try {
      const projects = await getAllProjects();
      return res.json(projects);
    } catch (error) {
      logServerError('Failed to fetch admin projects', error);

      return res.status(500).json({
        error: 'Failed to fetch projects'
      });
    }
  }
);

// Create a project
app.post(
  '/api/admin/projects',
  authenticateToken,
  async (req, res) => {
    const project = normalizeProject(req.body);

    if (!project.title) {
      return res.status(400).json({
        error: 'Title is required'
      });
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return res.status(201).json(data);
    } catch (error) {
      logServerError('Failed to create project', error);

      return res.status(500).json({
        error: 'Failed to create project'
      });
    }
  }
);

// Update a project
app.put(
  '/api/admin/projects/:id',
  authenticateToken,
  async (req, res) => {
    const projectId = parseProjectId(req.params.id);

    if (!projectId) {
      return res.status(400).json({
        error: 'Invalid project ID'
      });
    }

    const project = normalizeProject(req.body);

    if (!project.title) {
      return res.status(400).json({
        error: 'Title is required'
      });
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...project,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select('*')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return res.status(404).json({
          error: 'Project not found'
        });
      }

      return res.json({
        message: 'Project updated successfully',
        project: data
      });
    } catch (error) {
      logServerError('Failed to update project', error);

      return res.status(500).json({
        error: 'Failed to update project'
      });
    }
  }
);

// Delete a project
app.delete(
  '/api/admin/projects/:id',
  authenticateToken,
  async (req, res) => {
    const projectId = parseProjectId(req.params.id);

    if (!projectId) {
      return res.status(400).json({
        error: 'Invalid project ID'
      });
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .select('id')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return res.status(404).json({
          error: 'Project not found'
        });
      }

      return res.json({
        message: 'Project deleted successfully'
      });
    } catch (error) {
      logServerError('Failed to delete project', error);

      return res.status(500).json({
        error: 'Failed to delete project'
      });
    }
  }
);

app.post('/api/contact', contactLimiter, async (req, res) => {
  const name = cleanString(req.body?.name, 100);
  const email = cleanString(req.body?.email, 200);
  const subject = cleanString(req.body?.subject, 200);
  const message = cleanString(req.body?.message, 5000);

  // Honeypot field: real users never fill this.
  const website = cleanString(req.body?.website, 200);

  if (website) {
    // Return success so bots do not know they were blocked.
    return res.status(201).json({
      message: 'Message sent successfully'
    });
  }

  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'Name, email, and message are required'
    });
  }

  if (name.length < 2) {
    return res.status(400).json({
      error: 'Please enter a valid name'
    });
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      error: 'Please enter a valid email address'
    });
  }

  if (message.length < 10) {
    return res.status(400).json({
      error: 'Message must contain at least 10 characters'
    });
  }

  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email: email.toLowerCase(),
        subject,
        message,
        status: 'unread'
      })
      .select('id, created_at')
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      message: 'Message sent successfully',
      submission: {
        id: data.id,
        createdAt: data.created_at
      }
    });
  } catch (error) {
    logServerError('Contact form submission failed', error);

    return res.status(500).json({
      error: 'Unable to send your message right now'
    });
  }
});

/*
|--------------------------------------------------------------------------
| API not-found and error handling
|--------------------------------------------------------------------------
*/

app.use('/api', (req, res) => {
  return res.status(404).json({
    error: 'API endpoint not found'
  });
});

app.use((error, req, res, next) => {
  logServerError('Unhandled server error', error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: 'Internal server error'
  });
});

/*
|--------------------------------------------------------------------------
| Local server and Vercel export
|--------------------------------------------------------------------------
|
| Locally, running `node server.js` starts the server.
| On Vercel, the Express application is exported.
|
*/

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;