# Quick Start Guide

Get your portfolio admin system up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set a strong JWT_SECRET
# Generate one with: openssl rand -base64 32
```

**Important**: Open `.env` and replace `your-super-secret-jwt-key-change-this-in-production` with a secure random string.

## Step 3: Create Admin Account

```bash
npm run setup
```

Enter:
- Username (or press Enter for default: `admin`)
- Password (minimum 8 characters)

## Step 4: Migrate Existing Data (Optional)

If you want to populate the database with your existing portfolio data:

```bash
npm run migrate
```

This will add all your current projects, about text, and skills to the database.

## Step 5: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## Step 6: Access Admin Panel

1. Open your browser to `http://localhost:3000`
2. Press **Ctrl + Shift + A** (or scroll to admin section)
3. Login with your admin credentials
4. Start managing your portfolio!

## Troubleshooting

**Port already in use?**
- Change `PORT` in `.env` to a different number (e.g., 3001)

**Can't login?**
- Make sure you ran `npm run setup` first
- Check that your password is correct

**Database errors?**
- Make sure `portfolio.db` has write permissions
- Delete `portfolio.db` and restart the server to recreate it

**API errors?**
- Make sure the server is running (`npm start`)
- Check browser console for error messages
- Verify `API_BASE_URL` in the frontend code matches your server URL

## Next Steps

- Customize your portfolio content through the admin panel
- Deploy to a hosting service (Heroku, Railway, Render, etc.)
- Set up automated backups for your database
- Consider switching to PostgreSQL for production

## Security Reminders

- ✅ Never commit `.env` file to git (already in `.gitignore`)
- ✅ Use a strong, random `JWT_SECRET` in production
- ✅ Use HTTPS in production
- ✅ Regularly backup your `portfolio.db` file
- ✅ Change default admin password after first login
