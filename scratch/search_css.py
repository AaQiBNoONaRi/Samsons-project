with open(r"d:\samsons final\static\css\products.css", "r", encoding="utf-8") as f:
    content = f.read()

import re
# Find sections related to category-filters, sidebar, or filter-group
lines = content.splitlines()
for idx, line in enumerate(lines):
    if "category-filters" in line or "sidebar" in line or "filter-group" in line:
        print(f"Line {idx+1}: {line}")
        # print some context
        start = max(0, idx - 5)
        end = min(len(lines), idx + 10)
        print("--- CONTEXT ---")
        for j in range(start, end):
            print(f"  {j+1}: {lines[j]}")
        print("---------------\n")
