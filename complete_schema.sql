-- COMPLETE SCHEMA ADJUSTMENT (Customers, Payments, Movements)

-- 1. Create CUSTOMERS table
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  phone text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create PAYMENTS table
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  customer_id uuid references public.customers(id) on delete cascade not null,
  amount numeric(10,2) not null check (amount > 0),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Update MOVEMENTS table
-- Add columns to track who bought and if it was on credit
alter table public.movements 
add column if not exists customer_id uuid references public.customers(id) on delete set null,
add column if not exists is_on_credit boolean default false,
add column if not exists unit_price numeric(10,2) default 0;

-- 4. Enable RLS
alter table public.customers enable row level security;
alter table public.payments enable row level security;

-- 5. RLS Policies

-- Customers
create policy "Users can view their own customers"
  on public.customers for select using (auth.uid() = user_id);

create policy "Users can insert their own customers"
  on public.customers for insert with check (auth.uid() = user_id);

create policy "Users can update their own customers"
  on public.customers for update using (auth.uid() = user_id);

create policy "Users can delete their own customers"
  on public.customers for delete using (auth.uid() = user_id);

-- Payments
create policy "Users can view their own payments"
  on public.payments for select using (auth.uid() = user_id);

create policy "Users can insert their own payments"
  on public.payments for insert with check (auth.uid() = user_id);

create policy "Users can update their own payments"
  on public.payments for update using (auth.uid() = user_id);

create policy "Users can delete their own payments"
  on public.payments for delete using (auth.uid() = user_id);

-- Re-apply Movement policies if needed (usually good to ensure)
-- (We assume existing policies on movements cover basic rights, but if column-based RLS is needed it would be here. Standard row-owner RLS is enough)
