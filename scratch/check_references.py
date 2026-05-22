import os

ignore_dirs = {'.venv', '.qodo', 'flask_session', 'static'}

for root, dirs, files in os.walk('.'):
    # filter out ignore_dirs in-place to prevent os.walk from entering them
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for file in files:
        if file.endswith('.py') or file.endswith('.html'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                if 'editproduct.html' in content:
                    print(f"Found reference to 'editproduct.html' in {path}")
                if 'edit-product' in content:
                    print(f"Found reference to 'edit-product' in {path}")
            except Exception as e:
                pass
