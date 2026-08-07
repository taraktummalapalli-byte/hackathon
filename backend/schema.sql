-- CodeGuard AI Supabase / Postgres Database Schema
-- Execute this script in your Supabase SQL Editor

-- 1. Create users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- 2. Create scans table
create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  source_type text not null check (source_type in ('github', 'upload')),
  source_label text not null, -- repo URL or filename
  risk_score int not null,     -- 0-100, 100 = most severe
  issue_count int not null default 0,
  status text not null default 'completed', -- pending | completed | failed
  created_at timestamptz default now()
);

-- 3. Create scan_issues table
create table if not exists scan_issues (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(id) on delete cascade,
  file_path text not null,
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  category text not null, -- e.g. "exposed_secret", "missing_validation", "missing_auth", "xss_risk", "sql_injection_risk", "insecure_config"
  description text not null,
  fix_suggestion text not null,
  line_reference text
);

-- 4. Create performance indexes
create index if not exists idx_scans_user on scans(user_id, created_at desc);
create index if not exists idx_issues_scan on scan_issues(scan_id);

-- Note: RLS should be disabled on these tables as backend accesses via Supabase service role key directly.
alter table users disable row level security;
alter table scans disable row level security;
alter table scan_issues disable row level security;
