-- Create chats table
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id),
  title text default 'New Chat',
  mode text default 'normal' check (mode in ('normal', 'confidente', 'practice_call')),
  is_encrypted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Users can only access their own chats
create policy "chats_select_own"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "chats_insert_own"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "chats_update_own"
  on public.chats for update
  using (auth.uid() = user_id);

create policy "chats_delete_own"
  on public.chats for delete
  using (auth.uid() = user_id);

-- Users can only access messages from their own chats
create policy "messages_select_own"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "messages_insert_own"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );
