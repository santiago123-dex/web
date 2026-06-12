-- ============================================
-- Vitrina — Database Schema (v2)
-- ============================================

-- 1. PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre_negocio text,
  descripcion text,
  telefono text,
  whatsapp text,
  instagram text,
  website text,
  horarios text,
  color_primario text default '#8b5cf6',
  color_secundario text default '#f0f0ff',
  logo_url text,
  cover_url text,
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
  visitas integer default 0,
  created_at timestamptz default now()
);

alter table public.catalogos enable row level security;

create policy "Anyone can view active catalogos"
  on catalogos for select
  using (activo = true);

create policy "Catalog owners can manage catalogos"
  on catalogos for all
  using (auth.uid() = user_id);

-- 3. CATEGORIAS
create table if not exists public.categorias (
  id uuid default gen_random_uuid() primary key,
  catalogo_id uuid references public.catalogos(id) on delete cascade not null,
  nombre text not null,
  descripcion text,
  icono text default '📦',
  orden integer default 0,
  created_at timestamptz default now()
);

alter table public.categorias enable row level security;

create policy "Anyone can view categorias"
  on categorias for select
  using (true);

create policy "Catalog owners can manage categorias"
  on categorias for all
  using (
    exists (
      select 1 from catalogos
      where catalogos.id = categorias.catalogo_id
      and catalogos.user_id = auth.uid()
    )
  );

-- 4. PRODUCTOS
create table if not exists public.productos (
  id uuid default gen_random_uuid() primary key,
  catalogo_id uuid references public.catalogos(id) on delete cascade not null,
  categoria_id uuid references public.categorias(id) on delete set null,
  nombre text not null,
  descripcion text,
  precio numeric(10,2) not null,
  imagen_url text,
  badge text check (badge in ('nuevo', 'oferta', 'agotado', null)),
  destacado boolean default false,
  disponible boolean default true,
  clicks integer default 0,
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

-- 5. TRACKING DE VISITAS
create table if not exists public.visitas (
  id uuid default gen_random_uuid() primary key,
  catalogo_id uuid references public.catalogos(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table public.visitas enable row level security;

create policy "Anyone can insert visitas"
  on visitas for insert
  with check (true);

create policy "Catalog owners can view visitas"
  on visitas for select
  using (
    exists (
      select 1 from catalogos
      where catalogos.id = visitas.catalogo_id
      and catalogos.user_id = auth.uid()
    )
  );

-- 6. AUTO-CREATE PROFILE ON SIGNUP
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

-- 7. STORAGE BUCKET
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
