# Software Testing Finals

Full-stack app with a React frontend and Express backend backed by Supabase (PostgreSQL).

## Prerequisites

- Node.js 20+
- A Supabase project

## Supabase setup

1. Create a project at [https://supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `backend/supabase/schema.sql`
3. Copy your project URL and service role key from **Project Settings → API**

## Backend setup

```bash
cd backend
cp .env.example .env
```

Fill in these values in `.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `FIREBASE_SERVICE_ACCOUNT` (only if using Google login)

Then install and start:

```bash
npm install
npm run dev
```

## Frontend setup

```bash
cd frontend/client
cp .env.example .env
npm install
npm run dev
```

Fill in these values in `frontend/client/.env`:

- `VITE_FIREBASE_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Import the client in React when needed:

```js
import { supabase } from './utils/supabase';
```

## Notes

- The backend uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (no `VITE_` prefix).
- The frontend uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- MongoDB is no longer required for this project.
- Run the SQL schema before starting the backend for the first time.
