from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["samsuns"]

for p in db.products.find():
    print(f"Name: {p.get('name')}")
    print(f"  Price: {p.get('price')} (type: {type(p.get('price'))})")
    print(f"  Discount Price: {p.get('discount_price')} (type: {type(p.get('discount_price'))})")
    print(f"  Status: {p.get('status')} (type: {type(p.get('status'))})")
