
import os
import sys
import urllib.parse
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("Missing env vars")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def main():
    print("Finding Chef Jung Ho-young...")
    chef_res = supabase.table('chefs').select('id').ilike('name', '%정호영%').execute()
    
    if not chef_res.data:
        print("Chef not found")
        return
        
    jung_id = chef_res.data[0]['id']
    print(f"Chef ID: {jung_id}")

    # Get all recipes by this chef
    print("Fetching recipes...")
    recipes = supabase.table('recipes').select('id').eq('chef_id', jung_id).execute()
    recipe_ids = [r['id'] for r in recipes.data]
    print(f"Found {len(recipe_ids)} recipes.")

    if not recipe_ids:
        return

    # Get ingredients for these recipes
    # to avoid pulling too much, we can do it in batches or just one big query if not huge.
    # Supabase 'in' filter: .in_('recipe_id', recipe_ids)
    
    print("Fetching ingredients...")
    # Process in chunks of recipe IDs to be safe
    chunk_size = 20
    total_updated = 0
    
    for i in range(0, len(recipe_ids), chunk_size):
        chunk = recipe_ids[i:i+chunk_size]
        ings_res = supabase.table('ingredients').select('id, name').in_('recipe_id', chunk).execute()
        
        for ing in ings_res.data:
            name = ing['name']
            # Clean name if needed (remove quantity info if mixed in name? User data seems to have name separate from amount)
            # Assuming name is just "Chicken", "Soy Sauce", etc.
            
            encoded_name = urllib.parse.quote(name)
            search_link = f"https://www.coupang.com/np/search?component=&q={encoded_name}&channel=user"
            
            # Print sample
            # print(f"Updating {name} -> {search_link}")
            
            # Update
            supabase.table('ingredients').update({'purchase_link': search_link}).eq('id', ing['id']).execute()
            total_updated += 1
            
        print(f"Processed chunk {i//chunk_size + 1}, Updated {len(ings_res.data)} ingredients.")

    print(f"Done. Total updated: {total_updated}")

if __name__ == "__main__":
    main()
