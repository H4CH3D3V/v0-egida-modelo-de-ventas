-- Create telegram logs table for tracking notifications
create table if not exists public.telegram_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  message_type text not null check (message_type in (
    'new_user',
    'progress_update',
    'company_request'
  )),
  message_content text not null,
  sent_successfully boolean default false,
  error_message text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.telegram_logs enable row level security;

-- Only super admins can view logs
create policy "telegram_logs_select_super_admin"
  on public.telegram_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role = 'super_admin'
    )
  );
