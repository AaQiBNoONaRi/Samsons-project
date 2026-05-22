import os

templates_dir = r"d:\samsons final\templates"
for root, dirs, files in os.walk(templates_dir):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                if "header.html" in content or "footer.html" in content:
                    print(f"{file} includes header/footer")
