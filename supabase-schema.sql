-- ============================================
-- Vitrina — Database Schema
-- ============================================

-- 1. PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre_negocio text,
  descripcion text,
  telefono text,
  whatsapp text,
  instagram text,
  color_primario text default '#8b5cf6',
  logo_url text,
  subdominio text unique,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- 2. CATALOGOS
create table if not exists public.catalogos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nombre text not null,
  descripcion text,
  slug text unique not null,
  activo boolean default true,
  created_at timestamptz default now()
);

alter table public.catalogos enable row level security;

create policy "Anyone can view active catalogos"
  on catalogos for select
  using (activo = true);

create policy "Users can insert own catalogos"
  on catalogos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own catalogos"
  on catalogos for update
  using (auth.uid() = user_id);

create policy "Users can delete own catalogos"
  on catalogos for delete
  using (auth.uid() = user_id);

-- 3. PRODUCTOS
create table if not exists public.productos (
  id uuid default gen_random_uuid() primary key,
  catalogo_id uuid references public.catalogos(id) on delete cascade not null,
  nombre text not null,
  descripcion text,
  precio numeric(10,2) not null,
  imagen_url text,
  disponible boolean default true,
  orden integer default 0,
  created_at timestamptz default now()
);

alter table public.productos enable row level security;

create policy "Anyone can view available productos"
  on productos for select
  using (disponible = true);

create policy "Catalog owners can manage productos"
  on productos for all
  using (
    exists (
      select 1 from catalogos
      where catalogos.id = productos.catalogo_id
      and catalogos.user_id = auth.uid()
    )
  );

-- 4. AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre_negocio)
  values (new.id, 'Mi negocio');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. STORAGE BUCKET
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'productos');

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'productos'
    and auth.role() = 'authenticated'
  );
