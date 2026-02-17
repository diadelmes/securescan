-- ================================
-- SecureScan Database Schema
-- ================================

create extension if not exists "uuid-ossp";

-- Scan types
create type public.scan_type as enum ('url', 'ip', 'domain');
create type public.scan_status as enum ('pending', 'running', 'completed', 'failed');
create type public.threat_level as enum ('clean', 'low', 'medium', 'high', 'critical');

-- ================================
-- PROFILES
-- ================================
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  avatar_url text,
  scan_count integer default 0,
  created_at timestamptz default now()
);

-- ================================
-- SCANS
-- ================================
create table public.scans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  target text not null,           -- URL, IP veya domain
  scan_type scan_type not null,
  status scan_status default 'pending',
  threat_level threat_level,
  -- Results (JSON)
  virustotal_result jsonb,
  ip_info_result jsonb,
  ssl_result jsonb,
  whois_result jsonb,
  shodan_result jsonb,
  -- Summary
  summary text,
  malicious_count integer default 0,
  suspicious_count integer default 0,
  clean_count integer default 0,
  -- Meta
  duration_ms integer,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- ================================
-- RLS
-- ================================
alter table public.profiles enable row level security;
alter table public.scans enable row level security;

create policy "profiles_read_own" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (true);
create policy "profiles_update" on public.profiles for update using (true);

create policy "scans_read_own" on public.scans for select using (true);
create policy "scans_insert" on public.scans for insert with check (true);
create policy "scans_update" on public.scans for update using (true);

-- ================================
-- TRIGGERS
-- ================================
create or replace function increment_scan_count()
returns trigger as $$
begin
  if new.user_id is not null then
    update public.profiles set scan_count = scan_count + 1 where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_scan_insert after insert on public.scans
  for each row execute function increment_scan_count();

-- ================================
-- INDEXES
-- ================================
create index scans_user_id_idx on public.scans(user_id);
create index scans_target_idx on public.scans(target);
create index scans_created_at_idx on public.scans(created_at desc);
