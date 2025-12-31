import os
import sys
import json
import time
import argparse
import urllib.parse
from dotenv import load_dotenv
from supabase import create_client, Client
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
import yt_dlp

# Load environment variables
load_dotenv('.env.local')

# Setup Supabase
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    print("❌ Error: Missing environment variables. Check .env.local")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-pro')

def get_channel_videos(channel_url, limit=10):
    print(f"🔍 Fetching videos from {channel_url} (Limit: {limit})...")
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'playlistend': limit,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(channel_url, download=False)
        if 'entries' in info:
            return info['entries']
        return []

def get_transcript(video_id):
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['ko'])
        return ' '.join([item['text'] for item in transcript_list])
    except Exception:
        # Try finding auto-generated korean or fallback
        try:
             transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['ko-KR', 'en'])
             return ' '.join([item['text'] for item in transcript_list])
        except Exception as e:
            # print(f"    ⚠️ No transcript found: {e}")
            return None

def extract_recipe_with_ai(transcript_text, title):
    prompt = f"""
    You are a professional chef data assistant.
    Analyze the following YouTube video transcript for a video titled "{title}" and extract the recipe information into a structured JSON format.

    Transcript:
    "{transcript_text[:15000]}"

    Please output ONLY valid JSON (no markdown code blocks) with the following structure:
    {{
        "title": "Recipe Title (Korean, refined for clarity)",
        "description": "Short description of the dish",
        "ingredients": [
            {{ "name": "Ingredient Name", "amount": "Amount string" }}
        ],
        "steps": [
            {{ "order": 1, "description": "Step 1 description" }}
        ],
        "time": "Est. cooking time (e.g. 15분)",
        "calories": 0 (Estimate numeric value, if unsure put 500),
        "nutrition": {{
            "calories": 0,
            "protein": "0g",
            "fat": "0g",
            "carbs": "0g"
        }},
        "is_recipe": true
    }}
    
    IMPORTANT:
    1. If the content is NOT a cooking recipe (e.g. mukbang, vlog without recipe, simple review), set "is_recipe": false.
    2. Translate everything to Korean.
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        if isinstance(data, list):
            data = data[0] if data else None
        return data
    except Exception as e:
        print(f"    ❌ AI Parsing Error: {e}")
        return None


def download_audio(video_id):
    """Downloads audio from YouTube video as mp3, returns file path."""
    try:
        url = f"https://www.youtube.com/watch?v={video_id}"
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '128',
            }],
            'outtmpl': f'temp_{video_id}.%(ext)s',
            'quiet': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        return f"temp_{video_id}.mp3"
    except Exception as e:
        print(f"    ❌ Audio Download Error: {e}")
        return None

def extract_recipe_from_audio(audio_path, title):
    """Uploads audio to Gemini and extracts recipe."""
    try:
        # 1. Upload File
        audio_file = genai.upload_file(path=audio_path)
        
        # Wait for processing (usually instant for small files)
        while audio_file.state.name == "PROCESSING":
            time.sleep(1)
            audio_file = genai.get_file(audio_file.name)

        if audio_file.state.name == "FAILED":
            raise ValueError("Audio processing failed on Gemini side.")

        # 2. Generate Content
        prompt = f"""
        You are a professional chef data assistant.
        Listen to the provided audio from a cooking video titled "{title}".
        Extract the recipe information into a structured JSON format.

        Please output ONLY valid JSON (no markdown code blocks) with the following structure:
        {{
            "title": "Recipe Title (Korean, refined for clarity)",
            "description": "Short description of the dish",
            "ingredients": [
                {{ "name": "Ingredient Name", "amount": "Amount string" }}
            ],
            "steps": [
                {{ "order": 1, "description": "Step 1 description" }}
            ],
            "time": "Est. cooking time (e.g. 15분)",
            "calories": 0 (Estimate numeric value, if unsure put 500),
            "nutrition": {{
                "calories": 0,
                "protein": "0g",
                "fat": "0g",
                "carbs": "0g"
            }},
            "is_recipe": true
        }}
        
        IMPORTANT:
        1. If it's NOT a recipe (e.g. mukbang, vlog), set "is_recipe": false.
        2. Translate everything to Korean.
        """

        response = model.generate_content([audio_file, prompt])
        
        # Cleanup remote file
        genai.delete_file(audio_file.name)

        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        if isinstance(data, list):
            data = data[0] if data else None
        return data

    except Exception as e:
        print(f"    ❌ AI Audio Parsing Error: {e}")
        return None


def get_chefs():
    try:
        res = supabase.table('chefs').select('id, name').execute()
        return res.data
    except Exception as e:
        print(f"❌ Failed to fetch chefs: {e}")
        return []

def main():
    parser = argparse.ArgumentParser(description='Crawl YouTube Channel for Recipes')
    parser.add_argument('url', nargs='?', help='YouTube Channel URL')
    parser.add_argument('--chef-id', help='UUID of the Chef to assign recipes to')
    parser.add_argument('--limit', type=int, default=100, help='Number of videos to check')
    
    args = parser.parse_args()

    # Interactive Mode
    channel_url = args.url
    chef_id = args.chef_id
    limit = args.limit

    print("\n🧑‍🍳 Anti Gravity Recipe Crawler 🕷️\n")

    # 1. Select Chef
    if not chef_id:
        chefs = get_chefs()
        if not chefs:
            print("❌ No chefs found in DB. Please seed data first.")
            return
        
        print("Available Chefs:")
        for idx, chef in enumerate(chefs):
            print(f"[{idx+1}] {chef['name']}")
        
        while True:
            try:
                selection = input(f"\nSelect Chef (1-{len(chefs)}) or enter UUID: ").strip()
                if not selection: continue
                
                if len(selection) > 30: # Assume UUID
                    chef_id = selection
                    break
                
                idx = int(selection) - 1
                if 0 <= idx < len(chefs):
                    chef_id = chefs[idx]['id']
                    print(f"✅ Selected: {chefs[idx]['name']}")
                    break
                else:
                    print("❌ Invalid selection.")
            except ValueError:
                print("❌ Invalid input.")

    # 2. Input URL
    if not channel_url:
        while True:
            channel_url = input("\nEnter Channel/Shorts URL (e.g. @paik_boy/shorts): ").strip()
            if channel_url: break

    # 3. Input Limit (Optional loop, skipping simplicity)
    
    print(f"\n🚀 Starting Crawl for {channel_url}...")
    
    # 4. Get Videos
    videos = get_channel_videos(channel_url, limit)
    print(f"📋 Found {len(videos)} videos. Processing...")

    success_count = 0
    skip_count = 0
    fail_count = 0

    for video in videos:
        video_id = video['id']
        title = video['title']
        video_url = f"https://www.youtube.com/watch?v={video_id}"

        print(f"\n🎬 Processing: {title} ({video_id})")

        # Check DB Duplicates (Partial match for ID to catch both watch?v= and /shorts/)
        existing = supabase.table('recipes').select('id').ilike('video_url', f'%{video_id}%').execute()
        if existing.data:
            print("    ⏭️ Already exists. Skipping.")
            skip_count += 1
            continue

        # Get Transcript
        transcript = get_transcript(video_id)
        
        recipe_data = None
        
        if transcript:
            print("    🧠 Analyzing Text with AI...")
            recipe_data = extract_recipe_with_ai(transcript, title)
        else:
            print("    🎧 No transcript. Switching to Audio Mode...")
            audio_path = download_audio(video_id)
            if audio_path:
                print("    🧠 Analyzing Audio with AI (Listening)...")
                recipe_data = extract_recipe_from_audio(audio_path, title)
                # Cleanup
                try:
                    os.remove(audio_path)
                except:
                    pass
            else:
                print("    ❌ Failed to download audio. Skipping.")
                fail_count += 1
                continue

        if not recipe_data or not recipe_data.get('is_recipe'):
            print("    ⚠️ Not a recipe. Skipping.")
            fail_count += 1
            continue

        # Insert into DB
        try:
            # Insert Recipe
            recipe_payload = {
                'title': recipe_data['title'],
                'chef_id': chef_id,
                'image_url': f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
                'time': recipe_data['time'],
                'calories': recipe_data['calories'],
                'protein': recipe_data['nutrition']['protein'],
                'fat': recipe_data['nutrition']['fat'],
                'carbs': recipe_data['nutrition']['carbs'],
                'is_recommended': False,
                'video_url': video_url
            }
            res_recipe = supabase.table('recipes').insert(recipe_payload).execute()
            new_recipe_id = res_recipe.data[0]['id']

            # Insert Ingredients
            if recipe_data['ingredients']:
                ing_payload = [
                    {
                        'recipe_id': new_recipe_id, 
                        'name': ing['name'], 
                        'amount': ing['amount'],
                        'purchase_link': f"https://www.coupang.com/np/search?component=&q={urllib.parse.quote(ing['name'])}&channel=user"
                    } 
                    for ing in recipe_data['ingredients']
                ]
                supabase.table('ingredients').insert(ing_payload).execute()

            # Insert Steps
            if recipe_data['steps']:
                step_payload = [
                    {
                        'recipe_id': new_recipe_id,
                        'step_order': step['order'],
                        'description': step['description']
                    }
                    for step in recipe_data['steps']
                ]
                supabase.table('steps').insert(step_payload).execute()

            print(f"    ✅ Saved! (ID: {new_recipe_id})")
            success_count += 1

        except Exception as e:
            print(f"    ❌ Save Error: {e}")
            fail_count += 1

        # Rate limiting
        time.sleep(1)

    print("\n" + "="*50)
    print(f"🎉 Finished!")
    print(f"Success: {success_count} | Skipped: {skip_count} | Failed: {fail_count}")
    print("="*50)

if __name__ == "__main__":
    main()
