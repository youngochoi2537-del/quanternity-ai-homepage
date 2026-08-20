import glob

meta_block = """  <!-- 네이버 서치어드바이저 소유확인 — 삭제 금지 -->
  <meta name="naver-site-verification" content="61050f450fac10eec8b70799a3d4fe9992326db5" />
  <!-- TODO: Google Search Console 소유확인 메타태그 발급 시 추가 -->"""

count = 0
for p in glob.glob("**/*.html", recursive=True):
    if "cms" in p or "scratch" in p:
        continue
    with open(p, "r", encoding="utf-8") as f:
        c = f.read()
    if "naver-site-verification" not in c:
        c = c.replace(
            '<meta name="viewport" content="width=device-width, initial-scale=1" />',
            '<meta name="viewport" content="width=device-width, initial-scale=1" />\n' + meta_block
        )
        with open(p, "w", encoding="utf-8") as f:
            f.write(c)
        print("Updated:", p)
        count += 1
    else:
        print("Already contains tag:", p)

print(f"Completed updating {count} HTML files.")
