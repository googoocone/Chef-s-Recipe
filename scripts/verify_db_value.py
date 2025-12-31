
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def main():
    # Check ID rYhGipzmd20
    print("Checking recipe rYhGipzmd20 in DB...")
    
    # We need to find the recipe with this video URL or ID.
    # Note: the ID provided in logs `rYhGipzmd20` is the YOUTUBE ID.
    # The DB 'id' is a UUID.
    # We must search by video_url containing this ID.
    
    res = supabase.table('recipes').select('id, title, video_url').ilike('video_url', '%rYhGipzmd20%').execute()
    
    if not res.data:
        print("Recipe not found by video ID match.")
    else:
        for r in res.data:
            print(f"Title: {r['title']}")
            print(f"URL: {r['video_url']}")

if __name__ == "__main__":
    main()
