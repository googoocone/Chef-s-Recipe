
import os
import sys
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
    # 1. Find Chef '정호영'
    print("Searching for Chef 정호영...")
    res = supabase.table('chefs').select('*').ilike('name', '%정호영%').execute()
    
    if not res.data:
        print("Chef not found.")
        return

    chef = res.data[0]
    print(f"Found Chef: {chef['name']} ({chef['id']})")

    # 2. Get Recipes
    print("\nFetching Recipes...")
    recipes = supabase.table('recipes').select('title, time, video_url').eq('chef_id', chef['id']).execute()

    for r in recipes.data:
        print(f"Title: {r['title']}")
        print(f"Time: {r['time']}")
        print(f"URL: {r['video_url']}")
        
        # Test Heuristic
        is_shorts_url = '/shorts/' in r['video_url']
        is_shorts_title = '#shorts' in r.get('title', '').lower()
        is_shorts_time = '초' in r.get('time', '') or 'sec' in r.get('time', '').lower()
        
        print(f"-> Detection: URL={is_shorts_url}, Title={is_shorts_title}, Time={is_shorts_time}")
        print("-" * 20)

if __name__ == "__main__":
    main()
