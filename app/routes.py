from flask import Blueprint, request, render_template, redirect, flash, session,  jsonify, send_file,  url_for
from bson.objectid import ObjectId
from pymongo import DESCENDING
from app.database import get_list_products, get_tester_products, users_collection, orders_collection, get_orders_details, get_testimonials, get_perfume_products
from functools import wraps  # Import wraps
from itsdangerous import URLSafeSerializer
from datetime import datetime 
from bson.errors import InvalidId

routes_bp = Blueprint("routes", __name__)

from pymongo import MongoClient
from app.config import Config
SECRET_KEY = "RiswithaalwayswithA@08"  
serializer = URLSafeSerializer(SECRET_KEY)

# Initialize MongoDB client

client = MongoClient(Config.MONGO_URI)
db = client[Config.DATABASE_NAME]
products_collection = db[Config.products_collection]


# @routes_bp.route('/')
# def home():
#     return render_template('home.html')


# @routes_bp.route('/')
# def home():
#     all_products = list(products_collection.find())

#     all_three = []
#     two_tags = []
#     hot_only = []
#     sale_only = []
#     popular_only = []
#     regular_items = []

#     for p in all_products:
#         tags = p.get('tags', [])

#         if isinstance(tags, dict):
#             tags = list(tags.values())
#         elif not isinstance(tags, list):
#             tags = []

#         tag_set = set(tag.lower() for tag in tags if isinstance(tag, str))
#         matched = tag_set.intersection({"hot", "sale", "popular"})

#         if matched == {"hot", "sale", "popular"}:
#             all_three.append(p)
#         elif len(matched) == 2:
#             two_tags.append(p)
#         elif matched == {"hot"}:
#             hot_only.append(p)
#         elif matched == {"sale"}:
#             sale_only.append(p)
#         elif matched == {"popular"}:
#             popular_only.append(p)
#         else:
#             regular_items.append(p)

#     # Debugging (Optional)
#     for p in all_products:
#         title = p.get('title') or p.get('name') or "No Title"
#         tags = p.get('tags', [])
#         print(f" - {title} → Tags: {tags}")

#     return render_template('web.html',
#                            all_three=all_three,
#                            two_tags=two_tags,
#                            hot_only=hot_only,
#                            sale_only=sale_only,
#                            popular_only=popular_only,
#                            regular_items=regular_items)




@routes_bp.route('/')
def home():
    all_products = list(products_collection.find())
    
    # Gender groups
    men_products = []
    women_products = []
    unisex_products = []

    # Tags
    sale_products = []
    hot_deals = []
    best_sellers = []

    for p in all_products:
        category = str(p.get("category", "")).lower()

        if category == "male":
            men_products.append(p)
        elif category == "female":
            women_products.append(p)
        elif category == "unisex":
            unisex_products.append(p)

        tags = p.get("tags", [])
        if isinstance(tags, dict):
            tags = list(tags.values())
        elif not isinstance(tags, list):
            tags = []

        tag_set = set(tag.lower() for tag in tags if isinstance(tag, str))

        if "hot deal" in tag_set or "hot deals" in tag_set or "hot" in tag_set:
            hot_deals.append(p)
        if "best seller" in tag_set or "bestseller" in tag_set or "best" in tag_set:
            best_sellers.append(p)

        # ✅ Check if product has a valid discount_price
        if p.get("discount_price"):
            sale_products.append(p)

    # Sort sale products by created_at or _id (fallback)
    sale_products = sorted(
        sale_products,
        key=lambda x: x.get("created_at") or x.get("_id", ObjectId()),
        reverse=True
    )

    # Sort best sellers by created_at
    best_sellers_sorted = sorted(
        best_sellers,
        key=lambda x: x.get("created_at") or datetime.min,
        reverse=True
    )

    # Get latest 12 products
    new_products = sorted(
        all_products,
        key=lambda x: x.get("created_at") or x.get("_id", ObjectId()),
        reverse=True
    )[:12]

    # Only female products from latest
    new_women_products = [
        p for p in new_products
        if str(p.get("category", "")).lower() == "female"
    ]
    
    testimonial_data = get_testimonials()
    
    cart = session.get('cart', [])
    cart_count = sum(item.get('quantity', 1) for item in cart)
    
    # print(f"🛒 Cart count: {cart_count}")  # Debug print for cart count
    # Debug (optional)
    print(f"Total sale products: {len(new_products)}")
    # print(f"Total best sellers: {len(best_sellers_sorted)}")
    # print(f"testimonials: {len(testimonial_data)}")
    
    

    return render_template('web.html',
                           men_products=men_products,
                           women_products=women_products,
                           unisex_products=unisex_products,
                           sale_products=sale_products,
                           hot_deals=hot_deals,
                           best_sellers=best_sellers_sorted[:6],
                           new_products=new_products,
                           new_women_products=new_women_products,
                           testimonials=testimonial_data,
                           cart_count=cart_count)





from datetime import datetime

@routes_bp.route('/products')
def products():
    # Fetch all products and sort them by date descending (latest first)
    all_products = list(products_collection.find().sort("date", -1))

    # Parse string dates (optional if 'date' is already a datetime)
    for p in all_products:
        if isinstance(p.get("date"), str):
            try:
                p["date"] = datetime.fromisoformat(p["date"])
            except:
                p["date"] = datetime.min  # fallback for bad format

    # Filter products into categories
    men_products = [p for p in all_products if p.get("category", "").lower() == "male"]
    women_products = [p for p in all_products if p.get("category", "").lower() == "female"]
    unisex_products = [p for p in all_products if p.get("category", "").lower() == "unisex"]
    attar_products = [p for p in all_products if p.get("category", "").lower() == "attar"]

    return render_template(
        'products.html',
        all_products=all_products,
        men_products=men_products,
        women_products=women_products,
        unisex_products=unisex_products,
        attar_products=attar_products
    )



@routes_bp.route('/products/details/<product_id>')
def product_details(product_id):
    try:
        object_id = ObjectId(product_id)
    except:
        return render_template('404.html'), 404

    product = products_collection.find_one({"_id": object_id})

    if not product:
        return render_template('404.html'), 404

    category = product.get("category", "").strip().lower()
    brand = product.get("brand", "").strip().lower()

    related_products = []

    # Case 1: Match both brand and category
    if brand and category:
        related_products = list(products_collection.find({
            "_id": {"$ne": object_id},
            "category": {"$regex": f"^{category}$", "$options": "i"},
            "brand": {"$regex": f"^{brand}$", "$options": "i"}
        }).limit(6))

    # Case 2: Fallback to category
    if not related_products and category:
        related_products = list(products_collection.find({
            "_id": {"$ne": object_id},
            "category": {"$regex": f"^{category}$", "$options": "i"}
        }).limit(4))

    # Case 3: Fallback to brand
    if not related_products and brand:
        related_products = list(products_collection.find({
            "_id": {"$ne": object_id},
            "brand": {"$regex": f"^{brand}$", "$options": "i"}
        }).limit(4))

    return render_template(
        'product_details.html',
        product=product,
        related_products=related_products
    )



@routes_bp.route("/login", methods=["GET", "POST"])
def login():
    global users_collection

    if request.method == "POST":
        if request.form.get("name"):  # Registration form submitted
            name = request.form.get("name")
            email = request.form.get("email")
            password = request.form.get("password")

            if users_collection.find_one({"email": email}):
                return jsonify({"status": "error", "message": "Email already registered."})

            users_collection.insert_one({
                "name": name,
                "email": email,
                "password": password,
                "registered_at": datetime.now()
            })
            return jsonify({"status": "success", "message": "Registration successful!"})

        else:  # Login form
            email = request.form.get("email")
            password = request.form.get("password")

            user = users_collection.find_one({"email": email, "password": password})
            if user:
                users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"last_login": datetime.now()}}
                )
                
                # Save user info in session
                session['user'] = {
                    "id": str(user["_id"]),
                    "name": user["name"],
                    "email": user["email"]
                }

                # Debug print session ID and user name
                print(f"Logged in session id: {session.sid if hasattr(session, 'sid') else 'No session.sid available'}")
                print(f"Logged in user name: {session['user']['name']}")

                flash("Login successful!", "success")
                return redirect("/")

            else:
                flash("Invalid email or password.", "error")
            return redirect("/login")

    return render_template("login.html")

@routes_bp.route('/logout')
def logout():
    session.pop('user', None)  # Remove user from session
    flash('You have been logged out.', 'success')
    return redirect('/')  # Redirect to login page or home

# @routes_bp.route('/checkout', methods=['POST'])
# def checkout():
#     from bson import ObjectId

#     product_id = request.form.get('product_id')

#     try:
#         product_obj_id = ObjectId(product_id)
#         product = products_collection.find_one({'_id': product_obj_id})
#     except:
#         return "Invalid Product ID", 400

#     if not product:
#         return "Product not found", 404

#     # Create a virtual cart with this 1 product
#     cart = [{
#         "product_id": product_id,
#         "quantity": int(request.form.get('quantity')),
#     }]

#     # Count unique product IDs
#     unique_product_ids = {item['product_id'] for item in cart}
#     unique_count = len(unique_product_ids)

#     print("✅ Received ObjectId:", product_obj_id)
#     print("✅ Product from DB:", product['name'])
#     print("🧮 Total unique products in this checkout:", unique_count)

#     return render_template(
#         'checkout.html',
#         product=product,
#         unique_count=unique_count
#     )

@routes_bp.route('/checkout', methods=['GET', 'POST'])
def checkout():
    cart = session.get('cart', [])

    # If it's a POST request, process the checkout
    if request.method == 'POST':
        product_id = request.form.get('product_id')
        try:
            product_obj_id = ObjectId(product_id)
            product = products_collection.find_one({'_id': product_obj_id})
        except:
            return "Invalid Product ID", 400

        if not product:
            return "Product not found", 404
        
        quantity = int(request.form.get('quantity'))
        cart = [{
            "product_id": product_id,
            "quantity": quantity,
        }]
        unique_product_ids = {item['product_id'] for item in cart}
        Product_count = len(unique_product_ids)

        product_name = request.form.get('product_name')
        description = request.form.get('description')
        bottleSize = request.form.get('bottleSize')
        gender = request.form.get('gender')
        final_price_str = request.form.get('final_price', '0')
        try:
            final_price = float(final_price_str) if final_price_str.strip() else 0.0
        except ValueError:
            final_price = 0.0
        thumbnail_url = request.form.get('thumbnail')      
        stock = int(request.form.get('stock', '0'))
        total_price = float(request.form.get('total_price'))

        return render_template(
            'checkout.html',
            product_id=product_id,
            product_name=product_name,
            price=final_price,
            quantity=quantity,
            total_price=total_price,
            description=description,
            cart=cart,
            gender=gender,
            stock=stock,
            size=bottleSize,
            Product_count=Product_count,
            thumbnail=thumbnail_url
        )

    # ✅ FOR GET REQUESTS: Check for custom perfume buy_now_item FIRST (higher priority)
    print(f"🔍 DEBUG: Checkout route - checking for buy_now_item in session")
    print(f"🔍 DEBUG: Session keys: {list(session.keys())}")
    
    buy_now_item = session.get('buy_now_item')
    if buy_now_item:
        print("🟢 CUSTOM PERFUME DATA FOUND IN SESSION:")
        perfumes = buy_now_item.get('perfumes', [])
        
        print(f"  Total Perfumes: {len(perfumes)}")
        for i, perfume in enumerate(perfumes):
            print(f"    Perfume {i+1}: {perfume.get('fragrance_name')} - {perfume.get('size')} - Rs.{perfume.get('price')}")
            print(f"      Fragrance ID: {perfume.get('id')}, Perfume Number: {perfume.get('perfume_number')}")
        # Create separate cart items for each perfume
        cart_items = []
        for perfume in perfumes:
            # Handle price conversion safely
            price_str = perfume.get("price", "0")
            try:
                perfume_price = float(price_str) if price_str and price_str != "—" else 0.0
            except (ValueError, TypeError):
                perfume_price = 0.0
            
            cart_item = {
                "product_id": f"custom_perfume_{perfume.get('fragrance_id', 'unknown')}",
                "product_name": perfume.get("fragrance_name", "Custom Perfume"),
                "quantity": 1,  # Each perfume is a separate item with quantity 1
                "price": perfume_price,
                "final_price": perfume_price,
                "total_price": perfume_price,  # Since quantity is 1
                "description": "Custom Perfume",
               "thumbnail": perfume.get("bottle_image") or perfume.get("thumbnail") or url_for('static', filename='images/placeholder.png'),

                "bottleSize": perfume.get("size", ""),
                "gender": "Unisex",
                "stock": 99,
                "is_custom_perfume": True,
                "fragrance_id": perfume.get("fragrance_id"),
                "perfume_number": perfume.get("perfume_number", 0)
            }
            cart_items.append(cart_item)
        
        total_quantity = len(cart_items)  # Total number of perfume items
        total_price = sum(item["total_price"] for item in cart_items)
        
        print(f"  Created {len(cart_items)} separate cart items")
        print(f"  Total Quantity: {total_quantity}")
        print(f"  Total Price: {total_price}")
        print(f"🔍 DEBUG: About to render checkout template with buy_now_item data")
        
        # This is a custom perfume buy now checkout with multiple items
        return render_template(
            'checkout.html',
            product_id="custom_perfume",
            product_name="Custom Perfume Collection",
            price=total_price,  # Total price for all items
            quantity=total_quantity,  # Total number of items
            total_price=total_price,
            description="Custom Perfume Collection",
            cart=cart_items,  # Pass the individual cart items
            gender="Unisex",
            stock=99,
            size="Multiple Sizes",
            Product_count=sum(item["quantity"] for item in cart_items),  # Sum of all quantities
            thumbnail="",  # No single thumbnail for multiple items
            # ✅ Pass custom perfume specific data
            perfumes=perfumes,  # Keep perfumes for display
            boxes=[],  # Empty boxes for custom perfume
            packet_size="",  # Empty packet_size for custom perfume
            # Debug info
            debug_info={
                'has_buy_now_item': True,
                'perfumes_count': len(perfumes),
                'cart_items_count': len(cart_items),
                'total_quantity': sum(item["quantity"] for item in cart_items),
                'session_keys': list(session.keys())
            }
        )

    # ✅ FOR GET REQUESTS: Check if there's tester data in session (lower priority)
    checkout_data = session.get('checkout_data')
    if checkout_data:
        print("🟢 TESTER DATA FOUND IN SESSION")
        unit_price = float(checkout_data.get('final_price', 0))
        quantity = int(checkout_data.get('quantity', 1))
        total_price = unit_price * quantity
        return render_template(
            'checkout.html',
            product_id=checkout_data.get('product_id'),
            product_name=checkout_data.get('product_name'),
            price=unit_price,
            quantity=quantity,
            total_price=total_price,
            description="Custom Tester Pack",
            cart=[],
            gender="Unisex",
            stock=99,
            size=checkout_data.get('packet_size', ''),
            Product_count=1,
            thumbnail=checkout_data.get('thumbnail') or url_for('static', filename='images/images.jpeg'),
            boxes=checkout_data.get('boxes', []),
            packet_size=checkout_data.get('packet_size', '')
        )

    # For GET requests without session data: show empty checkout page
    print("🟡 Rendering empty checkout page")
    return render_template(
        'checkout.html',
        product_id=None,
        product_name="",
        price=0.0,
        quantity=0,
        total_price=0.0,
        cart=[],
        gender="",
        stock=0,
        size="",
        Product_count=0,
        thumbnail="",
        boxes=[],
        packet_size="",
        perfumes=[]
    )


@routes_bp.route('/checkout/cart', methods=['GET', 'POST'])
def checkout_cart():
    if request.method == 'POST':
        # Get form data safely
        price = float(request.form.get('price') or 0)
        quantity = int(request.form.get('quantity') or 1)
        final_price = float(request.form.get('final_price') or price)
        bottle_size = request.form.get('bottleSize') or ''

        cart_item = {
            'product_id': request.form.get('product_id'),
            'product_name': request.form.get('product_name'),
            'price': price,
            'description': request.form.get('description') or '',
            'final_price': final_price,
            'quantity': quantity,
            'gender': request.form.get('gender'),
            'stock': int(request.form.get('stock') or 0),
            'bottleSize': bottle_size,
            'thumbnail': request.form.get('thumbnail') or '',
        }

        # Calculate total price
        cart_item['total_price'] = cart_item['final_price'] * cart_item['quantity']

        # Initialize cart if not in session
        if 'cart' not in session:
            session['cart'] = []

        # Check for existing item (by product_id + bottleSize)
        found = False
        for item in session['cart']:
            if item['product_id'] == cart_item['product_id'] and item.get('bottleSize', '') == bottle_size:
                item['quantity'] += cart_item['quantity']
                item['total_price'] = item['final_price'] * item['quantity']
                found = True
                break

        # If item not found, append as new
        if not found:
            session['cart'].append(cart_item)

        session.modified = True
        print("SESSION DATA:", session['cart'])
        return redirect(url_for('routes.checkout_cart'))

    # Ensure cart items are well-formed before rendering
    cart = session.get('cart', [])
    for item in cart:
        item['final_price'] = item.get('final_price', item.get('price', 0))
        item['quantity'] = item.get('quantity', 1)
        item['total_price'] = item['final_price'] * item['quantity']
        if 'bottleSize' not in item and 'bottle_size' in item:
            item['bottleSize'] = item['bottle_size']

    return render_template("cart.html", cart=cart)



@routes_bp.route('/checkout/remove', methods=['POST'])
def remove_cart_item():
    product_id = request.form.get('product_id')
    bottle_size = request.form.get('bottleSize') or ''
    packet_size_str = request.form.get('packet_size') or ''
    fragrance_id = request.form.get('fragrance_id') or ''
    item_index = request.form.get('item_index')

    print(f"🗑️ Remove request - product_id: {product_id}, bottle_size: {bottle_size}, "
          f"packet_size: {packet_size_str}, fragrance_id: {fragrance_id}, index: {item_index}")

    # ✅ Handle removing a custom perfume from Buy Now direct checkout session first
    if 'buy_now_item' in session:
        buy_now_item = session['buy_now_item']
        perfumes = buy_now_item.get('perfumes', [])
        new_perfumes = [p for p in perfumes if p.get('fragrance_id') != fragrance_id]
        print(f"[REMOVE] Removing custom perfume with fragrance_id: {fragrance_id} from buy_now_item. Remaining: {len(new_perfumes)}")
        if len(new_perfumes) == 0:
            session.pop('buy_now_item', None)
        else:
            buy_now_item['perfumes'] = new_perfumes
            buy_now_item['quantity'] = len(new_perfumes)
            total_price = 0.0
            for p in new_perfumes:
                price_str = p.get("price", "0")
                try:
                    perfume_price = float(price_str) if price_str and price_str != "—" else 0.0
                except (ValueError, TypeError):
                    perfume_price = 0.0
                total_price += perfume_price
            buy_now_item['total_price'] = total_price
            session['buy_now_item'] = buy_now_item
        session.modified = True
        return redirect(url_for('routes.checkout'))

    if 'cart' in session:
        original_count = len(session['cart'])

        if item_index is not None:
            try:
                index = int(item_index)
                if 0 <= index < len(session['cart']):
                    removed_item = session['cart'].pop(index)
                    session.modified = True
                    print(f"✅ Removed item at index {index}: {removed_item}")
                else:
                    print(f"❌ Invalid index: {index}")
            except ValueError:
                print(f"❌ Invalid index format: {item_index}")

        else:
            new_cart = []
            removed_count = 0

            for item in session['cart']:
                should_remove = False

                print(f"📦 Checking item: {item}")

                # 🧴 Remove custom perfume by fragrance_id
                if item.get('is_custom_perfume'):
                    if item.get('fragrance_id') == fragrance_id and removed_count == 0:
                        should_remove = True
                        removed_count = 1
                        print(f"✅ Removing custom perfume with fragrance_id: {fragrance_id}")

                # 🧪 Remove tester pack (old logic)
                elif 'packet_size' in item and product_id == 'tester_pack':
                    item_packet_size = str(item.get('packet_size', ''))
                    if item_packet_size == packet_size_str and removed_count == 0:
                        should_remove = True
                        removed_count = 1
                        print(f"✅ Removing tester pack with packet_size: {packet_size_str}")

                # 🛍️ Remove regular product
                elif 'product_id' in item:
                    if item.get('product_id') == product_id and item.get('bottleSize', '') == bottle_size:
                        should_remove = True
                        print(f"✅ Removing regular item with product_id: {product_id}")

                if not should_remove:
                    new_cart.append(item)

            session['cart'] = new_cart
            session.modified = True

        new_count = len(session.get('cart', []))
        print(f"🛒 Cart items: {original_count} → {new_count}")

    return redirect(url_for('routes.checkout_cart'))


# =======================
# 🛒 CART CHECKOUT ROUTE
# =======================
@routes_bp.route("/save-data", methods=["POST"])
def save_data():
    cart = session.get('cart', [])
    if not cart:
        return "Cart is empty", 400

    # 🚚 Shipping and payment details
    details = {
        "first_name": request.form.get("firstName"),
        "last_name": request.form.get("lastName"),
        "address": request.form.get("address1"),
        "email": request.form.get("email"),
        "phone": request.form.get("phone"),
        "city": request.form.get("city"),
        "state": request.form.get("state"),
        "zip_code": request.form.get("zip"),
        "payment_method": request.form.get("payment_method")
    }

    # 🧮 Totals
    total_quantity = sum(item['quantity'] for item in cart)
    total_price = sum(item['total_price'] for item in cart)

    # 📦 Order Numbers
    order_count = orders_collection.count_documents({}) + 1
    tracking_number = f"SS03{order_count:04d}"
    order_id = f"RA1108{order_count:03d}"

    order_data = {
        "order_id": order_id,
        "tracking_number": tracking_number,
        "created_at": datetime.utcnow(),
        "status": "Pending",
        "details": details,
        "products": cart,
        "total_quantity": total_quantity,
        "total_price": total_price
    }

    inserted = orders_collection.insert_one(order_data)

    # 🔁 Update stock
    for item in cart:
        if "product_id" not in item:
            continue  # skip tester packs or malformed items

        try:
            product_oid = ObjectId(item['product_id'])
            product = products_collection.find_one({'_id': product_oid})
            if not product:
                continue

            current_stock = product.get('stock', 0)
            ordered_quantity = item['quantity']
            updated_stock = current_stock - ordered_quantity

            if updated_stock < 0:
                continue

            products_collection.update_one(
                {'_id': product_oid},
                {'$set': {'stock': updated_stock, 'update_at': datetime.utcnow()}}
            )
        except (InvalidId, TypeError) as e:
            print(f"❌ Error updating stock: {e}")


    # 🧹 Clear cart and session data
    if 'cart' in session:
        session.pop('cart')
        session.modified = True
    
    # Clear buy_now_item and checkout_data after processing
    if 'buy_now_item' in session:
        session.pop('buy_now_item')
        session.modified = True
    
    if 'checkout_data' in session:
        session.pop('checkout_data')
        session.modified = True

    # 🔐 Encrypt and redirect
    encrypted_id = serializer.dumps(str(inserted.inserted_id))
    return redirect(url_for('routes.checkout_summary', token=encrypted_id))



# ============================
# ⚡ BUY NOW (DIRECT CHECKOUT)
# ============================

@routes_bp.route("/buy-now", methods=["POST"])
def buy_now():
    # Check if this is a tester checkout
    checkout_data = session.get('checkout_data')
    
    if checkout_data:
        # Handle tester pack checkout
        quantity = int(request.form.get("product_quantity") or checkout_data.get('quantity', 1))
        final_price = float(request.form.get("price") or checkout_data.get('final_price', 0))
        total_price = final_price * quantity
        
        # Duplicate or truncate boxes selections to match quantity
        boxes = checkout_data.get('boxes', [])
        if boxes:
            if len(boxes) < quantity:
                last_box = boxes[-1]
                while len(boxes) < quantity:
                    boxes.append(last_box)
            elif len(boxes) > quantity:
                boxes = boxes[:quantity]
        
        cart = [{
            "product_id": checkout_data.get('product_id', 'tester_pack'),
            "product_name": checkout_data.get('product_name'),
            "packet_size": checkout_data.get('packet_size'),
            "quantity": quantity,
            "boxes": boxes,
            "price": final_price,
            "product_price": final_price,
            "final_price": final_price,
            "total_price": total_price,
            "description": "Custom Tester Pack",
            "thumbnail": checkout_data.get('thumbnail') or url_for('static', filename='images/images.jpeg'),
            "bottleSize": checkout_data.get('packet_size', ''),
            "gender": "Unisex",
            "stock": 99,
            "is_tester": True
        }]
    elif session.get('buy_now_item'):
        # Handle custom perfume buy now checkout with multiple items
        buy_now_item = session.get('buy_now_item')
        perfumes = buy_now_item.get('perfumes', [])
        
        # Create separate cart items for each perfume
        cart = []
        for perfume in perfumes:
            # Handle price conversion safely
            price_str = perfume.get("price", "0")
            try:
                perfume_price = float(price_str) if price_str and price_str != "—" else 0.0
            except (ValueError, TypeError):
                perfume_price = 0.0
            
            cart_item = {
                "product_id": f"custom_perfume_{perfume.get('fragrance_id', 'unknown')}",
                "product_name": perfume.get("fragrance_name", "Custom Perfume"),
                "quantity": 1,  # Each perfume is a separate item with quantity 1
                "price": perfume_price,
                "product_price": perfume_price,
                "final_price": perfume_price,
                "total_price": perfume_price,  # Since quantity is 1
                "description": "Custom Perfume",
                "thumbnail": perfume.get("bottle_image", ""),
                "bottleSize": perfume.get("size", ""),
                "gender": "Unisex",
                "stock": 99,
                "is_custom_perfume": True,
                "fragrance_id": perfume.get("fragrance_id"),
                "perfume_number": perfume.get("perfume_number", 0)
            }
            cart.append(cart_item)
        
        # Calculate totals
        quantity = len(cart)  # Total number of perfume items
        total_price = sum(item["total_price"] for item in cart)
    else:
        # Handle regular product checkout
        try:
            product_id = request.form.get("product_id")
            product_name = request.form.get("product_name")
            price = float(request.form.get("price") or 0)
            final_price = float(request.form.get("final_price") or price)
            quantity = int(request.form.get("product_quantity") or 1)
            total_price = final_price * quantity
            thumbnail = request.form.get("product_thumbnail")
            bottleSize = request.form.get("size")
            description = request.form.get("description")
            gender = request.form.get("gender")
            stock = int(request.form.get("stock") or 0)

            cart = [{
                "product_id": product_id,
                "product_name": product_name,
                "price": price,
                "final_price": final_price,
                "quantity": quantity,
                "description": description,
                "total_price": total_price,
                "thumbnail": thumbnail,
                "bottleSize": bottleSize,
                "gender": gender,
                "stock": stock
            }]
        except Exception as e:
            print("❌ Error building Buy Now cart:", e)
            return "Invalid product details", 400

    # 🚚 Shipping and payment details
    details = {
        "first_name": request.form.get("firstName"),
        "last_name": request.form.get("lastName"),
        "address": request.form.get("address1"),
        "email": request.form.get("email"),
        "phone": request.form.get("phone"),
        "city": request.form.get("city"),
        "state": request.form.get("state"),
        "zip_code": request.form.get("zip"),
        "payment_method": request.form.get("payment_method")
    }

    # 📦 Order Numbers
    order_count = orders_collection.count_documents({}) + 1
    tracking_number = f"SS03{order_count:04d}"
    order_id = f"RA1108{order_count:03d}"

    order_data = {
        "order_id": order_id,
        "tracking_number": tracking_number,
        "created_at": datetime.utcnow(),
        "status": "Pending",
        "details": details,
        "products": cart,
        "total_quantity": quantity,
        "total_price": total_price
    }

    inserted = orders_collection.insert_one(order_data)

    # 🔁 Update stock (only for regular products, not testers or custom perfumes)
    if not checkout_data:  # Only update stock for regular products
        try:
            p_id = cart[0].get('product_id')
            if p_id and not p_id.startswith("custom_perfume"):
                product_oid = ObjectId(p_id)
                product = products_collection.find_one({'_id': product_oid})
                if product:
                    current_stock = product.get('stock', 0)
                    updated_stock = current_stock - quantity
                    if updated_stock >= 0:
                        products_collection.update_one(
                            {'_id': product_oid},
                            {'$set': {'stock': updated_stock, 'update_at': datetime.utcnow()}}
                        )
        except (InvalidId, TypeError) as e:
            print(f"❌ Error updating stock: {e}")

    # 🧹 Clear direct checkout data from session
    session.pop('checkout_data', None)
    session.pop('buy_now_item', None)
    session.modified = True

    # 🔐 Encrypt and redirect
    encrypted_id = serializer.dumps(str(inserted.inserted_id))
    return redirect(url_for('routes.checkout_summary', token=encrypted_id))


@routes_bp.route('/checkout/summary', methods=['GET'])
def checkout_summary():
    token = request.args.get('token')
    if not token:
        return redirect(url_for('routes.home'))

    try:
        from bson.objectid import ObjectId
        order_id = serializer.loads(token)
        order = orders_collection.find_one({"_id": ObjectId(order_id)})
    except Exception:
        return "Invalid or expired token", 400
    print()
    if not order:
        return "Order not found", 404
    
    # ✅ Encrypt the tracking number
    encrypted_tracking = ""
    if 'tracking_number' in order:
        encrypted_tracking = serializer.dumps(order['tracking_number'])

    return render_template("summary.html", order=order, encrypted_tracking=encrypted_tracking)



@routes_bp.route('/tracking', methods=['GET', 'POST'])
def tracking():
    tracking_number = None
    matched_order = None
    tracking_not_found = False

    if request.method == 'POST':
        tracking_number = request.form.get('trackingNumber')
        print("📦 Tracking number received from form:", tracking_number)

        orders = get_orders_details()

        for order in orders:
            if order.get("tracking_number") == tracking_number:
                matched_order = order

                

        if not matched_order:
            tracking_not_found = True
            print("❌ Tracking number not found.")

    return render_template("tracking.html",
                           tracking_number=tracking_number,
                           order=matched_order,
                           tracking_not_found=tracking_not_found)



@routes_bp.route('/about', methods=['GET', 'POST'])
def about():
    
    
    return render_template("about.html")

@routes_bp.route('/contact', methods=['GET', 'POST'])
def contact():
    return render_template("contact.html")

@routes_bp.route('/blog', methods=['GET', 'POST'])
def blog():
    return render_template("blog.html")


@routes_bp.route('/testers')
def testers():
    # Unpack list products (fragrances)
    list_products, _ = get_list_products()

    # Get only tester products
    testers, _ = get_tester_products()

    # ✅ For fragrances: use ID + Name (not Mongo _id)
    fragrances = [
        {"ID": product["ID"], "Name": product["name"]}
        for product in list_products
    ]

    return render_template(
        "custom-tester.html",
        list_products=list_products,
        testers=testers,
        fragrances=fragrances
    )



@routes_bp.route("/tester/add_to_cart", methods=["POST"])
def add_to_cart():
    data = request.get_json()

    # ✅ Debug what came from frontend
    print("=== Incoming add_to_cart payload ===")
    print(data)

    # ✅ Normalise keys & pricing for cart integration
    data["is_tester"] = True
    unit_price = float(data.get("price") or data.get("product_price", 0))
    quantity = int(data.get("quantity", 1))
    data["price"] = unit_price
    data["product_price"] = unit_price
    data["final_price"] = unit_price
    data["total_price"] = unit_price * quantity
    data["bottleSize"] = data.get("packet_size", "")
    data["gender"] = "Unisex"
    data["stock"] = 99
    data["thumbnail"] = data.get("thumbnail") or url_for('static', filename='images/images.jpeg')

    # Store cart in session
    cart = session.get("cart", [])
    cart.append(data)

    # ✅ Debug what cart looks like now
    print("=== Session cart after append ===")
    print(cart)

    session["cart"] = cart
    session.modified = True

    return jsonify({
        "status": "success",
        "message": "Tester pack added to cart!",
        "cart": cart,  # this will show in browser console too
        "redirect_url": url_for("routes.checkout_cart")
    })



# === Buy Now Route ===
@routes_bp.route("/tester/buy_now", methods=["POST"])
def tester_buy_now():
    data = request.get_json()
    print("=== DEBUG: Incoming Tester Buy Now Data ===")
    print(data)
    print("==========================================")

    # Calculate final price
    quantity = data.get("quantity", 1)
    product_price = data.get("product_price", 0)

    # ✅ Clear any custom perfume buy now data first
    if 'buy_now_item' in session:
        session.pop('buy_now_item')
        print("[CLEANUP] Cleared old buy_now_item from session")

    # Save to session (for checkout page)
    session["checkout_data"] = {
        "product_id": data.get("product_id"),
        "product_name": data.get("product_name"),
        "packet_size": data.get("packet_size"),
        "quantity": quantity,
        "boxes": data.get("boxes", []),
        "final_price": product_price,   # Store the unit price of one pack!
        "thumbnail": data.get("thumbnail") or url_for('static', filename='images/images.jpeg')
    }

    session.modified = True

    print(f"[TESTER] Tester pack unit price: {product_price}, quantity: {quantity}")
    return jsonify({
        "status": "success",
        "message": "Proceeding to checkout...",
        "final_price": product_price * quantity,
        "redirect_url": url_for("routes.checkout")  # redirect to checkout page
    })




@routes_bp.route('/custom')
def custom_perfume():
    
    list_products, _ = get_list_products()  # Get fragrances with names
    perfumes, _ = get_perfume_products()    # Get bottle images
    
    # Create pricing data structure for JavaScript
    pricing_data = {}
    for product in list_products:
        pricing_data[product['_id']] = product.get('pricing', {})
    

    return render_template("custom-perfume.html",
                            list_products=list_products,
                            perfumes=perfumes,
                            pricing_data=pricing_data
    )


@routes_bp.route('/custom/buy-now', methods=['POST'])
def custom_buy_now():
    print("🔍 DEBUG: custom_buy_now route called")
    data = request.get_json()
    print(f"🔍 DEBUG: Received JSON data: {data}")

    # Handle the perfumes array from frontend
    perfumes = data.get("perfumes", [])
    total_quantity = int(data.get("total_quantity", 1))
    
    # Handle total_price conversion safely
    total_price_str = data.get("total_price", "0")
    try:
        total_price = float(total_price_str) if total_price_str and total_price_str != "—" else 0.0
    except (ValueError, TypeError):
        total_price = 0.0

    print(f"🔍 DEBUG: Parsed data - perfumes: {len(perfumes)}, quantity: {total_quantity}, total_price: {total_price}")

    if not perfumes:
        print("❌ DEBUG: No perfumes selected")
        return jsonify({"status": "error", "message": "No perfumes selected"}), 400

    # For buy-now, we'll use the first perfume as the main one
    # But we need to handle multiple if quantity > 1
    first_perfume = perfumes[0]

    perfume_name = first_perfume.get("fragrance_name", "Custom Perfume")
    perfume_image = first_perfume.get("bottle_image", "")
    
    # Handle price conversion safely
    price_str = first_perfume.get("price", "0")
    try:
        perfume_price = float(price_str) if price_str and price_str != "—" else 0.0
    except (ValueError, TypeError):
        perfume_price = 0.0
    
    ml = int(first_perfume.get("size", "0").replace("ml", ""))

    # ✅ CLEAR ANY EXISTING SESSION DATA FIRST
    if 'checkout_data' in session:
        session.pop('checkout_data')
        print("🧹 Cleared old checkout_data from session")
    
    # If quantity > 1, we need to create multiple items
    # For now, let's aggregate them into one buy_now_item
    session['buy_now_item'] = {
        "perfume_name": perfume_name,
        "perfume_image": perfume_image,
        "perfume_price": perfume_price,
        "ml": ml,
        "quantity": total_quantity,
        "total_price": total_price,
        "perfumes": perfumes  # Store all perfumes data
    }

    session.modified = True

    print("✅ BUY NOW DATA RECEIVED:")
    print(f"Perfumes: {perfumes}")
    print(f"Total Quantity: {total_quantity}")
    print(f"Total Price: {total_price}")
    print(f"Session buy_now_item: {session['buy_now_item']}")
    print(f"🔍 DEBUG: buy_now_item stored in session successfully")

    return jsonify({
        "status": "success",
        "message": "Buy Now item saved",
        "perfume_name": perfume_name,
        "perfume_image": perfume_image,
        "perfume_price": perfume_price,
        "ml": ml,
        "quantity": total_quantity,
        "total_price": total_price
    })
# ============ Route 3: Custom Add to Cart ============
@routes_bp.route('/custom/add-to-cart', methods=['POST'])
def custom_add_to_cart():
    data = request.get_json()

    # Handle the perfumes array from frontend
    perfumes = data.get("perfumes", [])
    total_quantity = int(data.get("total_quantity", 1))
    
    # Handle total_price conversion safely
    total_price_str = data.get("total_price", "0")
    try:
        total_price = float(total_price_str) if total_price_str and total_price_str != "—" else 0.0
    except (ValueError, TypeError):
        total_price = 0.0

    if not perfumes:
        return jsonify({"status": "error", "message": "No perfumes selected"}), 400

    # Add each perfume to cart
    if 'cart' not in session:
        session['cart'] = []

    for perfume in perfumes:
        # Handle price conversion safely
        price_str = perfume.get("price", "0")
        try:
            perfume_price = float(price_str) if price_str and price_str != "—" else 0.0
        except (ValueError, TypeError):
            perfume_price = 0.0
            
        cart_item = {
            "product_id": f"custom_perfume_{perfume.get('fragrance_id', 'unknown')}",
            "product_name": perfume.get("fragrance_name", "Custom Perfume"),
            "price": perfume_price,
            "product_price": perfume_price,
            "final_price": perfume_price,
            "quantity": total_quantity,
            "total_price": perfume_price * total_quantity,
            "description": "Custom Perfume",
            "thumbnail": perfume.get("bottle_image") or url_for('static', filename='images/placeholder.png'),
            "bottleSize": perfume.get("size", ""),
            "gender": "Unisex",
            "stock": 99,
            "is_custom_perfume": True,
            "fragrance_id": perfume.get("fragrance_id")
        }
        session['cart'].append(cart_item)

    session.modified = True

    print("✅ ADD TO CART DATA RECEIVED:")
    print(f"Perfumes: {perfumes}")
    print(f"Total Quantity: {total_quantity}")
    print(f"Total Price: {total_price}")
    print(f"Cart items added: {len(perfumes)}")

    return jsonify({
        "status": "success",
        "message": f"{len(perfumes)} items added to cart",
        "cart_count": len(session['cart']),
        "added_items": len(perfumes)
    })

from datetime import datetime

# Add this context processor to make 'now' available in templates
@routes_bp.context_processor
def inject_now():
    return {'now': datetime.now}

@routes_bp.route('/debug/clear-session')
def debug_clear_session():
    """Temporary route to clear session for testing"""
    session.clear()
    session.modified = True
    print("🧹 DEBUG: Session cleared")
    return redirect('/')