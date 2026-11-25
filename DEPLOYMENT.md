# ChronoVault — Deployment Guide

This guide walks you through deploying the **ChronoVault Digital Time Capsule** full-stack application to production.

---

## 1. Architecture Overview

- **Frontend**: React + TypeScript + Tailwind CSS (Deploy to **Vercel**, **Netlify**, or **Cloudflare Pages**)
- **Backend API**: Node.js + Express (Deploy to **Render**, **Railway**, or **Docker/VPS**)
- **Database & Storage**: Supabase PostgreSQL & S3 Private Buckets (Hosted on **Supabase**)

---

## 2. Database Preparation (Supabase)

1. Open your project on [https://supabase.com](https://supabase.com).
2. Ensure you have run [database/setup_all.sql](file:///c:/Users/NANDITH%20RAJ/OneDrive/Desktop/DIGITAL%20TWIN%20CAPSULE/database/setup_all.sql) in the **SQL Editor**.
3. Verify that the private bucket `capsule-files` has been created under **Storage**.
4. Retrieve your production keys from **Project Settings → API**:
   - Project URL: `https://<project-id>.supabase.co`
   - `anon` `public` key
   - `service_role` `secret` key

---

## 3. Deploying the Backend API (Render / Railway)

### Option A: Render (Recommended)
1. Push your repository to GitHub.
2. Sign in to [https://render.com](https://render.com) and click **New → Web Service**.
3. Connect your GitHub repository.
4. Set the following options:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `FRONTEND_URL` = `https://your-frontend-domain.vercel.app`
   - `SUPABASE_URL` = `https://<your-project-id>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `<your-service-role-secret-key>`
   - `SUPABASE_ANON_KEY` = `<your-anon-public-key>`
6. Click **Deploy Web Service**.
7. Note down your backend URL (e.g., `https://chronovault-api.onrender.com`).

---

## 4. Deploying the Frontend (Vercel)

### Option A: Vercel (Recommended)
1. Sign in to [https://vercel.com](https://vercel.com) and click **Add New → Project**.
2. Select your repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://<your-project-id>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<your-anon-public-key>`
   - `VITE_API_URL` = `https://chronovault-api.onrender.com/api` (your backend URL)
5. Click **Deploy**.

The [frontend/vercel.json](file:///c:/Users/NANDITH%20RAJ/OneDrive/Desktop/DIGITAL%20TWIN%20CAPSULE/frontend/vercel.json) file handles Single-Page Application (SPA) routing rewrites automatically.

---

## 5. Containerized Deployment (Docker Compose)

To run the entire full-stack application on any Linux VPS or server using Docker:

1. Populate your environment variables in `.env`.
2. Run:
```bash
docker-compose up -d --build
```
3. Access:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

---

## 6. Production Security Checklist

- [x] **Service Role Key Isolation**: Verified `SUPABASE_SERVICE_ROLE_KEY` exists strictly in `backend/.env` and is never referenced in client code.
- [x] **Server-Side Temporal Guard**: Verified `POST /api/capsules/:id/open` strictly checks `Date.now() >= targetTime` on the server before releasing letters or signed URLs.
- [x] **Private Storage Buckets**: Verified `capsule-files` bucket is set to `public: false` with time-limited signed URLs (60-second expiration).
- [x] **CORS Origins**: Verified `FRONTEND_URL` whitelist restricts unauthorized origins from requesting sensitive endpoints.
- [x] **File MIME & Size Filters**: Verified 50MB limits and strict image/video/document type checking.
