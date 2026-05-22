with open(r"d:\samsons final\templates\web.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "header.html" in line or "footer.html" in line:
        print(f"Line {idx+1}: {line.strip()}")
