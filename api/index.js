// Vercel maps this file to the `/api` route. The `vercel.json` rewrite
// (`/api/(.*)` -> `/api`) sends every `/api/*` request here while
// preserving the original URL (e.g. `/api/admin/login`) on `req.url`.
//
// The Express app in `index.js` defines its routes WITH the `/api`
// prefix, so we forward the request unchanged — no prefix stripping.

const app = require('../index');

module.exports = (req, res) => app(req, res);
