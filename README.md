# ChronoVault — Digital Time Capsule Web Application

[![Full-Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Supabase-8B5CF6)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Temporal Locks](https://img.shields.io/badge/Security-Server--Enforced%20Temporal%20Locks-10B981)](#security-architecture)

> **ChronoVault** is a modern, responsive full-stack web application where users can preserve letters, photographs, 4K videos, audio messages, and personal documents inside cryptographic vaults locked until a chosen moment in the future.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Folder Structure](#project-folder-structure)
- [Database Schema & Row Level Security](#database-schema--row-level-security)
- [REST API Endpoints](#rest-api-endpoints)
- [Quick Start Guide](#quick-start-guide)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security Architecture](#security-architecture)

---

## Project Overview

A digital time capsule is only as meaningful as the integrity of its lock. Traditional web applications merely hide locked content using frontend JavaScript or CSS — which can be bypassed by inspecting network traffic or tampering with device clocks.

**ChronoVault solves this** with an uncompromising **Server-Side Temporal Guard**:
1. Capsule letters and private file download tokens are **strictly shielded on the server** until the atomic server timestamp crosses the opening date.
2. Device clocks can never be rolled forward to trick the vault; the frontend synchronizes against the backend's atomic clock.
3. Once the target opening date arrives, users celebrate the unsealing ceremony with animated confetti, decrypted letters, and 60-second time-limited signed URLs for private multimedia.

---

## Key Features

- **Modern Glassmorphic Dark UI**: Dark navy (`#070A12`) background with ambient purple/indigo glows, rounded cards, and smooth transitions.
- **Interactive Landing Page**: Hero section, 3-step timeline, 6-feature grid, and live interactive **Vault Simulator**.
- **Supabase Authentication**: User registration with name, email, and password, persistent sessions, and automatic PostgreSQL profile generation.
- **Interactive Dashboard**:
  - 4 Live Metric Counters: *Total Capsules*, *Locked Vaults*, *Opened Vaults*, and *Next Unlock Countdown*.
  - Upcoming Capsule Spotlight Timeline.
  - Recently Created Capsules Grid with real-time countdown clocks.
- **Time Capsule Creator**:
  - Title, description, and personal letter.
  - Future date, time, and timezone selectors with strict past-date rejection.
  - Drag-and-drop file uploader with live thumbnail previews for photos, videos, and PDFs (up to 50MB per file).
- **"My Capsules" Gallery**:
  - Live search by keyword.
  - Status filter tabs: `All`, `Locked`, `Opened`.
  - Category filters: `Personal`, `Friends`, `Family`, `Education`, `Travel`, `Career`, `Love`.
  - Target opening date sorting.
- **Inspection & Celebration Modal**:
  - Live Days, Hours, Minutes, Seconds countdown with a temporal journey progress bar.
  - Fullscreen photo lightbox and HTML5 video player for opened media.
  - Multi-directional confetti burst on capsule unsealing.
- **Notifications Center**:
  - Top header bell icon with dynamic unread counter badge.
  - Automated 7-day upcoming alerts and arrival alarms.
  - Filter by `All`, `Unread`, `Read`, with single-click mark-as-read and clear actions.
- **Profile & Settings**: View and update full name, change password, and manage account credentials.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti, Vite |
| **Backend** | Node.js, Express.js, TypeScript, Multer, TSX Watch, CORS, Dotenv |
| **Database & Storage** | Supabase PostgreSQL, Row Level Security (RLS), Private Storage Buckets |
| **Authentication** | Supabase Auth (JWT Bearer Token verification) |
| **Deployment** | Docker, Docker Compose, Vercel SPA Configuration, Netlify Redirects |

---

## System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   BROWSER CLIENT                      │
│     React 18 + TypeScript + Tailwind CSS + Lucide      │
└──────────────────────────┬─────────────────────────────┘
                           │
       HTTP / JSON / JWT   │   Multipart/FormData
                           ▼
┌────────────────────────────────────────────────────────┐
│               NODE.JS / EXPRESS REST API              │
│  - JWT Bearer Authentication Middleware               │
│  - Server-Side Atomic Temporal Lock Guard              │
│  - Multer MIME Validation & File Processing           │
│  - Milestone Notifications Service                    │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               │ PostgreSQL Queries       │ S3 Storage API
               ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│  SUPABASE POSTGRESQL     │   │     SUPABASE STORAGE     │
│  - profiles              │   │  Private 'capsule-files' │
│  - capsules              │   │  Time-limited signed URLs│
│  - capsule_files         │   └──────────────────────────┘
│  - notifications         │
│  - Row Level Security    │
└──────────────────────────┘
```

---

## Project Folder Structure

```text
DIGITAL TWIN CAPSULE/
├── README.md                          # Master documentation
├── DEPLOYMENT.md                      # Production deployment guide
├── docker-compose.yml                 # Multi-container orchestration
├── package.json                       # Root convenience scripts
├── database/
│   ├── schema.sql                     # PostgreSQL tables, triggers & indexes
│   ├── policies.sql                   # Row Level Security (RLS) policies
│   ├── storage.sql                    # Private bucket configuration
│   └── setup_all.sql                  # Combined 1-click execution script
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── test-runner.js                 # Integration test suite (10 tests)
│   ├── .env                           # Backend environment variables
│   └── src/
│       ├── server.ts                  # Express application entry
│       ├── config/env.ts              # Environment configuration
│       ├── middleware/
│       │   ├── auth.middleware.ts     # JWT Bearer verification
│       │   ├── temporalLock.middleware.ts # Temporal lock gatekeeper
│       │   └── errorHandler.middleware.ts
│       ├── services/
│       │   ├── supabase.service.ts    # Supabase service-role client
│       │   ├── storage.service.ts     # Private bucket & signed URLs
│       │   └── notifications.service.ts # Automated milestone alerts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── capsules.controller.ts
│       │   └── notifications.controller.ts
│       └── routes/
│           ├── auth.routes.ts
│           ├── capsules.routes.ts
│           └── notifications.routes.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── vercel.json                    # SPA routing for Vercel
    ├── Dockerfile                     # Nginx production build
    ├── .env                           # Frontend environment variables
    └── src/
        ├── main.tsx                   # React root mount
        ├── App.tsx                    # Top-level view coordinator
        ├── types/index.ts             # TypeScript domain interfaces
        ├── context/AuthContext.tsx    # Supabase Auth provider & session listener
        ├── services/
        │   ├── supabase.ts            # Supabase JS client
        │   ├── auth.ts                # Auth methods & token extractor
        │   └── api.ts                 # REST API client
        ├── hooks/
        │   ├── useCapsules.ts         # Capsule state synchronization
        │   └── useNotifications.ts    # Notification state synchronization
        ├── utils/
        │   ├── timeSync.ts            # Clock drift & countdown math
        │   └── confetti.ts            # Unsealing celebration effects
        ├── pages/
        │   └── LandingPage.tsx        # Hero, How-It-Works, Simulator
        └── components/
            ├── Navbar.tsx             # Responsive header
            ├── Footer.tsx             # Footer & security note
            ├── Sidebar.tsx            # Navigation drawer
            ├── DashboardView.tsx      # Metrics, timeline, recent capsules
            ├── CapsulesListView.tsx   # Gallery, search, and filters
            ├── CapsuleCard.tsx        # Card with countdown clock
            ├── CountdownClock.tsx     # Synchronized progress timer
            ├── CreateCapsuleModal.tsx # Drag & drop uploader modal
            ├── CapsuleDetailsModal.tsx# Unsealing & lightbox modal
            ├── NotificationsView.tsx  # Notification center
            ├── NotificationDropdown.tsx # Header notification bell
            └── ProfileView.tsx        # Account & password editor
```

---

## Database Schema & Row Level Security

ChronoVault uses 4 relational tables in Supabase PostgreSQL:

1. **`profiles`**: Linked directly to `auth.users(id)` via automated trigger `on_auth_user_created`.
2. **`capsules`**: Stores capsule metadata, category constraints, and scheduled `opening_date`.
3. **`capsule_files`**: Stores attached photos, videos, and PDFs linked to `capsules(id)`.
4. **`notifications`**: Stores milestone alerts and opening reminders.

**Row Level Security (RLS)** is enabled on all tables:
```sql
CREATE POLICY "Users can only view own capsules"
ON public.capsules FOR SELECT
USING (auth.uid() = user_id);
```

---

## REST API Endpoints

### Authentication
- `POST /api/auth/register` — Create a new account
- `POST /api/auth/login` — Sign in and receive JWT token
- `POST /api/auth/logout` — Revoke session
- `GET /api/auth/me` — Retrieve active profile

### Time Capsules
- `GET /api/capsules/server-time` — Synchronize atomic server clock
- `POST /api/capsules` — Create and seal a new time capsule (with Multer file upload)
- `GET /api/capsules` — List authenticated user's capsules (sanitized)
- `GET /api/capsules/:id` — Inspect capsule details (enforcing temporal guard)
- `PUT /api/capsules/:id` — Update capsule metadata (tamper-proof opening date)
- `DELETE /api/capsules/:id` — Delete capsule and purge private storage files
- `POST /api/capsules/:id/open` — Unseal eligible capsule once opening date has arrived

### Notifications
- `GET /api/notifications` — Retrieve alerts & check upcoming milestones
- `PUT /api/notifications/:id/read` — Mark notification as read
- `PUT /api/notifications/read-all` — Mark all notifications as read
- `DELETE /api/notifications/:id` — Delete a notification
- `DELETE /api/notifications` — Clear all notifications

---

## Quick Start Guide

### Prerequisites
- Node.js `v18+` or `v22+` installed
- VS Code or modern code editor
- Supabase account (free)

### 1. Database Setup
1. Log in to [https://supabase.com](https://supabase.com) and create a project.
2. Go to the **SQL Editor**, open [database/setup_all.sql](file:///c:/Users/NANDITH%20RAJ/OneDrive/Desktop/DIGITAL%20TWIN%20CAPSULE/database/setup_all.sql), paste its contents, and click **Run**.
3. Copy your project URL, anon key, and service role key from **Project Settings → API**.

### 2. Configure Environment Files
- In `frontend/.env`:
  ```env
  VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
  VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
  VITE_API_URL=http://localhost:5000/api
  ```
- In `backend/.env`:
  ```env
  PORT=5000
  NODE_ENV=development
  FRONTEND_URL=http://localhost:5173
  SUPABASE_URL=https://<your-project-id>.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret-key>
  SUPABASE_ANON_KEY=<your-anon-public-key>
  ```

### 3. Start Backend
Open a terminal in VS Code:
```bash
cd backend
npm install
npm run dev
```

### 4. Start Frontend
Open a second terminal in VS Code:
```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## Testing

Run the automated integration test suite:
```bash
cd backend
npm test
```
All 10 integration tests will verify authentication, date enforcement, temporal locking, premature opening defense, and notification triggers.

---

## Deployment

Refer to [DEPLOYMENT.md](file:///c:/Users/NANDITH%20RAJ/OneDrive/Desktop/DIGITAL%20TWIN%20CAPSULE/DEPLOYMENT.md) for production guides on:
- Deploying the React frontend to **Vercel** or **Netlify**
- Deploying the Express REST API to **Render**, **Railway**, or **Docker**
- Configuring custom domains and SSL

---

## Security Architecture

1. **Strict Server-Enforced Temporal Locks**: Client clocks are never trusted. All decryption and signed URL generation requires `Date.now() >= opening_date` on the server.
2. **Private Storage Isolation**: File attachments are uploaded to a private Supabase bucket (`public: false`) and can only be accessed through ephemeral 60-second signed URLs.
3. **Row-Level Security**: PostgreSQL enforces that users can only query their own records (`auth.uid() = user_id`).
4. **Service Role Isolation**: High-privilege administrative keys exist strictly in `backend/.env` and are never exposed to browser clients.

---

© 2026 ChronoVault Team. Built with React, Express & Supabase.
