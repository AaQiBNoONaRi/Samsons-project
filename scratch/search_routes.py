import os

app_dir = r"d:\samsons final\app"
for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith(".py"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                lines = content.splitlines()
                for idx, line in enumerate(lines):
                    if "list.html" in line or "custom-perfume" in line or "/custom" in line or "/list" in line:
                        print(f"{file}:{idx+1}: {line.strip()}")
