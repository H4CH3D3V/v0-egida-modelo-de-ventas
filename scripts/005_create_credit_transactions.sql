-- Create credit transactions table for tracking credit usage
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  transaction_type text not null check (transaction_type in (
    'message',
    'image_generation',
    'video_generation',
    'file_upload',
    'purchase',
    'admin_grant'
  )),
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.credit_transactions enable row level security;

-- Users can view their own transactions
create policy "credit_transactions_select_own"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- System can insert transactions (handled by functions)
create policy "credit_transactions_insert_system"
  on public.credit_transactions for insert
  with check (auth.uid() = user_id);

-- Function to deduct credits
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_description text default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_profile public.profiles;
begin
  -- Get user profile
  select * into v_profile
  from public.profiles
  where id = p_user_id;

  -- Check if user has infinite credits
  if v_profile.has_infinite_credits then
    return true;
  end if;

  -- Check if user has enough credits
  if v_profile.credits < p_amount then
    return false;
  end if;

  -- Deduct credits
  update public.profiles
  set credits = credits - p_amount,
      updated_at = now()
  where id = p_user_id;

  -- Log transaction
  insert into public.credit_transactions (user_id, amount, transaction_type, description)
  values (p_user_id, -p_amount, p_transaction_type, p_description);

  return true;
end;
$$;
