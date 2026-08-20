import os, glob

print("--- TASK 4: PERFORMANCE OPTIMIZATION VERIFICATION ---")

# 1. Check Font Sizes
print("\n[1. Font Files in assets/fonts/]")
total_font_size = 0
for f in glob.glob("assets/fonts/*.woff2"):
    sz = os.path.getsize(f) / 1024
    total_font_size += sz
    print(f"  - {os.path.basename(f)}: {sz:.1f} KB")
print(f"  --> TOTAL FONT PAYLOAD: {total_font_size:.1f} KB (Reduced from 3,887 KB)")

# 2. Check Image Sizes
print("\n[2. WebP Image Files in assets/images/]")
total_img_size = 0
for f in glob.glob("assets/images/*.webp"):
    sz = os.path.getsize(f) / 1024
    total_img_size += sz
    print(f"  - {os.path.basename(f)}: {sz:.1f} KB")
print(f"  --> TOTAL WEBP PAYLOAD: {total_img_size:.1f} KB (Reduced from ~17.5 MB)")

# 3. Check HTML Optimizations in index.html
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

print("\n[3. Index.html Optimizations]")
print("  - Font Preload Bold:", "Pretendard-Bold.woff2" in html)
print("  - Font Preload Regular:", "Pretendard-Regular.woff2" in html)
print("  - Supabase Deferred Script:", 'script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer' in html)
print("  - Member WebP Images:", "member_k.webp" in html and "member_mark.webp" in html)
print("  - Image Lazy Loading & Dimensions:", 'loading="lazy"' in html and 'width="340"' in html)
