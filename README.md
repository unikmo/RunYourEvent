# Event Engine — Setup Guide

## What you need (all free)
1. **GitHub account** — github.com
2. **Vercel account** — vercel.com (sign in with GitHub)
3. **Supabase account** — supabase.com
4. **Anthropic API key** — console.anthropic.com
5. **Firebase project** — optional Volunteer Engine mirror

---

## Step 1 — GitHub Setup

1. Go to **github.com** and create an account if you don't have one
2. Click the **+** button (top right) → **New repository**
3. Name it: `event-engine`
4. Set to **Private**
5. Click **Create repository**
6. Follow the instructions to push this code:

```bash
git init
git add .
git commit -m "Initial Event Engine"
git remote add origin https://github.com/YOUR-USERNAME/event-engine.git
git push -u origin main
```

---

## Step 2 — Supabase Database

1. Go to **supabase.com** → New Project
2. Name: `event-engine`
3. Set a database password (save it)
4. Choose the region closest to you
5. Wait ~2 minutes for it to spin up

**Run the schema:**
1. In Supabase → click **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run**

**Seed the data:**
1. Click **New query** again
2. Copy and paste the contents of `supabase/seed.sql`
3. Click **Run**

**Get your API keys:**
1. Supabase → **Settings** → **API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 3 — Firebase Firestore for Volunteer Engine

Firebase can be enabled as a **server-side mirror** for volunteer recruiting while Supabase remains the current system of record.

Mirrored collections:

- `rye_volunteer_profiles`
- `rye_volunteer_organizer_requests`
- `rye_volunteer_opportunities`
- `rye_volunteer_activity`

Add these server-only variables:

```env
RYE_FIREBASE_MIRROR_ENABLED=true
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64=base64-encoded-private-key
FIREBASE_DATABASE_ID=(default)
```

Then verify:

```text
GET /api/health/firebase
```

See `docs/FIREBASE_VOLUNTEER_ENGINE.md` for the rollout and security model.

---

## Step 4 — Anthropic API Key

1. Go to **console.anthropic.com**
2. Sign in → **API Keys** → **Create Key**
3. Copy the key

---

## Step 5 — Vercel Deployment

1. Go to **vercel.com** → Sign in with GitHub
2. Click **New Project** → Import the repository
3. Add the required environment variables
4. Deploy first to preview
5. Verify database health and recruiting flows before production

---

## Local Development

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

---

## What's included

- event planning and blueprint generation
- AI generation via Anthropic
- Volunteer Engine for organizers, micro-shifts, invitations and attendance
- optional Firebase Firestore mirror for recruiting data
- Supabase-backed operational workflows
- share links and event collaboration

## Project Structure

```text
app/
  api/volunteer-engine/        → public Volunteer Engine APIs
  api/admin/volunteer-engine/  → admin Volunteer Engine APIs
  api/health/firebase/         → Firebase connectivity check
lib/
  supabase.ts                  → Supabase client
  supabase-server.ts           → server Supabase helpers
  firebase-firestore.ts        → server-only Firestore REST client
  firebase-volunteer-mirror.ts → Volunteer Engine Firestore mirror
supabase/
  migrations/                  → operational database migrations
docs/
  FIREBASE_VOLUNTEER_ENGINE.md → Firebase rollout notes
```
