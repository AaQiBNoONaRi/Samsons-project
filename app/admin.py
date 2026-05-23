from flask import Blueprint, render_template, request, redirect, url_for, session, flash, current_app, jsonify
import bcrypt
import shutil
import hashlib
from bson import ObjectId
from app.utils import get_dashboard_metrics, get_inventory_alerts, get_top_selling_products # print_all_product_stocks
from werkzeug.utils import secure_filename
from app.database import admin_collection, orders_collection
from app.database import get_admin_data, get_products, get_orders_details, users_collection, products_collection, get_list_products, get_perfume_products, get_tester_products # adjust the import path based on your structure
import os
from app.utils import admin_login_required
from datetime import datetime
from app.config import Config
from pymongo import MongoClient



client = MongoClient(Config.MONGO_URI)
db = client[Config.DATABASE_NAME]

admin_bp = Blueprint("admin", __name__, url_prefix="/viaadmin/")

@admin_bp.route("/", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        # Find admin by username/email
        admin = admin_collection.find_one({"username": email})

        if admin and bcrypt.checkpw(password.encode("utf-8"), admin["password"]):
            session["admin_logged_in"] = True
            session["admin_email"] = email
            # Create a hash session using admin _id and secret key
            secret = current_app.config.get("SECRET_KEY", "default_secret")
            session["admin_hash"] = hashlib.sha256((str(admin["_id"]) + secret).encode()).hexdigest()
            return redirect(url_for("admin.admin_dashboard"))
        else:
            return render_template("admin/login.html", error="Wrong username or password")

    return render_template("admin/login.html")


@admin_bp.route("/dashboard", methods=["GET"])
@admin_login_required
def admin_dashboard():
    # print_all_product_stocks(products_collection)

    metrics = get_dashboard_metrics(orders_collection, users_collection)
    inventory_alerts = get_inventory_alerts(products_collection)
    total_products = products_collection.count_documents({})
    return render_template("admin/dashboard.html", **metrics, total_products=total_products, inventory_alerts=inventory_alerts)


@admin_bp.route("/queries", methods=["GET"])
@admin_login_required
def admin_queries():
    from app.database import get_queries_details
    queries, total_queries = get_queries_details()
    
    pending_queries = sum(1 for q in queries if q['status'] == 'pending')
    responded_queries = sum(1 for q in queries if q['status'] == 'responded')
    
    return render_template(
        "admin/queries.html", 
        queries=queries, 
        total_queries=total_queries,
        pending_queries=pending_queries,
        responded_queries=responded_queries
    )

@admin_bp.route("/queries/<query_id>/mark_responded", methods=["POST"])
@admin_login_required
def mark_query_responded(query_id):
    from app.database import db
    db.queries.update_one({"_id": ObjectId(query_id)}, {"$set": {"status": "responded"}})
    return jsonify({"success": True, "message": "Query marked as responded."})

@admin_bp.route("/queries/<query_id>/delete", methods=["POST", "DELETE"])
@admin_login_required
def delete_query(query_id):
    from app.database import db
    db.queries.delete_one({"_id": ObjectId(query_id)})
    return jsonify({"success": True, "message": "Query deleted successfully."})

@admin_bp.route("/queries/<query_id>/respond", methods=["POST"])
@admin_login_required
def respond_query(query_id):
    from app.database import db
    data = request.get_json() or {}
    response_subject = data.get("subject", "Response to your inquiry")
    response_message = data.get("message", "")
    
    db.queries.update_one(
        {"_id": ObjectId(query_id)},
        {"$set": {
            "status": "responded",
            "response_subject": response_subject,
            "response_message": response_message
        }}
    )
    return jsonify({"success": True, "message": "Response saved successfully."})

@admin_bp.route("/costumers", methods=["GET"])
@admin_login_required
def costumers():
    costumers = get_admin_data()
    return render_template("admin/costumers.html", costumers=costumers)


@admin_bp.route("/add/product", methods=["GET", "POST"])
@admin_login_required
def add_product():
    if request.method == "POST":
        # Get form values
        name = request.form.get("product_name")
        category = request.form.get("category")
        type_ = request.form.get("type")
        description = request.form.get("description")
        sku = request.form.get("sku")
        stock_raw = request.form.get("stock")
        try:
            stock = int(stock_raw) if stock_raw else 0
        except ValueError:
            flash("Invalid stock quantity.")
            return redirect(url_for("admin.add_product"))
        tags = request.form.get("tags", "")
        price = request.form.get("price")
        Volume = request.form.get("Volume")
        status = request.form.get("status") or "inactive"
        discount_price = request.form.get("discount_price")
        discount_start = request.form.get("discount_start_date")
        discount_end = request.form.get("discount_end_date")

        # Convert tags to dict
        tag_list = tags.split(',') if tags else []
        tag_dict = {str(i + 1): tag.strip() for i, tag in enumerate(tag_list)}

        # Get uploaded files
        thumbnail_files = request.files.getlist("thumbnail_images[]")
        product_images = request.files.getlist("product_images[]")

        # Debug: Show number of files received
        print(f"📷 Received thumbnails: {len(thumbnail_files)}")
        print(f"📷 Received product images: {len(product_images)}")

        # Validate thumbnail count
        if len(thumbnail_files) > 2:
            flash("You can upload a maximum of 2 thumbnails.")
            return redirect(url_for("admin.add_product"))

        # Validate price inputs
        try:
            price = float(price.replace(",", "")) if price else 0.0

        except ValueError:
            flash("Invalid price entered.")
            return redirect(url_for("admin.add_product"))

        try:
           discount_price = float(discount_price.replace(",", "")) if discount_price else None
        except ValueError:
            flash("Invalid discount price entered.")
            return redirect(url_for("admin.add_product"))
        
        
        # Define upload directories
        base_path = os.path.abspath(os.path.join(os.path.dirname(current_app.root_path), 'static/products'))
        product_folder = os.path.join(base_path, name.replace(" ", "_"))
        thumbnail_folder = os.path.join(product_folder, "thumbnail")
        variant_folder = os.path.join(product_folder, "variant")

        os.makedirs(thumbnail_folder, exist_ok=True)
        os.makedirs(variant_folder, exist_ok=True)

        print(f"📁 Uploading thumbnails to: {thumbnail_folder}")
        print(f"📁 Uploading variants to: {variant_folder}")

        # Save thumbnails
        saved_thumbnails = []
        for i, file in enumerate(thumbnail_files):
            print(f"🟡 Thumbnail {i} filename: {file.filename}")
            if file and file.filename:
                filename = secure_filename(f"{i}_{file.filename}")
                filepath = os.path.join(thumbnail_folder, filename)
                try:
                    file.save(filepath)
                    saved_thumbnails.append(f"/static/products/{name.replace(' ', '_')}/thumbnail/{filename}")
                    print(f"✅ Saved thumbnail: {filepath}")
                except Exception as e:
                    print(f"❌ Failed to save thumbnail {filename}: {e}")

        # Save product images
        saved_product_images = []
        for i, file in enumerate(product_images):
            print(f"🟠 Product image {i} filename: {file.filename}")
            if file and file.filename:
                filename = secure_filename(f"{i}_{file.filename}")
                filepath = os.path.join(variant_folder, filename)
                try:
                    file.save(filepath)
                    saved_product_images.append(f"/static/products/{name.replace(' ', '_')}/variant/{filename}")
                    print(f"✅ Saved product image: {filepath}")
                except Exception as e:
                    print(f"❌ Failed to save product image {filename}: {e}")

        # Log saved image paths
        print("📸 Saved Thumbnails:", saved_thumbnails)
        print("📸 Saved Product Images:", saved_product_images)

        # Build product document
        product_data = {
            "name": name,
            "category": category,
            "type": type_,
            "Volume": Volume,
            "description": description,
            "sku": sku,
            "stock": stock,
            "tags": tag_dict,
            "price": price,
            "discount_price": discount_price,
            "discount_start": discount_start,
            "discount_end": discount_end,
            "thumbnails": saved_thumbnails,
            "images": saved_product_images,
            "created_at": datetime.utcnow(),
            "status": status,
        }

        # Insert into MongoDB
        # Insert into MongoDB with confirmation
        try:
            insert_result = db.products.insert_one(product_data)
            print("✅ Product inserted. ID:", insert_result.inserted_id)

    # Just to confirm it's saved, fetch and print the last product
            last_product = db.products.find_one({"_id": insert_result.inserted_id})
            print("🧾 Last inserted product from DB:", last_product)
        except Exception as e:
            print("❌ Insert failed:", e)
            flash("Product insert failed.")
            return redirect(url_for("admin.add_product"))
        print("🔎 FORM DATA:", request.form)

        flash("Product added successfully!")
        return redirect(url_for("admin.products"))


    return render_template("admin/add_products.html", product=None, datetime=datetime)



@admin_bp.route("/products", methods=["GET", "POST"])
@admin_login_required
def products():
    products_data = get_products()
    
    # Check if get_products() returns a tuple (products, count) or just products
    if isinstance(products_data, tuple):
        products, total_products = products_data
    else:
        products = products_data
        total_products = len(products)
    
    return render_template("admin/products.html", products=products)

def rename_or_merge_product_folder(product, old_name, new_name, db, product_id, base_path):
    """
    Renames or merges the product folders and updates DB image paths.
    """
    old_folder = old_name.replace(" ", "_")
    new_folder = new_name.replace(" ", "_")
    old_path = os.path.join(base_path, old_folder)
    new_path = os.path.join(base_path, new_folder)

    if old_name == new_name:
        return new_folder, new_path

    try:
        if os.path.exists(old_path):
            if os.path.exists(new_path):
                # Merge contents if new folder already exists
                for filename in os.listdir(old_path):
                    src = os.path.join(old_path, filename)
                    dst = os.path.join(new_path, filename)

                    # Overwrite existing file or folder
                    if os.path.exists(dst):
                        if os.path.isfile(dst):
                            os.remove(dst)
                        elif os.path.isdir(dst):
                            shutil.rmtree(dst)

                    shutil.move(src, dst)

                os.rmdir(old_path)
                print(f"📁 Merged folder: {old_path} → {new_path}")
            else:
                # Simple rename
                os.rename(old_path, new_path)
                print(f"📁 Renamed folder: {old_path} → {new_path}")

            # Update DB image paths
            def update_image_path(img_path):
                return img_path.replace(
                    f"/static/products/{old_folder}/",
                    f"/static/products/{new_folder}/"
                )

            updated_thumbnails = [update_image_path(p) for p in product.get("thumbnails", [])]
            updated_images = [update_image_path(p) for p in product.get("images", [])]

            db.products.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"thumbnails": updated_thumbnails, "images": updated_images}}
            )
            print(f"✅ Updated image paths in DB for product {product_id}")

    except Exception as e:
        print("❌ Failed to rename/merge folder:", e)
        flash("Failed to rename product folder. Check permissions.")
        raise

    return new_folder, new_path


@admin_bp.route("/edit/product/<product_id>", methods=["GET", "POST"])
@admin_login_required
def edit_product(product_id):
    product = db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        flash("Product not found.")
        return redirect(url_for("admin.products"))

    product["thumbnails"] = product.get("thumbnails", [])
    product["images"] = product.get("images", [])

    if request.method == "POST":
        old_name = product["name"]

        # Parse tags
        tags_raw = request.form.get("tags", "")
        tag_list = [t.strip() for t in tags_raw.split(",") if t.strip()]
        tag_dict = {str(i + 1): tag for i, tag in enumerate(tag_list)}

        # Collect updated fields
        new_name = request.form.get("product_name", "").strip()

        # Validate stock quantity
        stock_raw = request.form.get("stock")
        try:
            stock = int(stock_raw) if stock_raw else 0
        except ValueError:
            flash("Invalid stock quantity.")
            return redirect(url_for("admin.edit_product", product_id=product_id))

        # Validate price
        price_raw = request.form.get("price")
        try:
            price = float(price_raw.replace(",", "")) if price_raw else 0.0
        except ValueError:
            flash("Invalid price entered.")
            return redirect(url_for("admin.edit_product", product_id=product_id))

        # Validate discount price
        discount_price_raw = request.form.get("discount_price")
        try:
            if discount_price_raw not in [None, '', 'None', '0', 0]:
                discount_price = float(str(discount_price_raw).replace(",", ""))
            else:
                discount_price = None
        except ValueError:
            flash("Invalid discount price entered.")
            return redirect(url_for("admin.edit_product", product_id=product_id))

        updated_data = {
            "name": new_name,
            "category": request.form.get("category", "").strip(),
            "type": request.form.get("type", "").strip(),
            "description": request.form.get("description", "").strip(),
            "sku": request.form.get("sku", "").strip(),
            "stock": stock,
            "price": price,
            "Volume": request.form.get("Volume", "").strip(),
            "discount_price": discount_price,
            "discount_start": request.form.get("discount_start_date"),
            "discount_end": request.form.get("discount_end_date"),
            "status": request.form.get("status", "inactive"),
            "tags": tag_dict
        }

        # Base path for products
        base_path = os.path.abspath(os.path.join(os.path.dirname(current_app.root_path), 'static/products'))

        # Rename or merge folders
        try:
            new_folder, new_path = rename_or_merge_product_folder(
                product, old_name, new_name, db, product_id, base_path
            )
        except Exception:
            return redirect(url_for("admin.edit_product", product_id=product_id))

        # Ensure subfolders exist
        thumb_path = os.path.join(new_path, "thumbnail")
        variant_path = os.path.join(new_path, "variant")
        os.makedirs(thumb_path, exist_ok=True)
        os.makedirs(variant_path, exist_ok=True)

        # Save uploaded images
        saved_variants = []

        # --- Thumbnail images: replace slots at correct indices, never append ---
        # Start from the existing thumbnails in the DB (already updated to new folder paths above)
        existing_product = db.products.find_one({"_id": ObjectId(product_id)})
        existing_thumbnails = existing_product.get("thumbnails", [])

        # Map existing thumbnails to their correct slot (0 or 1) based on their prefix filename
        updated_thumbnails = [None, None]
        for path in existing_thumbnails:
            filename_part = os.path.basename(path)
            if filename_part.startswith("0_"):
                updated_thumbnails[0] = path
            elif filename_part.startswith("1_"):
                updated_thumbnails[1] = path
            else:
                if updated_thumbnails[0] is None:
                    updated_thumbnails[0] = path
                else:
                    updated_thumbnails[1] = path

        new_thumb_files = request.files.getlist("thumbnail_images[]")
        for file in new_thumb_files:
            if file and file.filename:
                # Find the first available empty slot
                slot_idx = 0
                if updated_thumbnails[0] is not None:
                    slot_idx = 1
                if slot_idx == 1 and updated_thumbnails[1] is not None:
                    slot_idx = 0 # Fallback overwrite first slot if both filled

                filename = secure_filename(f"{slot_idx}_{file.filename}")
                new_file_path = os.path.join(thumb_path, filename)
                new_db_path = f"/static/products/{new_folder}/thumbnail/{filename}"

                # Delete old thumbnail file at this slot if it exists
                old_db_path = updated_thumbnails[slot_idx]
                if old_db_path:
                    old_abs_path = os.path.join(
                        os.path.abspath(os.path.join(os.path.dirname(current_app.root_path), '')),
                        old_db_path.lstrip('/')
                    )
                    if os.path.exists(old_abs_path) and os.path.abspath(old_abs_path) != os.path.abspath(new_file_path):
                        try:
                            os.remove(old_abs_path)
                        except Exception as e:
                            print(f"⚠️ Could not remove old thumbnail: {e}")

                file.save(new_file_path)
                updated_thumbnails[slot_idx] = new_db_path
                print(f"✅ Replaced thumbnail slot {slot_idx}: {new_db_path}")

        # Remove any None placeholders
        final_thumbnails = [t for t in updated_thumbnails if t is not None]
        db.products.update_one({"_id": ObjectId(product_id)}, {"$set": {"thumbnails": final_thumbnails}})
        print(f"📸 Updated thumbnails in DB: {final_thumbnails}")

        # Variant images
        existing_variants = list(existing_product.get("images", []))
        updated_variants = list(existing_variants)

        new_variant_files = request.files.getlist("product_images[]")
        for i, file in enumerate(new_variant_files):
            if file and file.filename:
                filename = secure_filename(f"{i}_{file.filename}")
                path = os.path.join(variant_path, filename)
                file.save(path)
                new_variant_db_path = f"/static/products/{new_folder}/variant/{filename}"

                # Replace at index i if it exists, otherwise append
                if i < len(updated_variants):
                    updated_variants[i] = new_variant_db_path
                else:
                    updated_variants.append(new_variant_db_path)

        if new_variant_files and any(f.filename for f in new_variant_files if f):
            db.products.update_one({"_id": ObjectId(product_id)}, {"$set": {"images": updated_variants}})

        # Update product data
        db.products.update_one({"_id": ObjectId(product_id)}, {"$set": updated_data})

        flash("Product updated successfully!")
        return redirect(url_for("admin.products"))

    return render_template("admin/add_products.html", product=product, datetime=datetime)

@admin_bp.route("/delete/product/<product_id>", methods=["POST"])
@admin_login_required
def delete_product(product_id):
    result = db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count:
        flash("Product deleted successfully!")
    else:
        flash("Product not found or could not be deleted.")
    return redirect(url_for("admin.products"))

@admin_bp.route("/delete/products", methods=["POST"])
def delete_multiple_products():
    from bson import ObjectId
    data = request.get_json()
    product_ids = data.get("product_ids", [])

    if not product_ids:
        return jsonify({"success": False, "message": "No product IDs received."}), 400

    try:
        object_ids = [ObjectId(pid) for pid in product_ids]
        result = db.products.delete_many({"_id": {"$in": object_ids}})
        return jsonify({"success": True, "message": f"{result.deleted_count} product(s) deleted."})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@admin_bp.route("/delete/thumbnail/<product_id>", methods=["POST"])
@admin_login_required
def delete_thumbnail(product_id):
    image_path = request.form.get("image_path")
    db.products.update_one({"_id": ObjectId(product_id)}, {"$pull": {"thumbnails": image_path}})
    abs_path = os.path.join(current_app.root_path, image_path.strip("/"))
    if os.path.exists(abs_path): os.remove(abs_path)
    flash("Thumbnail deleted.")
    return redirect(url_for("admin.edit_product", product_id=product_id))


@admin_bp.route("/delete/variant/<product_id>", methods=["POST"])
@admin_login_required
def delete_variant(product_id):
    image_path = request.form.get("image_path")
    db.products.update_one({"_id": ObjectId(product_id)}, {"$pull": {"images": image_path}})
    abs_path = os.path.join(current_app.root_path, image_path.strip("/"))
    if os.path.exists(abs_path): os.remove(abs_path)
    flash("Variant deleted.")
    return redirect(url_for("admin.edit_product", product_id=product_id))


@admin_bp.route("/clear/thumbnails/<product_id>", methods=["POST"])
@admin_login_required
def clear_all_thumbnails(product_id):
    product = db.products.find_one({"_id": ObjectId(product_id)})
    for path in product.get("thumbnails", []):
        abs_path = os.path.join(current_app.root_path, path.strip("/"))
        if os.path.exists(abs_path): os.remove(abs_path)
    db.products.update_one({"_id": ObjectId(product_id)}, {"$set": {"thumbnails": []}})
    flash("All thumbnails cleared.")
    return redirect(url_for("admin.edit_product", product_id=product_id))


@admin_bp.route("/clear/variants/<product_id>", methods=["POST"])
@admin_login_required
def clear_all_variants(product_id):
    product = db.products.find_one({"_id": ObjectId(product_id)})
    for path in product.get("images", []):
        abs_path = os.path.join(current_app.root_path, path.strip("/"))
        if os.path.exists(abs_path): os.remove(abs_path)
    db.products.update_one({"_id": ObjectId(product_id)}, {"$set": {"images": []}})
    flash("All variant images cleared.")
    return redirect(url_for("admin.edit_product", product_id=product_id))

@admin_bp.route("/orders", methods=["GET"])
@admin_login_required
def orders():
    orders = get_orders_details()
    total_orders = orders_collection.count_documents({})

    # Define all status options
    status_options = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Complete"]

    # Get status counts for stats display
    pending_orders = orders_collection.count_documents({"status": "Pending"})
    confirmed_orders = orders_collection.count_documents({"status": "Confirmed"})
    shipped_orders = orders_collection.count_documents({"status": "Shipped"})
    delivered_orders = orders_collection.count_documents({"status": "Delivered"})
    cancelled_orders = orders_collection.count_documents({"status": "Cancelled"})
    complete_orders = orders_collection.count_documents({"status": "Complete"})

    return render_template(
        "admin/orders.html",
        orders=orders,
        total_orders=total_orders,
        status_options=status_options,
        pending_orders=pending_orders,
        confirmed_orders=confirmed_orders,
        shipped_orders=shipped_orders,
        delivered_orders=delivered_orders,
        cancelled_orders=cancelled_orders,
        complete_orders=complete_orders
    )


@admin_bp.route("/update-status/<order_id>", methods=["POST"])
@admin_login_required
def update_order_status(order_id):
    from bson import ObjectId
    new_status = request.json.get("status")

    result = orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )

    if result.modified_count == 1:
        return jsonify(success=True)
    else:
        return jsonify(success=False)
    
    
@admin_bp.route("/delete-order/<order_id>", methods=["POST"])
@admin_login_required
def delete_order(order_id):
    from bson import ObjectId
    result = orders_collection.delete_one({"_id": ObjectId(order_id)})

    if result.deleted_count == 1:
        return jsonify(success=True)
    else:
        return jsonify(success=False)
    
    
@admin_bp.route("/edit-order/<order_id>", methods=["GET"])
@admin_login_required
def edit_order(order_id):
    from bson import ObjectId
    order = orders_collection.find_one({"_id": ObjectId(order_id)})

    if not order:
        return "Order not found", 404

    order["_id"] = str(order["_id"])  # Convert ObjectId to string for templates
    return render_template("admin/edit-order.html", order=order)



@admin_bp.route("/update-order/<order_id>", methods=["POST"])
@admin_login_required
def update_order(order_id):
    from bson import ObjectId
    
    order = orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        return "Order not found", 404

    # Keep existing products list and update the first item in-place
    products = order.get("products", [])
    if isinstance(products, list) and len(products) > 0:
        first_product = products[0]
        if isinstance(first_product, dict):
            first_product["product_name"] = request.form.get("product_name")
            if "bottleSize" in first_product:
                first_product["bottleSize"] = request.form.get("size")
            if "bottle_size" in first_product:
                first_product["bottle_size"] = request.form.get("size")
            first_product["gender"] = request.form.get("gender")
            first_product["quantity"] = int(request.form.get("quantity") or 0)
            
            # Recalculate price totals safely
            try:
                price = float(first_product.get("price") or 0.0)
            except (ValueError, TypeError):
                price = 0.0
            first_product["total_price"] = price * first_product["quantity"]
            products[0] = first_product

    updated_data = {
        "status": request.form.get("status"),
        "details": {
            "first_name": request.form.get("first_name"),
            "last_name": request.form.get("last_name"),
            "address": request.form.get("address"),
            "email": request.form.get("email"),
            "phone": request.form.get("phone"),
            "city": request.form.get("city"),
            "state": request.form.get("state"),
            "zip_code": request.form.get("zip_code"),
            "payment_method": request.form.get("payment_method"),
        },
        "product": {
            "name": request.form.get("product_name"),
            "size": request.form.get("size"),
            "gender": request.form.get("gender"),
            "thumbnail": request.form.get("thumbnail") or (products[0].get("thumbnail") if products and isinstance(products[0], dict) else ""),
            "quantity": int(request.form.get("quantity") or 0),
            "subtotal": float(request.form.get("subtotal") or 0.0),
        },
        "products": products
    }

    result = orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": updated_data}
    )

    return redirect(url_for('admin.orders'))


@admin_bp.route("/analytics", methods=["GET"])
@admin_login_required
def analytics():
    metrics = get_dashboard_metrics(orders_collection, users_collection)
    inventory_alerts = get_inventory_alerts(products_collection)
    top_products = get_top_selling_products(orders_collection)

    return render_template(
        "admin/analytics.html",
        metrics=metrics,
        inventory_alerts=inventory_alerts,
        top_products=top_products
    )
    
from flask import Blueprint, jsonify
from pymongo import MongoClient
from datetime import datetime, timedelta
from bson.json_util import dumps
import pytz    
        
@admin_bp.route('/chart-data')
def get_chart_data():
    from collections import defaultdict

    # Timezone adjustment (Pakistan Time)
    pk_tz = pytz.timezone('Asia/Karachi')
    today = datetime.now(pk_tz).replace(hour=0, minute=0, second=0, microsecond=0)

    # Prepare last 7 days
    date_labels = []
    daily_sales = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        next_day = day + timedelta(days=1)

        # Fetch orders for this day
        orders = orders_collection.find({
            'created_at': {'$gte': day, '$lt': next_day}
        })

        day_total = 0
        for order in orders:
            products_raw = order.get('products', [])
            if isinstance(products_raw, dict):
                products_list = list(products_raw.values())
            elif isinstance(products_raw, list):
                products_list = products_raw
            else:
                products_list = []
            for p in products_list:
                if isinstance(p, dict):
                    day_total += p.get('total_price', 0)

        date_labels.append(day.strftime('%a'))
        daily_sales.append(day_total)

    # Default status list
    statuses = ['Pending', 'Confirm', 'Shipped', 'Delivered', 'Cancelled']
    status_count = {status: 0 for status in statuses}

    # Fetch actual counts
    pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    result = orders_collection.aggregate(pipeline)
    for item in result:
        status = item['_id'] if item['_id'] else 'Unknown'
        if status in status_count:
            status_count[status] = item['count']
        else:
            status_count[status] = item['count']  # add unexpected statuses too

    return jsonify({
        'sales': {
            'labels': date_labels,
            'data': daily_sales
        },
        'status': {
            'labels': list(status_count.keys()),
            'data': list(status_count.values())
        }
    })

@admin_bp.route("/marketing", methods=["GET"])
@admin_login_required
def marketing():
    # Extract unique customers from orders
    orders = list(orders_collection.find())
    customer_dict = {}

    for order in orders:
        email = order.get("details", {}).get("email")
        if not email:
            continue

        if email not in customer_dict:
            customer_dict[email] = {
                "name": f"{order.get('details', {}).get('first_name', '')} {order.get('details', {}).get('last_name', '')}",
                "email": email,
                "phone": order.get("details", {}).get("phone", ""),
                "city": order.get("details", {}).get("city", ""),
                "state": order.get("details", {}).get("state", ""),
                "zip_code": order.get("details", {}).get("zip_code", ""),
                "address": order.get("details", {}).get("address", ""),
                "payment_method": order.get("details", {}).get("payment_method", ""),
                "orders_count": 1,
            }
        else:
            customer_dict[email]["orders_count"] += 1

    enhanced_customers = list(customer_dict.values())
    total_customers = len(enhanced_customers)
    active_customers = len([c for c in enhanced_customers if c["orders_count"] > 0])
    messages_sent = 0  # Optional counter

    return render_template("admin/marketing.html",
                           customers=enhanced_customers,
                           total_customers=total_customers,
                           active_customers=active_customers,
                           messages_sent=messages_sent)



@admin_bp.route("/send-bulk-message", methods=["POST"])
@admin_login_required
def send_bulk_message():
    try:
        data = request.get_json()
        message = data.get("message", "").strip()
        numbers = data.get("numbers", [])
        
        if not message:
            return jsonify({"success": False, "error": "Message cannot be empty"})
        
        if not numbers:
            return jsonify({"success": False, "error": "No phone numbers provided"})
        
        # Here you would integrate with your SMS service
        # For now, we'll just simulate success
        success_count = 0
        failed_numbers = []
        
        for number in numbers:
            if number and number != "N/A":
                # Simulate sending message
                # In real implementation, integrate with SMS API like Twilio, etc.
                try:
                    # send_sms(number, message)  # Your SMS sending function
                    success_count += 1
                    print(f"📱 Bulk message sent to {number}: {message}")
                except Exception as e:
                    failed_numbers.append(number)
                    print(f"❌ Failed to send to {number}: {e}")
        
        if success_count > 0:
            return jsonify({
                "success": True, 
                "message": f"Message sent to {success_count} customers successfully!",
                "sent_count": success_count,
                "failed_count": len(failed_numbers)
            })
        else:
            return jsonify({"success": False, "error": "Failed to send messages to any customers"})
            
    except Exception as e:
        print(f"❌ Bulk message error: {e}")
        return jsonify({"success": False, "error": "Server error occurred"})


@admin_bp.route("/send-individual-message", methods=["POST"])
@admin_login_required
def send_individual_message():
    try:
        data = request.get_json()
        message = data.get("message", "").strip()
        number = data.get("number", "").strip()
        
        if not message:
            return jsonify({"success": False, "error": "Message cannot be empty"})
        
        if not number or number == "N/A":
            return jsonify({"success": False, "error": "Valid phone number required"})
        
        # Here you would integrate with your SMS service
        # For now, we'll just simulate success
        try:
            # send_sms(number, message)  # Your SMS sending function
            print(f"📱 Individual message sent to {number}: {message}")
            return jsonify({"success": True, "message": "Message sent successfully!"})
        except Exception as e:
            print(f"❌ Failed to send message: {e}")
            return jsonify({"success": False, "error": "Failed to send message"})
            
    except Exception as e:
        print(f"❌ Individual message error: {e}")
        return jsonify({"success": False, "error": "Server error occurred"})   
    

@admin_bp.route('/tracking')
@admin_login_required
def tracking():
    orders = get_orders_details()  # You already have this helper
    return render_template('admin/tracking.html', orders=orders)


# 📋 Route for List page
@admin_bp.route('/list_items')
@admin_login_required
def list_items():
    perfume_items, total_items = get_list_products()
    bottles, total_bottles = get_perfume_products()

    return render_template(
        'admin/list.html',
        items=perfume_items,
        total_items=total_items,
        bottles=bottles,
        total_bottles=total_bottles
    )


@admin_bp.route('/update_list_status/<item_id>', methods=['POST'])
@admin_login_required
def update_list_status(item_id):
    from bson import ObjectId, errors
    data = request.get_json() or {}
    new_status = data.get('status')

    if not new_status:
        return jsonify({'success': False, 'message': 'No status provided'}), 400

    try:
        oid = ObjectId(item_id)
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid ID'}), 400

    result = db[Config.list_collection].update_one(
        {"_id": oid},
        {"$set": {"status": new_status}}
    )

    if result.modified_count > 0:
        return jsonify({'success': True})
    else:
        # Could be no change; still return success
        return jsonify({'success': True, 'message': 'No change or not found'})


@admin_bp.route('/add_list', methods=['POST'])
@admin_login_required
def add_list():
    try:
        list_number = request.form.get('listNumber')
        name = request.form.get('fragranceName')
        type_ = request.form.get('fragranceType')
        category = request.form.get('category')
        price = request.form.get('price')

        # Convert/validate
        try:
            list_number_val = int(list_number) if list_number else 0
        except ValueError:
            list_number_val = 0

        try:
            price_val = float(price) if price else 0.0
        except ValueError:
            price_val = 0.0

        list_data = {
            "ID": list_number_val,
            "Name": name,
            "Type": type_,
            "Category": category,
            "Price": price_val,
            "status": "Active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        db[Config.list_collection].insert_one(list_data)
        flash("Fragrance list item added successfully!")
    except Exception as e:
        print(f"Error adding list item: {e}")
        flash("Failed to add list item.")

    return redirect(url_for('admin.list_items'))


@admin_bp.route('/add_bottle', methods=['POST'])
@admin_login_required
def add_bottle():
    try:
        size = request.form.get('size')
        if not size or size not in ['30', '50', '100']:
            flash("Invalid bottle size selected.")
            return redirect(url_for('admin.list_items'))

        uploaded_files = request.files.getlist('images')
        saved_paths = []

        # base path for bottle images: static/images/perfume-bottle/<size>
        base_path = os.path.abspath(os.path.join(os.path.dirname(current_app.root_path), 'static/images/perfume-bottle', size))
        os.makedirs(base_path, exist_ok=True)

        for file in uploaded_files:
            if file and file.filename:
                filename = secure_filename(file.filename)
                filepath = os.path.join(base_path, filename)
                file.save(filepath)
                # Store relative path for template url_for matching
                saved_paths.append(f"static/images/perfume-bottle/{size}/{filename}")

        if saved_paths:
            perfume_doc = db[Config.perfume_collection].find_one()
            if not perfume_doc:
                # Insert initial doc
                insert_res = db[Config.perfume_collection].insert_one({
                    "images": {
                        "30": [],
                        "50": [],
                        "100": []
                    }
                })
                doc_id = insert_res.inserted_id
            else:
                doc_id = perfume_doc['_id']

            db[Config.perfume_collection].update_one(
                {"_id": doc_id},
                {"$push": {f"images.{size}": {"$each": saved_paths}}}
            )
            flash("Bottle image(s) uploaded successfully!")
        else:
            flash("No files were uploaded.")

    except Exception as e:
        print(f"Error uploading bottle: {e}")
        flash("An error occurred while uploading the bottle.")

    return redirect(url_for('admin.list_items'))


@admin_bp.route("/edit/tracking/<order_id>", methods=["GET", "POST"])
@admin_login_required
def edit_tracking(order_id):
    from bson import ObjectId, errors
    try:
        order = orders_collection.find_one({"_id": ObjectId(order_id)})
    except errors.InvalidId:
        return "Invalid tracking ID", 404
    if not order:
        return "Tracking not found", 404
    # Handle GET/POST logic here
    return render_template("admin/edit-tracking.html", order=order)

@admin_bp.route("/delete/tracking/<order_id>", methods=["POST"])
@admin_login_required
def delete_tracking(order_id):
    from bson import ObjectId, errors
    try:
        result = orders_collection.delete_one({"_id": ObjectId(order_id)})
    except errors.InvalidId:
        return "Invalid tracking ID", 404
    if result.deleted_count:
        flash("Tracking deleted successfully!")
    else:
        flash("Tracking not found or could not be deleted.")
    return redirect(url_for("admin.tracking"))



@admin_bp.route('/update_tracking_status/<order_id>', methods=['POST'])
def update_tracking_status(order_id):
    data = request.get_json()
    new_status = data.get('status')

    if not new_status:
        return jsonify({'success': False, 'message': 'No status provided'}), 400

    result = orders_collection.update_one(
        {'_id': ObjectId(order_id)},
        {'$set': {'status': new_status, 'updated_at': datetime.utcnow()}}
    )

    if result.modified_count > 0:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Order not updated'})


@admin_bp.route('/delete_bottle_image', methods=['POST'])
@admin_login_required
def delete_bottle_image():
    try:
        data = request.get_json() or {}
        size = data.get('size')
        img_path = data.get('image_path')

        if not size or not img_path:
            return jsonify({'success': False, 'message': 'Missing size or image path'}), 400

        perfume_doc = db[Config.perfume_collection].find_one()
        if not perfume_doc:
            return jsonify({'success': False, 'message': 'No bottles found'}), 404

        db[Config.perfume_collection].update_one(
            {"_id": perfume_doc['_id']},
            {"$pull": {f"images.{size}": img_path}}
        )

        abs_path = os.path.abspath(os.path.join(os.path.dirname(current_app.root_path), img_path))
        if os.path.exists(abs_path):
            try:
                os.remove(abs_path)
            except Exception as e:
                print(f"⚠️ Warning: Could not delete physical file: {e}")

        return jsonify({'success': True, 'message': 'Bottle image deleted successfully!'})
    except Exception as e:
        print(f"❌ Error deleting bottle image: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/import_list', methods=['POST'])
@admin_login_required
def import_list():
    import csv
    import io
    from datetime import datetime
    
    if 'csv_file' not in request.files:
        return jsonify({'success': False, 'message': 'No file uploaded'}), 400
        
    file = request.files['csv_file']
    if not file or file.filename == '':
        return jsonify({'success': False, 'message': 'Empty file selection'}), 400
        
    if not file.filename.endswith('.csv'):
        return jsonify({'success': False, 'message': 'File must be a CSV (.csv)'}), 400
        
    try:
        # Read the file content
        stream = io.StringIO(file.stream.read().decode("utf-8"), newline=None)
        csv_reader = csv.reader(stream)
        
        rows = list(csv_reader)
        if not rows:
            return jsonify({'success': False, 'message': 'CSV file is empty'}), 400
            
        # Determine if first row is a header
        first_row = rows[0]
        has_header = False
        if len(first_row) > 0:
            val = first_row[0].strip().lower()
            if val in ['id', 'number', 'no', 's.no', 'sno'] or not val.isdigit():
                has_header = True
                
        start_idx = 1 if has_header else 0
        
        inserted_items = []
        
        for row in rows[start_idx:]:
            if not row or len(row) < 5:
                # Skip empty rows or rows with insufficient columns
                continue
                
            # Extract columns: ID, Name, Type, Category, Price
            try:
                item_id = str(row[0]).strip()
                name = str(row[1]).strip()
                type_val = str(row[2]).strip()
                category = str(row[3]).strip()
                price_str = str(row[4]).strip().replace('Rs.', '').replace('Rs', '').replace('$', '').replace(',', '').strip()
                price = float(price_str) if price_str else 0.0
            except Exception as parse_err:
                print(f"⚠️ Parsing row error: {parse_err} on row {row}")
                continue
                
            if not item_id or not name:
                continue
                
            item_data = {
                "ID": item_id,
                "Name": name,
                "Type": type_val,
                "Category": category,
                "Price": price,
                "status": "Active",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            inserted_items.append(item_data)
            
        if not inserted_items:
            return jsonify({'success': False, 'message': 'No valid rows found to import'}), 400
            
        # Insert many into MongoDB list collection
        result = db[Config.list_collection].insert_many(inserted_items)
        count = len(result.inserted_ids)
        
        return jsonify({'success': True, 'count': count})
        
    except Exception as e:
        print(f"❌ CSV Import error: {e}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500


@admin_bp.route('/delete_list_item/<item_id>', methods=['POST'])
@admin_login_required
def delete_list_item(item_id):
    from bson import ObjectId
    try:
        try:
            oid = ObjectId(item_id)
        except Exception:
            return jsonify({'success': False, 'message': 'Invalid ID format'}), 400
            
        result = db[Config.list_collection].delete_one({"_id": oid})
        
        if result.deleted_count > 0:
            return jsonify({'success': True, 'message': 'Fragrance deleted successfully!'})
        else:
            return jsonify({'success': False, 'message': 'Item not found in database'}), 404
            
    except Exception as e:
        print(f"❌ Error deleting fragrance item: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# ==========================================
# 🧪 ADMIN CUSTOM TESTER CRUD MANAGEMENT
# ==========================================

@admin_bp.route('/testers', methods=['GET'])
@admin_login_required
def testers():
    testers_list, total_testers = get_tester_products()
    
    # If testers collection is completely empty, insert a default signature configuration
    if total_testers == 0:
        default_tester = {
            "name": "Samsons Signature Tester",
            "type": "tester",
            "available": True,
            "currency": "PKR",
            "packets": [
                {"size": 3, "price": 700},
                {"size": 6, "price": 1000}
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        db[Config.testers_collection].insert_one(default_tester)
        testers_list, total_testers = get_tester_products()

    return render_template(
        'admin/testers.html',
        testers=testers_list,
        total_testers=total_testers
    )


@admin_bp.route('/add_tester', methods=['POST'])
@admin_login_required
def add_tester():
    name = request.form.get('testerName')
    if not name:
        flash("Tester name is required", "warning")
        return redirect(url_for('admin.testers'))
        
    tester_data = {
        "name": name,
        "type": "tester",
        "available": True,
        "currency": "PKR",
        "packets": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    db[Config.testers_collection].insert_one(tester_data)
    flash("Tester configuration added successfully!", "success")
    return redirect(url_for('admin.testers'))


@admin_bp.route('/add_tester_packet', methods=['POST'])
@admin_login_required
def add_tester_packet():
    tester_id = request.form.get('testerId')
    size_str = request.form.get('packetSize')
    price_str = request.form.get('packetPrice')

    if not tester_id or not size_str or not price_str:
        flash("All packet fields are required", "warning")
        return redirect(url_for('admin.testers'))

    try:
        size = int(size_str)
        price = float(price_str)
    except ValueError:
        flash("Invalid packet size or price format", "danger")
        return redirect(url_for('admin.testers'))

    try:
        oid = ObjectId(tester_id)
    except Exception:
        flash("Invalid Tester ID format", "danger")
        return redirect(url_for('admin.testers'))

    tester = db[Config.testers_collection].find_one({"_id": oid})
    if not tester:
        flash("Tester config not found", "danger")
        return redirect(url_for('admin.testers'))

    # Handle packet image upload if provided
    image_url = None
    if 'packetImage' in request.files:
        file = request.files['packetImage']
        if file and file.filename:
            filename = secure_filename(f"tester_{tester_id}_{size}_{file.filename}")
            # Ensure upload folder exists
            upload_folder = os.path.abspath(os.path.join(current_app.root_path, 'static/uploads/testers'))
            os.makedirs(upload_folder, exist_ok=True)
            filepath = os.path.join(upload_folder, filename)
            try:
                file.save(filepath)
                image_url = f"/static/uploads/testers/{filename}"
                print(f"✅ Saved packet image: {filepath}")
            except Exception as e:
                print(f"❌ Failed to save packet image {filename}: {e}")

    packets = tester.get('packets', [])
    
    # If packet size already exists, update price & image, else add new
    existing_packet = next((p for p in packets if p.get('size') == size), None)
    if existing_packet:
        if not image_url:
            image_url = existing_packet.get('image')
            
        db[Config.testers_collection].update_one(
            {"_id": oid, "packets.size": size},
            {"$set": {
                "packets.$.price": price, 
                "packets.$.image": image_url,
                "updated_at": datetime.utcnow()
            }}
        )
        flash(f"Updated configuration for {size}-tester packet to Rs. {price}", "success")
    else:
        db[Config.testers_collection].update_one(
            {"_id": oid},
            {
                "$push": {
                    "packets": {
                        "size": size, 
                        "price": price, 
                        "image": image_url
                    }
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        flash(f"Added {size}-tester packet configuration", "success")

    return redirect(url_for('admin.testers'))


@admin_bp.route('/delete_tester_packet/<tester_id>/<int:size>', methods=['POST'])
@admin_login_required
def delete_tester_packet(tester_id, size):
    try:
        oid = ObjectId(tester_id)
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid ID'}), 400

    result = db[Config.testers_collection].update_one(
        {"_id": oid},
        {
            "$pull": {"packets": {"size": size}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    if result.modified_count > 0:
        return jsonify({'success': True, 'message': f'Packet of size {size} deleted successfully!'})
    return jsonify({'success': False, 'message': 'Packet configuration not found'}), 404


@admin_bp.route('/toggle_tester_availability/<tester_id>', methods=['POST'])
@admin_login_required
def toggle_tester_availability(tester_id):
    try:
        oid = ObjectId(tester_id)
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid ID'}), 400

    tester = db[Config.testers_collection].find_one({"_id": oid})
    if not tester:
        return jsonify({'success': False, 'message': 'Tester not found'}), 404

    new_val = not tester.get('available', False)
    db[Config.testers_collection].update_one(
        {"_id": oid},
        {"$set": {"available": new_val, "updated_at": datetime.utcnow()}}
    )

    return jsonify({'success': True, 'available': new_val})


@admin_bp.route('/delete_tester/<tester_id>', methods=['POST'])
@admin_login_required
def delete_tester(tester_id):
    try:
        oid = ObjectId(tester_id)
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid ID'}), 400

    result = db[Config.testers_collection].delete_one({"_id": oid})
    if result.deleted_count > 0:
        return jsonify({'success': True, 'message': 'Tester config deleted successfully!'})
    return jsonify({'success': False, 'message': 'Tester config not found'}), 404