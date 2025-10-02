-- Create companies table
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  logo_url text,
  created_at timestamptz default now()
);

-- Removed Consejo Estoico, only Newman remains
-- Insert default companies
insert into public.companies (name, slug, description) values
  ('Newman Bienes Raíces', 'newman', 'ASESORES INMOBILIARIOS')
on conflict (slug) do nothing;

-- Enable RLS
alter table public.companies enable row level security;

-- Allow everyone to read companies
create policy "companies_select_all"
  on public.companies for select
  using (true);
