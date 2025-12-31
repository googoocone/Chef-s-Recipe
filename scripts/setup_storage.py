import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("❌ Error: Missing environment variables. Check .env.local")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET_NAME = 'images'

def setup_storage():
    print(f"Setting up Supabase Storage Bucket: '{BUCKET_NAME}'...")
    
    try:
        # List existing buckets to see if it exists
        buckets = supabase.storage.list_buckets()
        existing = [b.name for b in buckets]
        
        if BUCKET_NAME in existing:
            print(f"    - Bucket '{BUCKET_NAME}' already exists.")
        else:
            # Create bucket
            res = supabase.storage.create_bucket(BUCKET_NAME, options={'public': True})
            print(f"    - Bucket '{BUCKET_NAME}' created successfully!")
            
    except Exception as e:
        print(f"    - Failed to create bucket: {e}")
        print("    (Note: You might need the Service Role Key for administrative tasks. If this fails, please create 'images' bucket manually in Dashboard.)")

if __name__ == "__main__":
    setup_storage()
