// Vercel routes requests under `/api/*` to this file. The Express
// app in `index.js` defines routes with the `/api` prefix (e.g.
// `/api/health`). When Vercel forwards a request to `api/index.js`, the
// forwarded path is `/health` (the `/api` prefix is removed). To keep
// your existing route definitions, strip the leading `/api` from the
// incoming URL and forward the request to the app.

const app = require('../index');

module.exports = (req, res) => {
  // If the incoming path starts with /api, remove that prefix so the
  // Express routes like '/api/health' continue to match after forwarding.
  if (req.url && req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '') || '/';
  }

  return app(req, res);
};
