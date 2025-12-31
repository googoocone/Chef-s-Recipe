-- Create recipe_likes table
create table recipe_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, recipe_id)
);

-- Enable RLS
alter table recipe_likes enable row level security;

-- Policies
create policy "Public read likes" on recipe_likes for select using (true);

create policy "Authenticated users can toggle like" on recipe_likes for insert 
with check (auth.uid() = user_id);

create policy "Authenticated users can remove like" on recipe_likes for delete 
using (auth.uid() = user_id);
