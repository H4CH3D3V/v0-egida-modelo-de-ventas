-- Create leads table for CRM
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  assigned_to uuid references auth.users(id) on delete set null,
  name text not null,
  phone text,
  email text,
  city text,
  lada text,
  status text default 'sin_contactar' check (status in (
    'sin_contactar',
    'primera_llamada',
    'whatsapp_enviado',
    'cliente_zoom',
    'cliente_cerrado'
  )),
  zoom_date timestamptz,
  closed_date timestamptz,
  notes text,
  metadata jsonb default '{}'::jsonb,
  assigned_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create clients table (cartera de clientes)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id),
  name text not null,
  phone text,
  email text,
  city text,
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.leads enable row level security;
alter table public.clients enable row level security;

-- Users can view leads assigned to them or in their company
create policy "leads_select_own_or_company"
  on public.leads for select
  using (
    assigned_to = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.company_id = leads.company_id
      and p.role in ('admin', 'super_admin')
    )
  );

create policy "leads_update_own_or_admin"
  on public.leads for update
  using (
    assigned_to = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.company_id = leads.company_id
      and p.role in ('admin', 'super_admin')
    )
  );

-- Admins can insert leads
create policy "leads_insert_admin"
  on public.leads for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
    )
  );

-- Users can manage their own clients
create policy "clients_select_own"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "clients_insert_own"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "clients_update_own"
  on public.clients for update
  using (auth.uid() = user_id);

create policy "clients_delete_own"
  on public.clients for delete
  using (auth.uid() = user_id);
