import os

workspace_dir = r"d:\samsons final"
corrupted_files = []

for root, dirs, files in os.walk(workspace_dir):
    if ".venv" in root or ".qodo" in root or "__pycache__" in root or "flask_session" in root:
        continue
    for file in files:
        if file.endswith((".html", ".css", ".py")):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                # Check for actual double backslash-n (escaped newline text)
                if '\\n' in content:
                    print(f"Contains literal backslash-n: {filepath}")
                    corrupted_files.append((filepath, "literal_escapes"))
                if content.strip().startswith('"') and content.strip().endswith('"') and len(content.strip()) < 1000:
                    print(f"Entire file is a quoted string: {filepath}")
                    corrupted_files.append((filepath, "string_only"))
            except Exception as e:
                print(f"Error reading {filepath}: {e}")

print("Done scanning!")
print(f"Corrupted files found: {corrupted_files}")
