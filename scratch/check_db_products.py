import sys
import site
import os

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

from pymongo import MongoClient
from app.config import Config

client = MongoClient(Config.MONGO_URI)
db = client[Config.DATABASE_NAME]

print("Recently added products:")
for product in db.products.find().sort("created_at", -1).limit(5):
    print(f"ID: {product.get('_id')}, Name: {product.get('name')}, Price: {product.get('price')}, Status: {product.get('status')}, Created: {product.get('created_at')}")
