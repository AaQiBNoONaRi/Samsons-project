with open(r"d:\samsons final\templates\admin\list.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "custom-perfume" in line or "custom_perfume" in line:
        print(f"Line {idx+1}: {line.strip()}")
        # print some context lines around it
        start = max(0, idx - 10)
        end = min(len(lines), idx + 15)
        print("--- CONTEXT ---")
        for j in range(start, end):
            print(f"  {j+1}: {lines[j].rstrip()}")
        print("---------------\n")
