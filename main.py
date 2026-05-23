import sys
import site
import os


# Reconfigure stdout and stderr to use UTF-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

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

    