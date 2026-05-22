with open(r"d:\samsons final\templates\web.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if any(word in line.lower() for word in ["custom", "tester", "build", "create", "design"]):
        print(f"Line {idx+1}: {line.strip()}")
