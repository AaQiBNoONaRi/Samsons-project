import os

templates_dir = r"d:\samsons final\templates"
keywords = ["custom", "tester", "product", "shop", "perfume"]

for root, dirs, files in os.walk(templates_dir):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                found = []
                for kw in keywords:
                    if kw in content.lower():
                        found.append(kw)
                if found:
                    print(f"{file}: found keywords {found}")
                    # Let's search for specific hrefs or links
                    lines = content.splitlines()
                    for idx, line in enumerate(lines):
                        if any(term in line.lower() for term in ["/custom", "/tester", "custom-perfume", "custom_perfume", "custom-tester"]):
                            print(f"  Line {idx+1}: {line.strip()}")
