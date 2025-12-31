-- Create recipe_saves table (Bookmark)
create table recipe_saves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, recipe_id)
);

-- Enable RLS
alter table recipe_saves enable row level security;

-- Policies
create policy "Public read saves" on recipe_saves for select using (true);

create policy "Authenticated users can toggle save" on recipe_saves for insert 
with check (auth.uid() = user_id);

create policy "Authenticated users can remove save" on recipe_saves for delete 
using (auth.uid() = user_id);
