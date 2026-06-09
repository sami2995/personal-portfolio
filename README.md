# Portfolio Website with Secure Admin Panel

A full-stack portfolio website with a secure admin panel for managing content without touching code.

## Features

- ✅ **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- ✅ **Database Storage** - SQLite database (easily switchable to PostgreSQL/MySQL)
- ✅ **RESTful API** - Clean API endpoints for all CRUD operations
- ✅ **Admin Panel** - Easy-to-use interface for managing portfolio content
- ✅ **Real-time Updates** - Changes reflect immediately on the public site

## Tech Stack

- **Frontend**: HTML, CSS (Bootstrap), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3 (can be switched to PostgreSQL/MySQL)
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **Security**: Password hashing, token-based auth, CORS protection

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set a strong JWT_SECRET:

```env
PORT=3000
JWT_SECRET=your-super-secret-random-string-here
```

**Important**: Generate a secure random string for JWT_SECRET:
```bash
openssl rand -base64 32
```

### 3. Create Admin Account

Run the setup script to create your admin account:

```bash
npm run setup
```

You'll be prompted to enter:
- Username (default: `admin`)
- Password (minimum 8 characters)

### 4. Initialize Database with Default Data

The database will be created automatically when you start the server. To populate it with your existing portfolio data, you can either:

**Option A**: Use the admin panel after logging in
**Option B**: Create a migration script (see below)

### 5. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Usage

### Accessing the Admin Panel

1. Navigate to your portfolio website
2. Press **Ctrl + Shift + A** (or scroll to the admin section)
3. Login with your admin credentials
4. Manage your content through the admin interface

### Admin Features

- **About Me**: Edit your bio and introduction
- **Skills**: Manage frontend, backend, and tools categories
- **Projects**: Add, edit, delete, and reorder projects

## API Endpoints

### Public Endpoints

- `GET /api/portfolio` - Get all portfolio data (public)

### Authentication

- `POST /api/admin/login` - Login and get JWT token
  ```json
  {
    "username": "admin",
    "password": "your-password"
  }
  ```

### Protected Endpoints (require JWT token)

- `GET /api/admin/verify` - Verify token validity
- `PUT /api/admin/about` - Update about section
- `PUT /api/admin/skills` - Update skills section
- `GET /api/admin/projects` - Get all projects (admin view)
- `POST /api/admin/projects` - Create new project
- `PUT /api/admin/projects/:id` - Update project
- `DELETE /api/admin/projects/:id` - Delete project

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt (10 rounds)
2. **JWT Tokens**: Secure token-based authentication with expiration (24h)
3. **Token Validation**: All protected routes verify JWT tokens
4. **CORS Protection**: Configured for your domain
5. **Input Validation**: Server-side validation for all inputs

## Database Schema

### `admins` table
- `id` (INTEGER PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `password_hash` (TEXT)
- `created_at` (DATETIME)

### `portfolio_data` table
- `id` (INTEGER PRIMARY KEY)
- `section` (TEXT) - 'about' or 'skills'
- `data` (TEXT) - JSON string
- `updated_at` (DATETIME)

### `projects` table
- `id` (INTEGER PRIMARY KEY)
- `title` (TEXT)
- `description` (TEXT)
- `image` (TEXT)
- `link` (TEXT)
- `link_label` (TEXT)
- `display_order` (INTEGER)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## Deployment

### Environment Variables for Production

Make sure to set:
- `PORT` - Server port
- `JWT_SECRET` - Strong random secret (use `openssl rand -base64 32`)

### Database Backup

The SQLite database file (`portfolio.db`) contains all your data. Make sure to:
- Backup regularly
- Include in `.gitignore` (already done)
- Set up automated backups in production

### Switching to PostgreSQL/MySQL

1. Install the appropriate driver (`pg` for PostgreSQL, `mysql2` for MySQL)
2. Update `server.js` database connection
3. Update SQL queries to match your database syntax
4. Update `.env` with database connection string

## Troubleshooting

### "Cannot find module" errors
- Run `npm install` to install dependencies

### "Port already in use"
- Change `PORT` in `.env` or stop the process using port 3000

### "Authentication failed"
- Make sure you've run `npm run setup` to create admin account
- Check that JWT_SECRET is set in `.env`

### Database errors
- Make sure the `portfolio.db` file has write permissions
- Check that SQLite3 is properly installed

## License

MIT

## Support

For issues or questions, please check the code comments or create an issue.
