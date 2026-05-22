with open(r"d:\samsons final\templates\admin\list.html", "r", encoding="utf-8") as f:
    content = f.read()

import re
matches = re.findall(r'href="([^"]+)"|url_for\(\'([^\']+)\'', content)
for m in matches:
    print(m)
