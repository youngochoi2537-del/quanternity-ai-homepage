import urllib.request
import re

url = "https://quanternity.kr/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

print("=== LIVE HOMEPAGE HTML VERIFICATION ===")
if "naver-site-verification" in html:
    print("[OK] FOUND naver-site-verification meta tag in live HTML!")
    
    head_match = re.search(r'<head>(.*?)</head>', html, re.DOTALL)
    if head_match:
        lines = head_match.group(1).splitlines()
        print("\n--- Live HTML <head> Snippet ---")
        for line in lines[:25]:
            print(line.encode('ascii', errors='backslashreplace').decode('ascii'))
        print("--------------------------------\n")
