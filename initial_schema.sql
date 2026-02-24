-- 1. Create PRODUCTS table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  category text,
  price numeric(10,2) default 0,
  cost numeric(10,2) default 0,
  min_stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create VARIATIONS table
create table if not exists public.variations (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  name text not null, -- e.g., "50ml", "Red"
  stock_quantity integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create MOVEMENTS table
create table if not exists public.movements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  variation_id uuid references public.variations(id) on delete cascade not null,
  type text not null check (type in ('ENTRY', 'EXIT')),
  quantity integer not null check (quantity > 0),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS
alter table public.products enable row level security;
alter table public.variations enable row level security;
alter table public.movements enable row level security;

-- 5. Helper function for RLS (optional but good for variations/movements to check product ownership)
-- For simplicity, we assume user_id is present on all tables or we check against auth.uid() directly where user_id exists.

-- PRODUCTS Policies
create policy "Users can view their own products"
  on public.products for select using (auth.uid() = user_id);

create policy "Users can insert their own products"
  on public.products for insert with check (auth.uid() = user_id);

create policy "Users can update their own products"
  on public.products for update using (auth.uid() = user_id);

create policy "Users can delete their own products"
  on public.products for delete using (auth.uid() = user_id);

-- VARIATIONS Policies (using product ownership via join would be Safer, but typically variations don't have user_id, they rely on product. 
-- Wait, if variations table doesn't have user_id, RLS needs to join products.
-- Let's check if I added user_id to variations. I did NOT. 
-- So RLS for variations must check product's user_id.

create policy "Users can view variations of their products"
  on public.variations for select
  using ( exists ( select 1 from public.products p where p.id = variations.product_id and p.user_id = auth.uid() ) );

create policy "Users can insert variations for their products"
  on public.variations for insert
  with check ( exists ( select 1 from public.products p where p.id = variations.product_id and p.user_id = auth.uid() ) );

create policy "Users can update variations of their products"
  on public.variations for update
  using ( exists ( select 1 from public.products p where p.id = variations.product_id and p.user_id = auth.uid() ) );

create policy "Users can delete variations of their products"
  on public.variations for delete
  using ( exists ( select 1 from public.products p where p.id = variations.product_id and p.user_id = auth.uid() ) );

-- MOVEMENTS Policies
create policy "Users can view their own movements"
  on public.movements for select using (auth.uid() = user_id);

create policy "Users can insert their own movements"
  on public.movements for insert with check (auth.uid() = user_id);

create policy "Users can update their own movements"
  on public.movements for update using (auth.uid() = user_id);

create policy "Users can delete their own movements"
  on public.movements for delete using (auth.uid() = user_id);
