# Deploy to Render

## Option 1: Blueprint (Recommended)

1. Fork/push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** > **Blueprint**
4. Connect your GitHub repo
5. Set the following environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string (use Render MySQL or PlanetScale) |
| `SESSION_SECRET` | Strong random string for signing session cookies |
| `KIMI_API_KEY` | *(Optional)* Kimi API key for enhanced AI responses |
| `KIMI_OPEN_URL` | *(Optional)* Kimi Open API base URL |

6. Click **Apply** - Render will build and deploy automatically

## Option 2: Web Service + Dockerfile

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** > **Web Service**
3. Connect your GitHub repo
4. Select **Docker** as runtime
5. Set the environment variables above
6. Deploy

## Database Setup

Create a MySQL database (Render MySQL or any provider):

```bash
# After creating DB, run migrations:
npm run db:push
```

## After Deployment

- **Frontend**: https://your-service-name.onrender.com
- **API**: https://your-service-name.onrender.com/api
