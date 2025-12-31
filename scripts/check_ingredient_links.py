
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def main():
    # 1. Get Chef IDs
    print("Fetching Chef IDs...")
    chefs = supabase.table('chefs').select('id, name').execute()
    
    jung_id = None
    kang_id = None
    
    for c in chefs.data:
        if '정호영' in c['name']:
            jung_id = c['id']
            print(f"Jung: {c['id']}")
        elif '강레오' in c['name']:
            kang_id = c['id']
            print(f"Kang: {c['id']}")

    if not jung_id:
        print("Chef Jung not found")
        return

    # 2. Check Jung's Links (Sample)
    print("\n--- Chef Jung's Ingredient Links (Current) ---")
    jung_recipes = supabase.table('recipes').select('id').eq('chef_id', jung_id).limit(1).execute()
    if jung_recipes.data:
        rid = jung_recipes.data[0]['id']
        ings = supabase.table('ingredients').select('name, purchase_link').eq('recipe_id', rid).limit(3).execute()
        for i in ings.data:
            print(f"[{i['name']}] -> {i['purchase_link']}")

    # 3. Check Kang's Links (Reference)
    if kang_id:
        print("\n--- Chef Kang's Ingredient Links (Target Format) ---")
        kang_recipes = supabase.table('recipes').select('id').eq('chef_id', kang_id).limit(1).execute()
        if kang_recipes.data:
            rid = kang_recipes.data[0]['id']
            ings = supabase.table('ingredients').select('name, purchase_link').eq('recipe_id', rid).limit(3).execute()
            for i in ings.data:
                print(f"[{i['name']}] -> {i['purchase_link']}")

if __name__ == "__main__":
    main()
