class Config:
    SECRET_KEY = "9f4a1c2e3b8d4f5a6c7e8d9f0b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b"
    # Use local MongoDB during development
    MONGO_URI = "mongodb://localhost:27017/"
    DATABASE_NAME = "samsuns"
    USERS_COLLECTION = "users"
    admin_collection = "admin"
    products_collection = "products"
    orders_collection = "orders"
    testimonials_collection = "testimonials"
    testers_collection = "testers"
    list_collection = "List"
    perfume_collection = "perfume"