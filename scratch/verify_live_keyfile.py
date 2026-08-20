import urllib.request

key = "4a5e6f8b9c0d1e2f3a4b5c6d7e8f9a0b"
url = f"https://quanternity.kr/{key}.txt"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        status = resp.status
        content_type = resp.headers.get('Content-Type')
        body = resp.read().decode('utf-8').strip()
        
        print("=== LIVE INDEXNOW KEY FILE VERIFICATION ===")
        print(f"URL: {url}")
        print(f"Status: {status}")
        print(f"Content-Type: {content_type}")
        print(f"File Body Content: {body}")
        
        if status == 200 and body == key:
            print("[OK] IndexNow Key File returns HTTP 200 OK and matches key content perfectly!")
        else:
            print("[FAIL] Mismatch or bad status!")
except Exception as e:
    print(f"Error fetching key file: {e}")
