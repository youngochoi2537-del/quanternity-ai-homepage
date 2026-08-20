import urllib.request

def check_url(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content_type = resp.headers.get('Content-Type')
            body = resp.read().decode('utf-8')
            print(f"URL: {url}")
            print(f"Status: {status}")
            print(f"Content-Type: {content_type}")
            print(f"Content Length: {len(body)} chars")
            print("--- Head of Content ---")
            print("\n".join(body.splitlines()[:10]))
            print("-----------------------")
            return status, content_type
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None, None

print("=== VERIFYING LIVE ROBOTS.TXT & SITEMAP.XML ===")
check_url("https://quanternity.kr/robots.txt")
print("\n")
check_url("https://quanternity.kr/sitemap.xml")
