import sys
import site
import os

# Ensure installed site-packages are searched before the project directory
# This prevents a local `flask_session/` folder from shadowing the
# installed `flask_session` package.
site_paths = []
try:
    site_paths.extend(site.getsitepackages())
except Exception:
    pass
try:
    site_paths.append(site.getusersitepackages())
except Exception:
    pass
for p in reversed(site_paths):
    if p and os.path.isdir(p) and p not in sys.path:
        sys.path.insert(0, p)

from app.__init__ import create_app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)

    