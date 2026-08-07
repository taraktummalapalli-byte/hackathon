# 🛡️ CodeGuard AI — AI-Powered Security Auditor for "Vibe-Coded" Apps

> **Theme Alignment:** AI Security, Privacy & Trust — Identifying security risks in AI-assisted rapid application development, catching exposed secrets, and building trust in modern AI workflows.

---

## 📌 Problem Statement

AI coding assistants have made it fast to build full applications, but this speed often comes at the cost of security review. Developers using "vibe coding" workflows frequently ship exposed API keys, missing input validation, and unauthenticated endpoints without realizing it. **CodeGuard AI** addresses this by automatically auditing a codebase — via GitHub link or file upload — and returning a clear, actionable security report with plain-English fixes and visual risk ratings.

---

## ✨ Key Features

- **Dual Input Modes:** Audit any public GitHub repository URL or upload a compressed `.zip` codebase archive.
- **Smart File Filtering:** Intelligently extracts security-relevant files (`routes/`, `controllers/`, `.env*`, `config/`, API clients) while capping token usage.
- **Structured AI Vulnerability Engine:** Powered by Google Gemini API to analyze OWASP risks including hardcoded secrets, XSS, SQL injection, missing input validation, missing authentication, and misconfigurations.
- **Isolated AI Provider Layer:** Abstracted in `services/ai.service.js` — easily swap Gemini for OpenAI or Anthropic with a single file modification.
- **Interactive Security Dashboard:** Visualize vulnerability metrics using Recharts (Risk Score Gauge, Severity Pie Chart, Category Bar Chart, and Score Trends over time).
- **Actionable Fix Suggestions:** Provides precise line numbers, risk explanations, and copyable code remedies for every issue found.

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v7, Tailwind CSS, Axios, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT Authentication, bcryptjs, Zod validation |
| **Database** | Supabase (Postgres) via `@supabase/supabase-js` (service role key, backend-only) |
| **AI Engine** | Google Gemini API (`@google/generative-ai`) with defensive JSON parsing & fallback heuristics |
| **Parsing** | `adm-zip` for Zip archive extraction, `multer` memory storage, GitHub REST API |

---

## 🗄️ Database Schema (Supabase / Postgres)

Run the following SQL in your Supabase SQL Editor (`backend/schema.sql`):

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  source_type text not null check (source_type in ('github', 'upload')),
  source_label text not null,
  risk_score int not null,
  issue_count int not null default 0,
  status text not null default 'completed',
  created_at timestamptz default now()
);

create table scan_issues (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(id) on delete cascade,
  file_path text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  category text not null,
  description text not null,
  fix_suggestion text not null,
  line_reference text
);

create index idx_scans_user on scans(user_id, created_at desc);
create index idx_issues_scan on scan_issues(scan_id);

-- Disable RLS for service role key access
alter table users disable row level security;
alter table scans disable row level security;
alter table scan_issues disable row level security;
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/`:
```env
PORT=5000
JWT_SECRET=your-32-byte-secret-jwt-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-google-gemini-api-key
```

Start backend dev server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend dev server:
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 📡 API Specification

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | No | Creates new account & returns JWT |
| `/api/auth/login` | `POST` | No | Authenticates user & returns JWT |
| `/api/scan/github` | `POST` | Yes | Scans public GitHub repo URL |
| `/api/scan/upload` | `POST` | Yes | Scans uploaded `.zip` code archive |
| `/api/scan/:id` | `GET` | Yes | Retrieves full report for single scan |
| `/api/scan` | `GET` | Yes | Lists past scan history |
| `/api/dashboard/summary` | `GET` | Yes | Returns metrics for charts |

---

## 🧪 Testing Sample Vulnerability Codebase

To test CodeGuard AI against common vibe-coded vulnerabilities:
1. Register/Login on the CodeGuard AI dashboard.
2. Click **New Audit** -> enter `https://github.com/expressjs/express` or upload a zip file with an unvalidated endpoint or hardcoded key.
3. CodeGuard AI will run the scan, flag vulnerabilities with severity rankings, and provide actionable fixes.
