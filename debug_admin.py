from pymongo import MongoClient
import bcrypt

client = MongoClient("mongodb://localhost:27017/")
db = client["samsuns"]

print("Admin Users in Database:")
for admin in db.admin.find():
    print(f"Username: {admin.get('username')}, Password Hash: {admin.get('password')}")
