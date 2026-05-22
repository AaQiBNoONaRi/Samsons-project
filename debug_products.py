from pymongo import MongoClient
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017/")
db = client["samsuns"]

print("Products in Database:")
for product in db.products.find():
    print(f"ID: {product['_id']}, Name: {product.get('name')}, Category: {product.get('category')}, Status: {product.get('status')}")
