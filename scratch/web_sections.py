with open(r"d:\samsons final\templates\web.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find key structural sections
for idx, line in enumerate(lines):
    stripped = line.strip()
    if any(keyword in stripped.lower() for keyword in ["section", "<main", "</main", "best-seller", "sale", "new-product", "slider", "banner"]):
        print(f"Line {idx+1}: {stripped[:120]}")
