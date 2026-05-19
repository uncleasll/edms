# Free Deploy Setup

Recommended free stack:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Supabase PostgreSQL

## 1. Supabase Database

1. Create a free Supabase project.
2. Open Project Settings -> Database.
3. Copy the connection string.
4. Use the pooled/session connection string if Supabase recommends it.
5. Replace password placeholders with your real DB password.

The backend creates tables and seeds demo data on first startup.

## 2. Render Backend

1. Push this project to GitHub.
2. Render -> New -> Web Service.
3. Select the GitHub repo.
4. Settings:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements-postgres.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Plan: Free
5. Environment variables:
   - `DATABASE_URL`: your Supabase PostgreSQL URL
   - `JWT_SECRET`: long random string
   - `CORS_ORIGINS`: `["https://YOUR-VERCEL-DOMAIN.vercel.app","http://localhost:5173"]`
   - `STORAGE_DIR`: `storage`

Render free backend sleeps when unused. First request after sleep can be slow.

Important: Render free filesystem is not permanent. For production file storage, use Supabase Storage/S3. The current free local/Render mode is fine for demo, but uploaded files may disappear after redeploy/restart.

## 3. Vercel Frontend

1. Vercel -> Add New Project.
2. Import the same GitHub repo.
3. Framework: Vite.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment variable:
   - `VITE_API_URL`: `https://YOUR-RENDER-SERVICE.onrender.com/api`
7. Deploy.

After Vercel deploys, copy the Vercel domain and update Render `CORS_ORIGINS`.

## 4. Login

Demo director:

```text
direktor
1234
```

Admin URL:

```text
https://YOUR-VERCEL-DOMAIN.vercel.app/admin
```

## 5. Production Notes

- Change the default `JWT_SECRET`.
- Change demo passwords from the admin panel.
- Use Supabase Storage or S3 before real file usage.
- Keep PostgreSQL backups enabled in Supabase when moving beyond demo.
