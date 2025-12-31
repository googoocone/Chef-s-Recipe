-- 1. Chefs Table
create table chefs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Recipes Table
create table recipes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  chef_id uuid references chefs(id) on delete cascade not null,
  image_url text not null,
  time text not null, -- e.g. "45 min"
  calories integer not null,
  protein text,
  fat text,
  carbs text,
  is_recommended boolean default false,
  video_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Ingredients Table
create table ingredients (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references recipes(id) on delete cascade not null,
  name text not null,
  amount text not null,
  purchase_link text not null
);

-- 4. Steps Table
create table steps (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references recipes(id) on delete cascade not null,
  step_order integer not null,
  description text not null
);

-- Enable RLS (Row Level Security) - Optional but recommended
alter table chefs enable row level security;
alter table recipes enable row level security;
alter table ingredients enable row level security;
alter table steps enable row level security;

-- Policy: Allow read access to everyone
create policy "Allow public read access" on chefs for select using (true);
create policy "Allow public read access" on recipes for select using (true);
create policy "Allow public read access" on ingredients for select using (true);
create policy "Allow public read access" on steps for select using (true);

-- Policy: Allow insert access to everyone (For seeding only, remove later in production!)
create policy "Allow public insert access" on chefs for insert with check (true);
create policy "Allow public insert access" on recipes for insert with check (true);
create policy "Allow public insert access" on ingredients for insert with check (true);
create policy "Allow public insert access" on steps for insert with check (true);
