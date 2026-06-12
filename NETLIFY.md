# Deploy to Netlify

This project is configured for a **full-stack Netlify deployment**:

- **Frontend**: static Vite + React SPA served from `dist/public`
- **Backend**: Hono API running as a Netlify Function (`netlify/functions/api.ts`)

## Prerequisites

- A MySQL database (e.g. PlanetScale, Railway, Aiven, or any MySQL 8 provider)
- A Netlify account

## Environment Variables

Set these in the Netlify UI (**Site settings → Environment variables**):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `SESSION_SECRET` | Strong random string for signing session cookies |
| `KIMI_API_KEY` | *(Optional)* Kimi API key for enhanced AI responses |
| `KIMI_OPEN_URL` | *(Optional)* Kimi Open API base URL |

## Deployment Steps

1. **Push to Git** (GitHub, GitLab, or Bitbucket).
2. In Netlify, click **Add new site → Import an existing project**.
3. Select your repo.
4. Configure the build:
   - **Base directory**: `Kimi_Agent_部署链接(1)/app` (or wherever the `app` folder lives in your repo)
   - **Build command**: `npm run build && npm run build:netlify-function`
   - **Publish directory**: `dist/public`
5. Add the environment variables listed above.
6. Click **Deploy site**.

Netlify will use the pre-bundled function in `.netlify/functions/api.js` and redirect all `/api/*` requests to it.

## Database Setup

After the first deploy, run migrations against your database:

```bash
npx drizzle-kit push
```

Or run it from your local machine with `DATABASE_URL` pointing to the same database.

## Local Verification

You can build locally before pushing:

```bash
npm install
npm run build
npm run build:netlify-function
```

The function bundle is output to `.netlify/functions/api.js`.

## Notes

- `netlify.toml` pins Node.js 22 for the build environment.
- The catch-all redirect `/* → /index.html` enables React Router. API routes are handled first.
