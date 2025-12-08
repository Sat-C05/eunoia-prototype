🌿 Eunoia — A Campus-First Digital Mental Health Companion

Live Deployment: Add your Vercel URL here

Eunoia is a modern mental-health support platform designed specifically for college students.
It brings together validated self-assessments, mood tracking, counseling bookings, and a central resource hub — all wrapped in a calming, minimal, glass-morphism UI.

The goal is simple:

Make emotional check-ins accessible, private, and stigma-free.

This project was developed using an AI-assisted engineering workflow, where the system architecture, design strategy, and major implementation steps were guided through structured prompting and iterative refinement.

🚀 Features
🧠 1. Validated Mental Health Assessments

PHQ-9 for depression severity

GAD-7 for anxiety severity

Color-coded results with recommendations

Fully configurable through a centralized config file

Smooth UX with card-based question flow

😊 2. Mood Logging

Quick daily mood check-ins

Emotion chip selector

Optional notes

Recent mood history panel

Designed to build emotional awareness over time

📅 3. Counseling Booking System

Students can book a counseling session

Stores name, email, timeslot, reason

Bookings visible in the history panel

Admin can:

Confirm

Cancel

Delete bookings

👤 4. Anonymous Student Identity

No login, no signup needed.
Each user gets a persistent anonymous ID locally — enabling:

Personal history

Saved assessments

Saved mood logs

without collecting personal information.

📊 5. Admin Dashboard

A dedicated /admin view with:

Severity distribution analytics

Latest assessments

Latest bookings

Mood trends (future)

Full CRUD controls:

Delete assessments

Delete mood logs

Update booking status

Remove invalid or test entries

🧭 6. Resources & Peer Support

Crisis support

Campus resources

Mini-guides for PHQ-9 & GAD-7

Peer support placeholder (future chat system)

All pages use consistent glass UI styling

🎨 UI & UX

The entire interface uses a unified design system:

Glassmorphism surfaces

Dark gradient background

Clean typography

Responsive layouts

Color-coded accents for each tool (PHQ-9 = purple, GAD-7 = blue)

Minimal animations and soft interactions

All UI was refactored using a controlled Antigravity workflow with logic preserved.

🛠️ Tech Stack
Frontend

Next.js 14 (App Router)

React

TypeScript

Tailwind CSS

Backend

Next.js API Routes

Prisma ORM

SQLite (dev/demo mode)

PostgreSQL-ready schema

Deployment

Vercel (unified serverless deployment)

🏛️ Architecture Overview
┌───────────────────────┐
│        Frontend        │
│  Next.js / React UI    │
│  Assessments, Mood     │
│  Bookings, Admin       │
└───────────▲───────────┘
            │ REST API
            ▼
┌───────────────────────┐
│     Next.js API        │
│  assessment/booking    │
│  mood/admin endpoints  │
└───────────▲───────────┘
            │ Prisma ORM
            ▼
┌───────────────────────┐
│       Database         │
│    SQLite (demo)       │
│  Postgres-ready (prod) │
└───────────────────────┘

📂 Project Structure
app/
  assessment/
  booking/
  mood/
  history/
  admin/
  resources/
  forum/
  layout.tsx
  page.tsx

components/
  AppShell.tsx
  NavBar.tsx
  NotificationProvider.tsx

lib/
  prisma.ts
  assessmentConfig.ts
  logger.ts

prisma/
  schema.prisma

⚙️ Local Setup
1. Clone the repo
git clone <your-repo-url>
cd eunoia

2. Install dependencies
npm install

3. Create .env
DATABASE_URL="file:./prisma/dev.db"

4. Run Prisma migration
npx prisma migrate dev --name init

5. Start the development server
npm run dev


App runs at http://localhost:3000
.

☁️ Deployment on Vercel

Push your project to GitHub

Import it into Vercel

Set environment variable:

DATABASE_URL="file:./prisma/dev.db"


Deploy

SQLite works fine for demos. For real production stability, switch to Supabase Postgres.

🔮 Future Roadmap

Supabase migration

Auth-protected admin portal

Mood trend analytics

Guided journaling

Breathing exercise module

AI-driven emotional insights

Peer support chat system

PWA support

Multi-language UI

📜 License

MIT (or any license you prefer)