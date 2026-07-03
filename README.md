# Software Testing Finals

Full-stack app with a React frontend and Express backend backed by Supabase (PostgreSQL).

## Prerequisites

- Node.js 20+
- A Supabase project
- A [Vercel](https://vercel.com) account

## Supabase setup

1. Create a project at [https://supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `backend/supabase/schema.sql`
3. Copy your project URL and service role key from **Project Settings → API**

## Local development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend/client
cp .env.example .env
npm install
npm run dev
```

---

## Vercel deployment

Deploy **two separate Vercel projects** from the same repo.

### 1. Deploy the backend

1. Vercel → **Add New Project** → import your repo
2. **Root Directory:** `backend`
3. **Framework Preset:** Other
4. Leave build command empty (Vercel uses `vercel.json`)
5. Add environment variables:

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `JWT_SECRET` | strong random string |
| `JWT_REFRESH_SECRET` | strong random string |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` |
| `ADMIN_EMAIL` | admin email |
| `ADMIN_PASSWORD` | admin password |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase JSON (optional) |

6. Deploy and copy the backend URL (e.g. `https://your-api.vercel.app`)

7. Test: `https://your-api.vercel.app/ping` → `{"message":"pong"}`

### 2. Deploy the frontend

1. Vercel → **Add New Project** → same repo
2. **Root Directory:** `frontend/client`
3. **Framework Preset:** Vite
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Add environment variables:

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://your-api.vercel.app` |
| `VITE_SUPABASE_URL` | your Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | your publishable key |
| `VITE_FIREBASE_API_KEY` | your Firebase web key |

7. Deploy

8. Update backend `CORS_ORIGIN` to your frontend Vercel URL and redeploy the backend

### 3. Firebase (Google login)

In Firebase Console → **Authentication → Settings → Authorized domains**, add:

- `your-frontend.vercel.app`

---

## Production notes

- **Image uploads:** Local `./uploads/` does not persist on Vercel serverless. Auth, posts without new images, comments, likes, and bookmarks work; for production image uploads use Supabase Storage (future improvement).
- **Cookies:** Cross-origin auth cookies use `SameSite=None` + `Secure` in production.
- **Env files:** Never commit `.env`. Use Vercel project settings for secrets.

## Notes

- The backend uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (no `VITE_` prefix).
- The frontend uses `VITE_API_URL` to reach the deployed API.
- Run the SQL schema before the first backend deploy.
