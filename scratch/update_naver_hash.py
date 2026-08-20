import glob

old_hash = "61050f450fac10eec8b70799a3d4fe9992326db5"
new_hash = "c0521f7fab504ab73d5534aab72639841ef20d1c"

count = 0
for p in glob.glob("**/*.html", recursive=True):
    if "cms" in p or "scratch" in p:
        continue
    with open(p, "r", encoding="utf-8") as f:
        c = f.read()
    if old_hash in c:
        c = c.replace(old_hash, new_hash)
        with open(p, "w", encoding="utf-8") as f:
            f.write(c)
        print("Updated hash in:", p)
        count += 1
    elif new_hash in c:
        print("Already has new hash:", p)
    else:
        print("Old hash not found in:", p)

print(f"Completed updating hash in {count} HTML files.")
