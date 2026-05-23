from pymongo import MongoClient
from app.config import Config
from bson import ObjectId
from datetime import datetime

def format_datetime(dt):
    if isinstance(dt, datetime):
        return dt.strftime("%d %b %Y %I:%M %p")
    return "N/A"

client = MongoClient(Config.MONGO_URI)
db = client[Config.DATABASE_NAME]
users_collection = db[Config.USERS_COLLECTION]
admin_collection = db[Config.admin_collection]
products_collection = db[Config.products_collection]
orders_collection = db[Config.orders_collection]
testimonials_collection = db[Config.testimonials_collection]
list_collection = db[Config.list_collection]
testers_collection = db[Config.testers_collection]
perfume_collection = db[Config.perfume_collection]

def get_admin_data():
    admins = list(users_collection.find())
    formatted_admins = []

    for admin in admins:
        registered_at = admin.get("registered_at")
        last_login = admin.get("last_login")
        formatted_admins.append({
            "_id": str(admin.get("_id")),
            "email": admin.get("email", "N/A"),
            "name": admin.get("name", "N/A"),
           "registered_at": format_datetime(registered_at),
            "last_login": format_datetime(last_login),
        })

    return formatted_admins

def get_products():
    products = list(products_collection.find().sort("created_at", -1))
    formatted_products = []

    for product in products:
        created_at = product.get("created_at")
        updated_at = product.get("updated_at")
        formatted_products.append({
            "_id": str(product.get("_id")),
            "name": product.get("name", "N/A"),
            "category": product.get("category", "N/A"),
            "type": product.get("type", "N/A"),
            "description": product.get("description", "N/A"),
            "tags": product.get("tags", {}),
            "sku": product.get("sku", "N/A"),
            "stock": product.get("stock", 0),
            "status": product.get("status", "N/A"),
            "price": product.get("price", 0),
            "Volume": product.get("Volume", 0),
            "discount_price": product.get("discount_price", 0),
            "discount_start_date": product.get("discount_start"),
            "discount_end_date": product.get("discount_end"),
            "thumbnails": product.get("thumbnails", []),
            "created_at": format_datetime(created_at),
            "updated_at": format_datetime(updated_at),
        })

    total_products = len(formatted_products)  # 🟢 Count total products
    return formatted_products, total_products



def get_orders_details():
    orders = list(orders_collection.find().sort("created_at", -1))
    formatted_orders = []

    for order in orders:
        total_quantity = order.get("total_quantity", 0)
        total_price = order.get("total_price", 0)

        formatted_order = {
            "_id": str(order.get("_id")),
            "order_id": order.get("order_id"),
            "tracking_number": order.get("tracking_number"),
            "status": order.get("status", "Pending"),
            "created_at": order.get("created_at").strftime('%B %d, %Y') if order.get("created_at") else "",
            "updated_at": order.get("updated_at").strftime('%B %d, %Y') if isinstance(order.get("updated_at"), datetime) else "",

            # Summary
            "total_quantity": total_quantity,
            "total_price": "{:,.0f}".format(total_price),  # formatted price

            # Customer details
            "details": {
                "first_name": order.get("details", {}).get("first_name"),
                "last_name": order.get("details", {}).get("last_name"),
                "address": order.get("details", {}).get("address"),
                "email": order.get("details", {}).get("email"),
                "phone": order.get("details", {}).get("phone"),
                "city": order.get("details", {}).get("city"),
                "state": order.get("details", {}).get("state"),
                "zip_code": order.get("details", {}).get("zip_code"),
                "payment_method": order.get("details", {}).get("payment_method"),
            },

            # Products list
            "products": []
        }

        # Append each product
        products_raw = order.get("products", [])
        if isinstance(products_raw, dict):
            products_list = list(products_raw.values())
        elif isinstance(products_raw, list):
            products_list = products_raw
        else:
            products_list = []

        for product in products_list:
            if not isinstance(product, dict):
                continue
            formatted_order["products"].append({
                "product_id": product.get("product_id"),
                "product_name": product.get("product_name"),
                "price": product.get("price"),
                "final_price": product.get("final_price"),
                "quantity": product.get("quantity"),
                "total_price": product.get("total_price"),
                "thumbnail": product.get("thumbnail"),
                "bottle_size": product.get("bottle_size") or product.get("bottleSize"),
                "gender": product.get("gender"),
                "is_tester": product.get("is_tester", False),
                "boxes": product.get("boxes", [])
            })

        formatted_orders.append(formatted_order)

    return formatted_orders


def get_testimonials():
    testimonials_collection = db[Config.testimonials_collection]
    testimonials = list(testimonials_collection.find().sort("created_at", -1))
    formatted_testimonials = []

    for testimonial in testimonials:
        email = testimonial.get("email", "noemail@example.com")
        # Mask email: e.g., ali****@gmail.com
        masked_email = email[:3] + "****" + email[email.find('@'):]

        formatted_testimonials.append({
            "_id": str(testimonial.get("_id")),
            "name": testimonial.get("name", "N/A"),
            "fragrance": testimonial.get("fragrance", "N/A"),
            "type": testimonial.get("type", "N/A"),
            "message": testimonial.get("message", "N/A"),
            "rating": testimonial.get("rating", 0),
            "email": masked_email,
            "created_at": format_datetime(testimonial.get("created_at"))
        })

    return formatted_testimonials


# ============================
# 📦 GET LIST PRODUCTS
# ============================
def get_list_products():
    products = list(list_collection.find().sort("created_at", -1))
    formatted_products = []

    for product in products:
        created_at = product.get("created_at")
        updated_at = product.get("updated_at")

        formatted_products.append({
            "_id": str(product.get("_id")),
            "ID": product.get("ID", "N/A"),
            "name": product.get("Name", "N/A"),
            "type": product.get("Type", "N/A"),
            "category": product.get("Category", "N/A"),
            "price": product.get("Price", 0),
            "status": product.get("status", "Active"),
            "created_at": format_datetime(created_at),
            "updated_at": format_datetime(updated_at),
        })

    total_products = len(formatted_products)
    return formatted_products, total_products


# ============================
# 🧪 GET TESTER PRODUCTS
# ============================
def get_tester_products():
    testers = list(testers_collection.find().sort("created_at", -1))
    formatted_testers = []

    for tester in testers:
        created_at = tester.get("created_at")
        updated_at = tester.get("updated_at")

        formatted_testers.append({
            "_id": str(tester.get("_id")),
            "name": tester.get("name", "N/A"),
            "currency": tester.get("currency", "PKR"),
            "type": tester.get("type", "tester"),
            "available": tester.get("available", False),
            "packets": [
                {
                    "size": packet.get("size"),
                    "price": packet.get("price"),
                    "image": packet.get("image")
                } for packet in tester.get("packets", [])
            ],
            "created_at": format_datetime(created_at),
            "updated_at": format_datetime(updated_at),
        })

    total_testers = len(formatted_testers)
    return formatted_testers, total_testers


def get_perfume_products():
    perfumes = list(perfume_collection.find().sort("_id", -1))  # latest first
    formatted_perfumes = []

    for perfume in perfumes:
        formatted_perfumes.append({
            "_id": str(perfume.get("_id")),
            "images": {
                "30": perfume.get("images", {}).get("30", []),
                "50": perfume.get("images", {}).get("50", []),
                "100": perfume.get("images", {}).get("100", [])
            }
        })

    total_perfumes = len(formatted_perfumes)
    return formatted_perfumes, total_perfumes