# rafaylang.py
import sys

def run(code):
    lines = code.split("\n")
    variables = {}

    for line in lines:
        line = line.strip()
        if not line:  # skip empty lines
            continue

        if line.startswith("say "):
            message = line[4:].strip().strip('"')
            print(message)

        elif line.startswith("let "):
            parts = line.split("=")
            var_name = parts[0].replace("let", "").strip()
            value = int(parts[1].strip())
            variables[var_name] = value

        elif "+" in line:
            parts = line.split("+")
            left = parts[0].strip()
            right = int(parts[1].strip())
            if left in variables:
                print(variables[left] + right)
            else:
                print(int(left) + right)

# --- MAIN PROGRAM ---
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python rafaylang.py filename.rafay")
    else:
        filename = sys.argv[1]
        with open(filename, "r") as f:
            code = f.read()
            run(code)
