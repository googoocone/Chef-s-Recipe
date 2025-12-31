
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def main():
    print("Finding Chef Jung Ho-young...")
    chef_res = supabase.table('chefs').select('id').ilike('name', '%정호영%').execute()
    
    if not chef_res.data:
        print("Chef not found")
        return
        
    jung_id = chef_res.data[0]['id']
    
    print("Checking specific ingredient...")
    # Get one recipe
    r_res = supabase.table('recipes').select('id').eq('chef_id', jung_id).limit(1).execute()
    if r_res.data:
        rid = r_res.data[0]['id']
        ings = supabase.table('ingredients').select('name, purchase_link').eq('recipe_id', rid).limit(5).execute()
        for i in ings.data:
            print(f"[{i['name']}] -> {i['purchase_link']}")

if __name__ == "__main__":
    main()
