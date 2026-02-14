# Bookmark Management Application

A simple and secure bookmark management application where users can log in, add bookmarks, view them in real time, and remove them using soft deletion.

This project demonstrates clean frontend architecture, Supabase integration, authentication handling, and real-world CRUD patterns.

---

## Live Production URL

**Production URL:**  
https://smart-bookmark-app-amber.vercel.app

---

## Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Backend & Infrastructure

- Supabase
  - Authentication
  - PostgreSQL Database
  - Realtime Subscriptions

---

## Prerequisites

Before running the project, make sure you have:

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account
- Supabase Project URL
- Supabase Anon Public Key

Download Node.js from:  
https://nodejs.org/

---

## How to Clone and Run the Application

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/vivekreck/smart-bookmark-app
cd bookmark-dashboard
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a .env.local file in the root directory and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values inside your Supabase Project → Settings → API.

### 4️⃣ Run the Application

```bash
npm run dev
```

### The application will run at:

http://localhost:3000
