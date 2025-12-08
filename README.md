# 🌿 Eunoia — A Campus-First Digital Mental Health Companion

**Live Deployment:** *(https://eunoia-prototype-7wycjuh04-satviks-projects-8dfddd80.vercel.app/admin)*

Eunoia is a modern mental-health support platform designed specifically for college students. It brings together validated self-assessments, mood tracking, counseling bookings, and a central resource hub — all wrapped in a calming, minimal, glass-morphism UI.

The goal is simple:

### **Make emotional well-being accessible, private, and stigma-free.**

This project was developed using an **AI-assisted engineering workflow**, where architectural decisions, refactoring steps, and UI design were guided through structured prompting and iteration.

---

# 🚀 Features

## 🧠 1. Validated Mental Health Assessments

* PHQ-9 for depression
* GAD-7 for anxiety
* Color-coded severity
* Configurable scoring
* Clean card-based interface

## 😊 2. Mood Logging

* Daily emotion check-ins
* Emoji/label selector
* Optional notes
* Recent mood history panel

## 📅 3. Counseling Session Booking

* Students can book sessions with name, email, reason & timeslot
* Shows in user history
* Admin can Confirm / Cancel / Delete

## 👤 4. Anonymous Identity System

No login required. Each user gets a **persistent anonymous ID** stored locally, enabling:

* Personalized history
* Saved assessments
* Saved moods

No personal data collection.

## 📊 5. Admin Dashboard

Includes:

* Severity distribution analytics
* Latest assessments
* Latest bookings
* CRUD controls:

  * Delete assessments
  * Delete moods
  * Update booking status
  * Remove test data

## 🧭 6. Resources & Peer Support

* Crisis links
* Campus support
* Guides for PHQ-9 & GAD-7
* Peer support placeholder section

---

# 🎨 UI & UX

Consistent design system using:

* Glassmorphism surfaces
* Dark gradient backgrounds
* Responsive grid layouts
* Clean typography
* Purple (PHQ-9) and Blue (GAD-7) accents

All UI refactored using Antigravity with **logic fully preserved**.

---

# 🛠️ Tech Stack

### Frontend

* Next.js 14 (App Router)
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* Prisma ORM
* SQLite (demo)
* PostgreSQL-ready schema

### Deployment

* Vercel

---

# 🏛️ Architecture Overview

```
┌───────────────────────┐
│        Frontend        │
│  Next.js + React UI    │
│  Assessments, Mood     │
│  Bookings, Admin       │
└───────────▲───────────┘
            │ REST API
            ▼
┌───────────────────────┐
│     Next.js API        │
│ Assessment / Booking   │
│ Mood / Admin Routes    │
└───────────▲───────────┘
            │ Prisma ORM
            ▼
┌───────────────────────┐
│       Database         │
│     SQLite (demo)      │
│ PostgreSQL (future)    │
└───────────────────────┘
```

---

# 📂 Project Structure

```
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
```

---

# ⚙️ Local Setup

### 1. Clone the Repo

```
git clone <your-repo-url>
cd eunoia
```

### 2. Install Dependencies

```
npm install
```

### 3. Create `.env`

```
DATABASE_URL="file:./prisma/dev.db"
```

### 4. Run Migrations

```
npx prisma migrate dev --name init
```

### 5. Start Dev Server

```
npm run dev
```

Runs at **[http://localhost:3000](http://localhost:3000)**.

---

# ☁️ Deployment (Vercel)

1. Push to GitHub
2. Import repo into Vercel
3. Add environment variable:

```
DATABASE_URL="file:./prisma/dev.db"
```

4. Deploy

For production, migrate to Supabase Postgres.

---

# 🔮 Future Roadmap

* Supabase migration
* Admin authentication
* Mood trend analytics
* Guided journaling
* Breathing exercises
* AI-based recommendations
* Peer support chat
* PWA mobile support
* Multi-language UI

---

# 📜 License

MIT (or specify another license)
