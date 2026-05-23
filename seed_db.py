import datetime
from pymongo import MongoClient
import bcrypt

# Setup connection
MONGO_URI = "mongodb://localhost:27017/"
DATABASE_NAME = "samsuns"

print("Connecting to MongoDB...")
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
admin_collection = db["admin"]
products_collection = db["products"]
orders_collection = db["orders"]
testimonials_collection = db["testimonials"]
testers_collection = db["testers"]
list_collection = db["List"]

print("Clearing existing collections to ensure fresh seed...")
users_collection.delete_many({})
admin_collection.delete_many({})
products_collection.delete_many({})
orders_collection.delete_many({})
testimonials_collection.delete_many({})
testers_collection.delete_many({})
list_collection.delete_many({})

print("Seeding admin user...")
admin_password = "admin123"
hashed_admin_password = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt())
admin_user = {
    "username": "admin@samsons.com",
    "password": hashed_admin_password,
    "created_at": datetime.datetime.now(datetime.timezone.utc)
}
admin_collection.insert_one(admin_user)
print(f"[SUCCESS] Admin created with username: admin@samsons.com and password: {admin_password}")

print("Seeding users...")
mock_users = [
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123",
        "registered_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=15),
        "last_login": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
    },
    {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "password": "password123",
        "registered_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=10),
        "last_login": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)
    },
    {
        "name": "Hamza Ali",
        "email": "hamza@example.com",
        "password": "password123",
        "registered_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=5),
        "last_login": datetime.datetime.now(datetime.timezone.utc)
    }
]
users_collection.insert_many(mock_users)
print(f"[SUCCESS] Seeded {len(mock_users)} users.")

print("Seeding products...")
# We use existing static product images
now = datetime.datetime.now(datetime.timezone.utc)
products = [
    # --- MEN ---
    {
        "name": "Boss Men Bottled Infinite",
        "category": "male",
        "type": "EAU DE PARFUM",
        "Volume": "100",
        "description": "An energizing and sensual perfume that combines the freshness of citrus notes and the intensity of aromatic, woody notes.",
        "sku": "BMB-INF-100",
        "stock": 45,
        "tags": {"1": "hot deal", "2": "best seller"},
        "price": 6500.0,
        "discount_price": 5500.0,
        "discount_start": (now - datetime.timedelta(days=5)).isoformat(),
        "discount_end": (now + datetime.timedelta(days=20)).isoformat(),
        "thumbnails": ["/static/images/products/Men/1-1.png", "/static/images/products/Men/1-2.png"],
        "images": ["/static/images/products/Men/1-1.png", "/static/images/products/Men/1-2.png"],
        "brand": "Boss",
        "created_at": now - datetime.timedelta(days=20),
        "status": "active"
    },
    {
        "name": "Versace Dylan Blue",
        "category": "male",
        "type": "EAU DE TOILETTE",
        "Volume": "100",
        "description": "A strong, masculine fragrance, Dylan Blue encapsulates the sensual scents of the Mediterranean.",
        "sku": "VDB-100",
        "stock": 30,
        "tags": {"1": "best seller"},
        "price": 7500.0,
        "discount_price": None,
        "thumbnails": ["/static/images/products/Men/2-1.png", "/static/images/products/Men/2-2.png"],
        "images": ["/static/images/products/Men/2-1.png", "/static/images/products/Men/2-2.png"],
        "brand": "Versace",
        "created_at": now - datetime.timedelta(days=18),
        "status": "active"
    },
    {
        "name": "Bleu de Chanel",
        "category": "male",
        "type": "EAU DE PARFUM",
        "Volume": "50",
        "description": "An aromatic-woody fragrance with a captivating trail. A timeless scent housed in a bottle of deep and mysterious blue.",
        "sku": "BDC-50",
        "stock": 15,
        "tags": {"1": "hot"},
        "price": 8500.0,
        "discount_price": 8000.0,
        "discount_start": (now - datetime.timedelta(days=2)).isoformat(),
        "discount_end": (now + datetime.timedelta(days=10)).isoformat(),
        "thumbnails": ["/static/images/products/Men/3-1.png", "/static/images/products/Men/3-2.png"],
        "images": ["/static/images/products/Men/3-1.png", "/static/images/products/Men/3-2.png"],
        "brand": "Chanel",
        "created_at": now - datetime.timedelta(days=15),
        "status": "active"
    },
    {
        "name": "Creed Aventus Men",
        "category": "male",
        "type": "EAU DE PARFUM",
        "Volume": "100",
        "description": "The exceptional Aventus features notes of pineapple, birch, and ambergris. A statement of strength and success.",
        "sku": "CA-100",
        "stock": 10,
        "tags": {"1": "popular", "2": "best seller"},
        "price": 12000.0,
        "discount_price": None,
        "thumbnails": ["/static/images/products/Men/4-1.png", "/static/images/products/Men/4-2.png"],
        "images": ["/static/images/products/Men/4-1.png", "/static/images/products/Men/4-2.png"],
        "brand": "Creed",
        "created_at": now - datetime.timedelta(days=12),
        "status": "active"
    },
    {
        "name": "Dior Sauvage",
        "category": "male",
        "type": "EAU DE PARFUM",
        "Volume": "100",
        "description": "A radically fresh composition, dictated by a name that has the ring of a manifesto. Raw and noble all at once.",
        "sku": "DS-100",
        "stock": 3,  # low stock for inventory alert testing
        "tags": {"1": "hot deal"},
        "price": 9000.0,
        "discount_price": 7999.0,
        "discount_start": (now - datetime.timedelta(days=4)).isoformat(),
        "discount_end": (now + datetime.timedelta(days=15)).isoformat(),
        "thumbnails": ["/static/images/products/Men/5-1.png", "/static/images/products/Men/5-2.png"],
        "images": ["/static/images/products/Men/5-1.png", "/static/images/products/Men/5-2.png"],
        "brand": "Dior",
        "created_at": now - datetime.timedelta(days=10),
        "status": "active"
    },
    {
        "name": "Acqua Di Gio",
        "category": "male",
        "type": "EAU DE TOILETTE",
        "Volume": "100",
        "description": "A classic aquatic fragrance that opens with fresh calabrian bergamot, neroli and green tangerine.",
        "sku": "ADG-100",
        "stock": 25,
        "tags": {},
        "price": 6800.0,
        "discount_price": None,
        "thumbnails": ["/static/images/products/Men/6-1.png", "/static/images/products/Men/6-2.png"],
        "images": ["/static/images/products/Men/6-1.png", "/static/images/products/Men/6-2.png"],
        "brand": "Armani",
        "created_at": now - datetime.timedelta(days=8),
        "status": "active"
    },

    # --- WOMEN ---
    {
        "name": "Gucci Bloom",
        "category": "female",
        "type": "EAU DE PARFUM",
        "Volume": "100",
        "description": "Created to unfold like its name, capturing the rich scent of a thriving garden filled with an abundance of flowers.",
        "sku": "GB-100",
        "stock": 40,
        "tags": {"1": "hot deal", "2": "best seller"},
        "price": 8500.0,
        "discount_price": 7500.0,
        "discount_start": (now - datetime.timedelta(days=5)).isoformat(),
        "discount_end": (now + datetime.timedelta(days=20)).isoformat(),
        "thumbnails": ["/static/images/products/Women/1-1.png", "/static/images/products/Women/1-2.png"],
        "images": ["/static/images/products/Women/1-1.png", "/static/images/products/Women/1-2.png"],
        "brand": "Gucci",
        "created_at": now - datetime.timedelta(days=19),
        "status": "active"
    },
    {
        "name": "Chanel Coco Mademoiselle",
        "category": "female",
        "type": "EAU DE PARFUM",
        "Volume": "100",
        "description": "A double name, a double personality. Independent and endearing, mischievous and provocative, light and spirited.",
        "sku": "CCM-100",
        "stock": 18,
        "tags": {"1": "best seller"},
        "price": 10500.0,
        "discount_price": None,
        "thumbnails": ["/static/images/products/Women/2-1.png", "/static/images/products/Women/2-2.png"],
        "images": ["/static/images/products/Women/2-1.png", "/static/images/products/Women/2-2.png"],
        "brand": "Chanel",
        "created_at": now - datetime.timedelta(days=17),
        "status": "active"
    },
    {
        "name": "Marc Jacobs Daisy",
        "category": "female",
        "type": "EAU DE TOILETTE",
        "Volume": "50",
        "description": "Charmingly simple with a signature quality, Daisy Marc Jacobs transports you to a place that is optimistic, beautiful and pure.",
        "sku": "MJD-50",
        "stock": 35,
        "tags": {"1": "popular"},
        "price": 6000.0,
        "discount_price": 5400.0,
        "discount_start": (now - datetime.timedelta(days=1)).isoformat(),
        "discount_end": (now + datetime.timedelta(days=10)).isoformat(),
        "thumbnails": ["/static/images/products/Women/3-1.png", "/static/images/products/Women/3-2.png"],
        "images": ["/static/images/products/Women/3-1.png", "/static/images/products/Women/3-2.png"],
        "brand": "Marc Jacobs",
        "created_at": now - datetime.timedelta(days=14),
        "status": "active"
    },
    {
        "name": "YSL Libre",
        "category": "female",
        "type": "EAU DE PARFUM",
        "Volume": "100",
        "description": "The perfume of freedom. A grand floral fragrance with a unique, masculine twist of lavender.",
        "sku": "YSL-L-100",
        "stock": 22,
        "tags": {"1": "hot deal", "2": "popular"},
        "price": 9500.0,
        "discount_price": None,
        "thumbnails": ["/static/images/products/Women/4-1.png", "/static/images/products/Women/4-2.png"],
        "images": ["/static/images/products/Women/4-1.png", "/static/images/products/Women/4-2.png"],
        "brand": "YSL",
        "created_at": now - datetime.timedelta(days=11),
        "status": "active"
    },
    {
        "name": "Dior J'adore",
        "category": "female",
        "type": "EAU DE PARFUM",
        "Volume": "100",
        "description": "An ode to women, their audacity and their beauty. From the J'adore floral bouquet to the wrapping notes of the Eau de Parfum.",
        "sku": "DJ-100",
        "stock": 0,  # out of stock to test alerts
        "tags": {},
        "price": 9900.0,
        "discount_price": 8900.0,
        "discount_start": (now - datetime.timedelta(days=3)).isoformat(),
        "discount_end": (now + datetime.timedelta(days=12)).isoformat(),
        "thumbnails": ["/static/images/products/Women/5-1.png", "/static/images/products/Women/5-2.png"],
        "images": ["/static/images/products/Women/5-1.png", "/static/images/products/Women/5-2.png"],
        "brand": "Dior",
        "created_at": now - datetime.timedelta(days=9),
        "status": "active"
    },
    {
        "name": "Versace Bright Crystal",
        "category": "female",
        "type": "EAU DE TOILETTE",
        "Volume": "100",
        "description": "Inspired by a mixture of Donatella Versace's favorite floral fragrances, Bright Crystal is a fresh, sensual blend of refreshing chilled yuzu and pomegranate.",
        "sku": "VBC-100",
        "stock": 28,
        "tags": {"1": "best seller"},
        "price": 7200.0,
        "discount_price": None,
        "thumbnails": ["/static/images/products/Women/6-1.png", "/static/images/products/Women/6-2.png"],
        "images": ["/static/images/products/Women/6-1.png", "/static/images/products/Women/6-2.png"],
        "brand": "Versace",
        "created_at": now - datetime.timedelta(days=7),
        "status": "active"
    },

    # --- UNISEX ---
    {
        "name": "Calvin Klein CK One",
        "category": "unisex",
        "type": "EAU DE TOILETTE",
        "Volume": "100",
        "description": "A clean, pure and contemporary fragrance with a refreshing green tea signature designed for both men and women.",
        "sku": "CKO-100",
        "stock": 50,
        "tags": {"1": "popular"},
        "price": 4500.0,
        "discount_price": 3800.0,
        "discount_start": (now - datetime.timedelta(days=5)).isoformat(),
        "discount_end": (now + datetime.timedelta(days=20)).isoformat(),
        "thumbnails": ["/static/images/products/Unisex/1-1.png", "/static/images/products/Unisex/1-2.png"],
        "images": ["/static/images/products/Unisex/1-1.png", "/static/images/products/Unisex/1-2.png"],
        "brand": "Calvin Klein",
        "created_at": now - datetime.timedelta(days=20),
        "status": "active"
    },
    {
        "name": "Tom Ford Black Orchid",
        "category": "unisex",
        "type": "EAU DE PARFUM",
        "Volume": "100",
        "description": "A luxurious and sensual fragrance of rich, dark accords and an alluring potion of black orchids and spice.",
        "sku": "TF-BO-100",
        "stock": 12,
        "tags": {"1": "best seller", "2": "hot deal"},
        "price": 13500.0,
        "discount_price": None,
        "thumbnails": ["/static/images/products/Unisex/2-1.png", "/static/images/products/Unisex/2-2.png"],
        "images": ["/static/images/products/Unisex/2-1.png", "/static/images/products/Unisex/2-2.png"],
        "brand": "Tom Ford",
        "created_at": now - datetime.timedelta(days=16),
        "status": "active"
    },
    {
        "name": "Byredo Gypsy Water",
        "category": "unisex",
        "type": "EAU DE PARFUM",
        "Volume": "100",
        "description": "A glamorization of the Romany lifestyle, based on a fascination for the myth. The scent of fresh soil, deep forests and campfires.",
        "sku": "BGW-100",
        "stock": 8,
        "tags": {},
        "price": 14000.0,
        "discount_price": 12500.0,
        "discount_start": (now - datetime.timedelta(days=2)).isoformat(),
        "discount_end": (now + datetime.timedelta(days=15)).isoformat(),
        "thumbnails": ["/static/images/products/Unisex/3-1.png", "/static/images/products/Unisex/3-2.png"],
        "images": ["/static/images/products/Unisex/3-1.png", "/static/images/products/Unisex/3-2.png"],
        "brand": "Byredo",
        "created_at": now - datetime.timedelta(days=13),
        "status": "active"
    },
    {
        "name": "Maison Margiela Replica Jazz Club",
        "category": "unisex",
        "type": "EAU DE TOILETTE",
        "Volume": "100",
        "description": "An aromatic fragrance that recreates the warm, cozy atmosphere of a private jazz club with sweet notes of rum and vanilla.",
        "sku": "MM-JC-100",
        "stock": 20,
        "tags": {"1": "hot deal"},
        "price": 9800.0,
        "discount_price": None,
        "thumbnails": ["/static/images/products/Unisex/4-1.png", "/static/images/products/Unisex/4-2.png"],
        "images": ["/static/images/products/Unisex/4-1.png", "/static/images/products/Unisex/4-2.png"],
        "brand": "Maison Margiela",
        "created_at": now - datetime.timedelta(days=11),
        "status": "active"
    },
    {
        "name": "Le Labo Santal 33",
        "category": "unisex",
        "type": "EAU DE PARFUM",
        "Volume": "100",
        "description": "A perfume that touches the sensual universality of this icon, which would intoxicate a man as much as a woman. Sandalwood, cardamom and cedarwood.",
        "sku": "LL-S33-100",
        "stock": 14,
        "tags": {"1": "best seller"},
        "price": 15000.0,
        "discount_price": 14000.0,
        "discount_start": (now - datetime.timedelta(days=3)).isoformat(),
        "discount_end": (now + datetime.timedelta(days=10)).isoformat(),
        "thumbnails": ["/static/images/products/Unisex/5-1.png", "/static/images/products/Unisex/5-2.png"],
        "images": ["/static/images/products/Unisex/5-1.png", "/static/images/products/Unisex/5-2.png"],
        "brand": "Le Labo",
        "created_at": now - datetime.timedelta(days=9),
        "status": "active"
    },
    {
        "name": "Jo Malone Wood Sage & Sea Salt",
        "category": "unisex",
        "type": "COLOGNE",
        "Volume": "100",
        "description": "Escape the everyday along the windswept shore. Waves breaking white, the air fresh with sea salt and spray. Alive with the mineral scent of the rugged cliffs.",
        "sku": "JM-WS-100",
        "stock": 25,
        "tags": {"1": "popular"},
        "price": 8200.0,
        "discount_price": None,
        "thumbnails": ["/static/images/products/Unisex/6-1.png", "/static/images/products/Unisex/6-2.png"],
        "images": ["/static/images/products/Unisex/6-1.png", "/static/images/products/Unisex/6-2.png"],
        "brand": "Jo Malone",
        "created_at": now - datetime.timedelta(days=5),
        "status": "active"
    },

    # --- ATTAR ---
    {
        "name": "Samsons Royal Oud Attar",
        "category": "attar",
        "type": "CONCENTRATED PERFUME OIL",
        "Volume": "12",
        "description": "A pure, non-alcoholic concentrated perfume oil featuring deep, rich agarwood (oud) notes balanced with warm musk and amber.",
        "sku": "SR-OUD-12",
        "stock": 35,
        "tags": {"1": "best seller", "2": "hot deal"},
        "price": 3500.0,
        "discount_price": 2999.0,
        "discount_start": (now - datetime.timedelta(days=1)).isoformat(),
        "discount_end": (now + datetime.timedelta(days=20)).isoformat(),
        "thumbnails": ["/static/images/perfume.jpg"],
        "images": ["/static/images/perfume.jpg"],
        "brand": "Samsons",
        "created_at": now - datetime.timedelta(days=4),
        "status": "active"
    },
    {
        "name": "Samsons Musk Rose Attar",
        "category": "attar",
        "type": "CONCENTRATED PERFUME OIL",
        "Volume": "12",
        "description": "A sweet, romantic combination of taif rose blossoms and premium white musk. Alcohol-free oil that lasts for 24+ hours.",
        "sku": "SR-MUSK-12",
        "stock": 40,
        "tags": {},
        "price": 2800.0,
        "discount_price": None,
        "thumbnails": ["/static/images/perfume.jpg"],
        "images": ["/static/images/perfume.jpg"],
        "brand": "Samsons",
        "created_at": now - datetime.timedelta(days=3),
        "status": "active"
    }
]

inserted_products = products_collection.insert_many(products)
product_ids = [str(pid) for pid in inserted_products.inserted_ids]
print(f"[SUCCESS] Seeded {len(products)} products.")

print("Seeding testimonials...")
mock_testimonials = [
    {
        "name": "Ahmed Raza",
        "fragrance": "Boss Men Bottled Infinite",
        "type": "EAU DE PARFUM",
        "message": "Perfect fragrance for summer. Smells fresh and masculine. Lasts easily for 8 hours on skin. Highly recommended!",
        "rating": 5,
        "email": "ahmed.raza@gmail.com",
        "created_at": now - datetime.timedelta(days=1)
    },
    {
        "name": "Ayesha Khan",
        "fragrance": "Gucci Bloom",
        "type": "EAU DE PARFUM",
        "message": "The floral notes are so natural, it feels like sitting in a real garden. Got so many compliments!",
        "rating": 5,
        "email": "ayesha.k@yahoo.com",
        "created_at": now - datetime.timedelta(days=3)
    },
    {
        "name": "Zainab Malik",
        "fragrance": "Tom Ford Black Orchid",
        "type": "EAU DE PARFUM",
        "message": "A rich, mysterious scent. It stands out in evening parties. A bit strong at first, but settles beautifully.",
        "rating": 4,
        "email": "zainab.malik@outlook.com",
        "created_at": now - datetime.timedelta(days=5)
    }
]
testimonials_collection.insert_many(mock_testimonials)
print(f"[SUCCESS] Seeded {len(mock_testimonials)} testimonials.")

print("Seeding testers...")
mock_testers = [
    {
        "name": "Samsons Discovery Tester Pack (Men)",
        "currency": "PKR",
        "type": "tester",
        "available": True,
        "packets": [
            {"size": "3ml", "price": 400},
            {"size": "5ml", "price": 600},
            {"size": "10ml", "price": 1000}
        ],
        "created_at": now - datetime.timedelta(days=10),
        "updated_at": now
    },
    {
        "name": "Samsons Discovery Tester Pack (Women)",
        "currency": "PKR",
        "type": "tester",
        "available": True,
        "packets": [
            {"size": "3ml", "price": 400},
            {"size": "5ml", "price": 600},
            {"size": "10ml", "price": 1000}
        ],
        "created_at": now - datetime.timedelta(days=10),
        "updated_at": now
    }
]
testers_collection.insert_many(mock_testers)
print(f"[SUCCESS] Seeded {len(mock_testers)} testers.")

print("Seeding List collection...")
mock_list = [
    {
        "ID": "L-101",
        "Name": "Summer Citrus Special",
        "Type": "Citrus",
        "Category": "male",
        "Price": 5500,
        "status": "Active",
        "created_at": now - datetime.timedelta(days=15),
        "updated_at": now
    },
    {
        "ID": "L-102",
        "Name": "Rose Musk Concentrated",
        "Type": "Floral",
        "Category": "female",
        "Price": 2800,
        "status": "Active",
        "created_at": now - datetime.timedelta(days=15),
        "updated_at": now
    }
]
list_collection.insert_many(mock_list)
print(f"[SUCCESS] Seeded {len(mock_list)} list entries.")

print("Seeding orders...")
# Seed a few orders for daily, weekly, monthly charts and analytics
# We will use some of the seeded products
mock_orders = [
    # Today
    {
        "order_id": "RA1108001",
        "tracking_number": "SS030001",
        "created_at": now - datetime.timedelta(hours=2),
        "status": "Pending",
        "details": {
            "first_name": "Aamir",
            "last_name": "Sohail",
            "address": "House 12, Street 3, DHA Phase 5",
            "email": "aamir.sohail@gmail.com",
            "phone": "03001234567",
            "city": "Karachi",
            "state": "Sindh",
            "zip_code": "75500",
            "payment_method": "COD"
        },
        "products": [
            {
                "product_id": product_ids[0],
                "product_name": "Boss Men Bottled Infinite",
                "price": 6500.0,
                "final_price": 5500.0,
                "quantity": 1,
                "total_price": 5500.0,
                "thumbnail": "/static/images/products/Men/1-1.png",
                "bottle_size": "100",
                "gender": "male"
            }
        ],
        "total_quantity": 1,
        "total_price": 5500.0
    },
    # Yesterday
    {
        "order_id": "RA1108002",
        "tracking_number": "SS030002",
        "created_at": now - datetime.timedelta(days=1, hours=3),
        "status": "Confirmed",
        "details": {
            "first_name": "Bilal",
            "last_name": "Ahmed",
            "address": "Flat 4B, Sector G-11",
            "email": "bilal.ahmed@yahoo.com",
            "phone": "03129876543",
            "city": "Islamabad",
            "state": "ICT",
            "zip_code": "44000",
            "payment_method": "COD"
        },
        "products": [
            {
                "product_id": product_ids[1],
                "product_name": "Versace Dylan Blue",
                "price": 7500.0,
                "final_price": 7500.0,
                "quantity": 1,
                "total_price": 7500.0,
                "thumbnail": "/static/images/products/Men/2-1.png",
                "bottle_size": "100",
                "gender": "male"
            },
            {
                "product_id": product_ids[6],
                "product_name": "Gucci Bloom",
                "price": 8500.0,
                "final_price": 7500.0,
                "quantity": 1,
                "total_price": 7500.0,
                "thumbnail": "/static/images/products/Women/1-1.png",
                "bottle_size": "100",
                "gender": "female"
            }
        ],
        "total_quantity": 2,
        "total_price": 15000.0
    },
    # 3 Days ago
    {
        "order_id": "RA1108003",
        "tracking_number": "SS030003",
        "created_at": now - datetime.timedelta(days=3),
        "status": "Shipped",
        "details": {
            "first_name": "Fatima",
            "last_name": "Raza",
            "address": "34-C, Model Town",
            "email": "fatima.raza@outlook.com",
            "phone": "03334445556",
            "city": "Lahore",
            "state": "Punjab",
            "zip_code": "54000",
            "payment_method": "COD"
        },
        "products": [
            {
                "product_id": product_ids[13],
                "product_name": "Tom Ford Black Orchid",
                "price": 13500.0,
                "final_price": 13500.0,
                "quantity": 1,
                "total_price": 13500.0,
                "thumbnail": "/static/images/products/Unisex/2-1.png",
                "bottle_size": "100",
                "gender": "unisex"
            }
        ],
        "total_quantity": 1,
        "total_price": 13500.0
    },
    # 5 Days ago
    {
        "order_id": "RA1108004",
        "tracking_number": "SS030004",
        "created_at": now - datetime.timedelta(days=5),
        "status": "Delivered",
        "details": {
            "first_name": "Usman",
            "last_name": "Tariq",
            "address": "Samanabad Area",
            "email": "usman.tariq@gmail.com",
            "phone": "03451112223",
            "city": "Faisalabad",
            "state": "Punjab",
            "zip_code": "38000",
            "payment_method": "COD"
        },
        "products": [
            {
                "product_id": product_ids[18],
                "product_name": "Samsons Royal Oud Attar",
                "price": 3500.0,
                "final_price": 2999.0,
                "quantity": 2,
                "total_price": 5998.0,
                "thumbnail": "/static/images/perfume.jpg",
                "bottle_size": "12",
                "gender": "attar"
            }
        ],
        "total_quantity": 2,
        "total_price": 5998.0
    },
    # 12 Days ago
    {
        "order_id": "RA1108005",
        "tracking_number": "SS030005",
        "created_at": now - datetime.timedelta(days=12),
        "status": "Delivered",
        "details": {
            "first_name": "Sara",
            "last_name": "Sheikh",
            "address": "Gulshan-e-Iqbal Block 5",
            "email": "sara.sheikh@gmail.com",
            "phone": "03217778889",
            "city": "Karachi",
            "state": "Sindh",
            "zip_code": "75300",
            "payment_method": "COD"
        },
        "products": [
            {
                "product_id": product_ids[7],
                "product_name": "Chanel Coco Mademoiselle",
                "price": 10500.0,
                "final_price": 10500.0,
                "quantity": 1,
                "total_price": 10500.0,
                "thumbnail": "/static/images/products/Women/2-1.png",
                "bottle_size": "100",
                "gender": "female"
            }
        ],
        "total_quantity": 1,
        "total_price": 10500.0
    }
]
orders_collection.insert_many(mock_orders)
print(f"[SUCCESS] Seeded {len(mock_orders)} orders.")

print("\nDatabase seeded successfully!")
print("=============================")
print("Admin username: admin@samsons.com")
print("Admin password: admin123")
print("=============================")
