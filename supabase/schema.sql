-- ============================================================
-- BeautyFlow Pro — Schema Supabase
-- Copiez-collez ce SQL dans : Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. TABLE PROFILES (liée à auth.users)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null default '',
  business_name text default '',
  business_type text default 'beauty', -- 'beauty' | 'barber'
  phone        text default '',
  city         text default '',
  slug         text unique,
  theme_id     text default 'beauty',
  created_at   timestamptz default now()
);

-- 2. TABLE CLIENTS
create table if not exists public.clients (
  id             uuid primary key default gen_random_uuid(),
  pro_id         uuid not null references public.profiles(id) on delete cascade,
  name           text not null,
  phone          text default '',
  email          text,
  notes          text,
  no_show_count  int default 0,
  created_at     timestamptz default now()
);

-- 3. TABLE SERVICES (prestations)
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  pro_id           uuid not null references public.profiles(id) on delete cascade,
  name             text not null,
  category         text default 'Général',
  duration_min     int not null default 30,
  price            numeric not null default 0,
  deposit_enabled  boolean default false,
  active           boolean default true,
  icon             text default '✨',
  created_at       timestamptz default now()
);

-- 4. TABLE APPOINTMENTS (rendez-vous)
create table if not exists public.appointments (
  id           uuid primary key default gen_random_uuid(),
  pro_id       uuid not null references public.profiles(id) on delete cascade,
  client_id    uuid references public.clients(id) on delete set null,
  client_name  text not null,
  service_id   uuid references public.services(id) on delete set null,
  service_name text default '',
  date         date not null,
  time         time not null,
  duration_min int default 30,
  price        numeric default 0,
  status       text default 'confirmed', -- confirmed | pending | cancelled | no_show | done
  notes        text,
  created_at   timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Chaque pro ne voit que ses propres données
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.clients      enable row level security;
alter table public.services     enable row level security;
alter table public.appointments enable row level security;

-- Suppression des policies existantes (idempotent)
drop policy if exists "profiles: lecture propre"    on public.profiles;
drop policy if exists "profiles: insertion propre"  on public.profiles;
drop policy if exists "profiles: mise à jour propre" on public.profiles;
drop policy if exists "clients: accès complet pro"       on public.clients;
drop policy if exists "services: accès complet pro"      on public.services;
drop policy if exists "appointments: accès complet pro"  on public.appointments;

-- Profiles
create policy "profiles: lecture propre" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: insertion propre" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: mise à jour propre" on public.profiles
  for update using (auth.uid() = id);

-- Clients
create policy "clients: accès complet pro" on public.clients
  for all using (auth.uid() = pro_id);

-- Services
create policy "services: accès complet pro" on public.services
  for all using (auth.uid() = pro_id);

-- Appointments
create policy "appointments: accès complet pro" on public.appointments
  for all using (auth.uid() = pro_id);

-- ============================================================
-- INDEX (performances)
-- ============================================================

create index if not exists idx_appointments_pro_date on public.appointments(pro_id, date);
create index if not exists idx_clients_pro on public.clients(pro_id);
create index if not exists idx_services_pro on public.services(pro_id);

-- ============================================================
-- TRIGGER : créer le profil automatiquement à l'inscription
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
