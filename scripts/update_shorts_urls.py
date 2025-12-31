
import os
import sys
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
import time

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("Missing env vars")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def is_video_short(video_id):
    """
    Checks if a video ID is technically a Short by requesting the /shorts/ endpoint.
    YouTube redirects /shorts/ID to /watch?v=ID if it's NOT a short (usually).
    However, simple HTTP HEAD requests might get 303 See Other.
    Let's try requests.head/get.
    """
    url = f"https://www.youtube.com/shorts/{video_id}"
    try:
        # We need to act like a browser to avoid instant blocks, though HEAD might suffice.
        headers = {'User-Agent': 'Mozilla/5.0'}
        # Allow redirects=False to see the 303
        r = requests.head(url, headers=headers, allow_redirects=False, timeout=5)
        
        # If it returns 200, it's likely a short.
        # If it returns 303 (See Other) -> redirects to /watch -> Not a short.
        if r.status_code == 200:
            return True
        elif r.status_code == 303:
            return False
        else:
            # Fallback: check history if redirects=True (default behavior mimic)
            # But allow_redirects=False is safer for logic.
            # Some report that valid shorts allow /shorts/ access.
            return False 
    except Exception as e:
        print(f"Error checking {video_id}: {e}")
        return False

def main():
    print("Fetching recipes...")
    # Fetch all recipes that contain 'youtube.com/watch' (candidates for update)
    # Limiting to Chef Jung Ho-young for speed if possible, or just all.
    # Let's do all, but process in chunks if needed.
    
    chef_res = supabase.table('chefs').select('id').ilike('name', '%강레오%').execute()
    if not chef_res.data:
        print("Chef Kang not found")
        return
        
    jung_id = chef_res.data[0]['id']
    print(f"Targeting Chef Kang Leo ({jung_id})")

    recipes = supabase.table('recipes').select('id, video_url').eq('chef_id', jung_id).execute()
    
    count = 0
    updated = 0
    
    for r in recipes.data:
        url = r['video_url']
        if '/shorts/' in url:
            continue
            
        # Extract ID
        # standard: https://www.youtube.com/watch?v=ID
        if 'v=' in url:
            vid_id = url.split('v=')[1].split('&')[0]
        elif 'youtu.be/' in url:
            vid_id = url.split('youtu.be/')[1].split('?')[0]
        else:
            continue
            
        print(f"Checking {vid_id} ... ", end='', flush=True)
        if is_video_short(vid_id):
            print("IS SHORT! Updating...")
            new_url = f"https://www.youtube.com/shorts/{vid_id}"
            
            supabase.table('recipes').update({'video_url': new_url}).eq('id', r['id']).execute()
            updated += 1
        else:
            print("Not short.")
            
        count += 1
        time.sleep(0.5) # Slight delay
        
    print(f"Done. Scanned {count}. Updated {updated}.")

if __name__ == "__main__":
    main()
