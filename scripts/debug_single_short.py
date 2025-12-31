
import requests

def check_video(video_id):
    url = f"https://www.youtube.com/shorts/{video_id}"
    print(f"Checking {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Try HEAD first
        print("\n--- HEAD Request ---")
        r = requests.head(url, headers=headers, allow_redirects=False)
        print(f"Status: {r.status_code}")
        print(f"Headers: {r.headers}")
        
        # Try GET with no redirects
        print("\n--- GET Request (No Redirects) ---")
        r = requests.get(url, headers=headers, allow_redirects=False)
        print(f"Status: {r.status_code}")
        
        # Try GET WITH redirects
        print("\n--- GET Request (With Redirects) ---")
        r = requests.get(url, headers=headers, allow_redirects=True)
        print(f"Final URL: {r.url}")
        print(f"Status: {r.status_code}")
        
        if '/shorts/' in r.url:
            print("Verdict: IT IS A SHORT (kept /shorts/ URL)")
        else:
            print("Verdict: NOT A SHORT (redirected)")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_video('rYhGipzmd20')
