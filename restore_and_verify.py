import os
import shutil

backup_mapping = {
    r"d:\samsons final\admin\add_products.html": r"d:\samsons final\templates\admin\add_products.html",
    r"d:\samsons final\admin\editproduct.html": r"d:\samsons final\templates\admin\editproduct.html",
    r"d:\samsons final\admin\queries.html": r"d:\samsons final\templates\admin\queries.html",
    r"d:\samsons final\admin\orders.html": r"d:\samsons final\templates\admin\orders.html",
    r"d:\samsons final\Home Page\templates\tracking.html": r"d:\samsons final\templates\tracking.html"
}

print("Checking backups for literal escapes...")
for src, dst in backup_mapping.items():
    if not os.path.exists(src):
        print(f"Error: Backup source does not exist: {src}")
        continue
    with open(src, "r", encoding="utf-8") as f:
        content = f.read()
    if '\\n' in content:
        print(f"Warning: Backup source {src} contains literal backslash-n!")
    else:
        print(f"Backup source {src} is CLEAN.")

print("\nRestoring clean backups to active template locations...")
for src, dst in backup_mapping.items():
    if os.path.exists(src):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        print(f"Copied {src} -> {dst}")
    else:
        print(f"Skipped copy because source missing: {src}")

print("\nVerifying restored templates...")
for dst in backup_mapping.values():
    if os.path.exists(dst):
        with open(dst, "r", encoding="utf-8") as f:
            content = f.read()
        if '\\n' in content:
            print(f"Error: Restored file {dst} contains literal backslash-n!")
        else:
            print(f"Restored file {dst} is verified CLEAN.")
