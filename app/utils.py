from datetime import datetime, timedelta
from functools import wraps
import hashlib
from app.database import admin_collection
from flask import session, redirect, url_for, flash, current_app

def get_dashboard_metrics(orders_collection, users_collection):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)

    week_start = today_start - timedelta(days=today_start.weekday())  # Monday
    last_week_start = week_start - timedelta(weeks=1)
    last_week_end = week_start
    

    month_start = today_start.replace(day=1)
    last_month_end = month_start
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)

    last_30_days = now - timedelta(days=30)

    # --- Percent Change ---
    def percent_change(current, previous):
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return ((current - previous) / previous) * 100

    # --- Helpers ---
    def get_sales_total(start, end=None):
        match = {"created_at": {"$gte": start}}
        if end:
            match["created_at"]["$lt"] = end
        result = orders_collection.aggregate([
            {"$match": match},
            {"$unwind": "$products"},
            {"$group": {"_id": None, "total": {"$sum": "$products.total_price"}}}
        ])
        return next(result, {}).get("total", 0)

    def get_count(collection, date_field, start, end=None):
        query = {date_field: {"$gte": start}}
        if end:
            query[date_field]["$lt"] = end
        return collection.count_documents(query)

    # --- Sales ---
    today_sales = get_sales_total(today_start)
    yesterday_sales = get_sales_total(yesterday_start, today_start)
    this_week_sales = get_sales_total(week_start)
    last_week_sales = get_sales_total(last_week_start, last_week_end)
    this_month_sales = get_sales_total(month_start)
    last_month_sales = get_sales_total(last_month_start, last_month_end)
    last_30_days_sales = get_sales_total(last_30_days)

    # --- Orders ---
    orders_today = get_count(orders_collection, "created_at", today_start)
    orders_yesterday = get_count(orders_collection, "created_at", yesterday_start, today_start)
    orders_this_week = get_count(orders_collection, "created_at", week_start)
    orders_last_week = get_count(orders_collection, "created_at", last_week_start, last_week_end)
    orders_this_month = get_count(orders_collection, "created_at", month_start)
    orders_last_month = get_count(orders_collection, "created_at", last_month_start, last_month_end)

    # --- Customers ---
    customers_today = get_count(users_collection, "registered_at", today_start)
    customers_yesterday = get_count(users_collection, "registered_at", yesterday_start, today_start)
    customers_this_week = get_count(users_collection, "registered_at", week_start)
    customers_last_week = get_count(users_collection, "registered_at", last_week_start, last_week_end)
    customers_this_month = get_count(users_collection, "registered_at", month_start)
    customers_last_month = get_count(users_collection, "registered_at", last_month_start, last_month_end)

    # --- Totals ---
    total_sales_all_time = get_sales_total(datetime(2000, 1, 1))  # or your project start date

    # --- Final Metrics ---
    return {
        "total_sales": round(total_sales_all_time, 2),
        "total_orders": orders_collection.count_documents({}),
        "total_customers": users_collection.count_documents({}),
        "total_revenue": round(total_sales_all_time * 0.75, 2),  # Assuming 75% profit

        "revenue_last_30_days": round(last_30_days_sales, 2),

        # Daily
        "sales_daily_change": round(percent_change(today_sales, yesterday_sales), 2),
        "orders_daily_change": round(percent_change(orders_today, orders_yesterday), 2),
        "customers_daily_change": round(percent_change(customers_today, customers_yesterday), 2),

        # Weekly
        "sales_weekly_change": round(percent_change(this_week_sales, last_week_sales), 2),
        "orders_weekly_change": round(percent_change(orders_this_week, orders_last_week), 2),
        "customers_weekly_change": round(percent_change(customers_this_week, customers_last_week), 2),

        # Monthly
        "sales_monthly_change": round(percent_change(this_month_sales, last_month_sales), 2),
        "orders_monthly_change": round(percent_change(orders_this_month, orders_last_month), 2),
        "customers_monthly_change": round(percent_change(customers_this_month, customers_last_month), 2)
    }
def get_inventory_alerts(products_collection, low_stock_threshold=5):
    now = datetime.utcnow()
    low_stock_alerts = []
    out_of_stock_alerts = []

    # 🕒 Helper: Human-readable time difference
    def humanize_time_diff(time_delta):
        seconds = time_delta.total_seconds()
        if seconds < 60:
            return f"{int(seconds)} seconds ago"
        elif seconds < 3600:
            return f"{int(seconds // 60)} minutes ago"
        elif seconds < 86400:
            return f"{int(seconds // 3600)} hours ago"
        else:
            return f"{int(seconds // 86400)} days ago"

    # 📦 Query for products with missing or low stock
    query = {
        "$or": [
            {"stock": {"$lte": low_stock_threshold}},
            {"stock": {"$exists": False}},
            {"stock": {"$type": "string"}},
            {"stock": None}
        ]
    }

    projection = {"product_name": 1, "name": 1, "stock": 1, "updated_at": 1}

    # 🧠 Sort by most recently updated
    products = products_collection.find(query, projection).sort("updated_at", -1)

    for product in products:
        name = product.get("product_name") or product.get("name") or "Unnamed Product"

        # 🔒 Try to convert stock to integer safely
        try:
            stock = int(product.get("stock", 0))
        except (ValueError, TypeError):
            stock = 0

        # 🕒 Time since last stock update
        updated_at = product.get("updated_at")
        if not isinstance(updated_at, datetime):
            updated_at = now
        time_diff = now - updated_at
        time_ago = humanize_time_diff(time_diff)

        # 🚨 Alert Conditions
        if stock == 0:
            out_of_stock_alerts.append({
                "type": "danger",
                "title": f"Out of Stock: {name}",
                "description": "This product is currently out of stock.",
                "time": time_ago
            })
        elif stock <= low_stock_threshold:
            low_stock_alerts.append({
                "type": "warning",
                "title": f"Low Stock: {name}",
                "description": f"Only {stock} items left in stock.",
                "time": time_ago
            })

    return low_stock_alerts + out_of_stock_alerts


# def print_all_product_stocks(products_collection):
#     print("📦 All Product Stocks:\n")

#     products = products_collection.find({}, {"_id": 0, "product_name": 1, "name": 1, "stock": 1})

#     for product in products:
#         name = product.get("product_name") or product.get("name") or "Unnamed Product"
#         stock = product.get("stock", "N/A")

#         print(f"🛒 {name} → Stock: {stock}")


def admin_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("admin_logged_in") or not session.get("admin_email") or not session.get("admin_hash"):
            flash("Please log in as admin to access this page.", "warning")
            return redirect(url_for("admin.admin_login"))
        # Verify hash
        admin = admin_collection.find_one({"username": session["admin_email"]})
        if not admin:
            session.clear()
            flash("Session invalid. Please log in again.", "warning")
            return redirect(url_for("admin.admin_login"))
        secret = current_app.config.get("SECRET_KEY", "default_secret")
        expected_hash = hashlib.sha256((str(admin["_id"]) + secret).encode()).hexdigest()
        if session["admin_hash"] != expected_hash:
            session.clear()
            flash("Session tampered. Please log in again.", "danger")
            return redirect(url_for("admin.admin_login"))
        return f(*args, **kwargs)
    return decorated_function

def get_top_selling_products(orders_collection, top_n=10):
    pipeline = [
        {"$unwind": "$products"},
        {"$group": {
            "_id": {
                "product_id": "$products.product_id",
                "product_name": "$products.product_name"
            },
            "total_quantity": {"$sum": "$products.quantity"},
            "total_revenue": {"$sum": "$products.total_price"},
            "order_count": {"$sum": 1}
        }},
        {"$sort": {"total_quantity": -1}},  # or sort by "total_revenue"
        {"$limit": top_n}
    ]

    results = list(orders_collection.aggregate(pipeline))

    top_products = []
    for item in results:
        top_products.append({
            "product_id": item["_id"]["product_id"],
            "product_name": item["_id"]["product_name"],
            "total_quantity": item["total_quantity"],
            "total_revenue": item["total_revenue"],
            "order_count": item["order_count"]
        })

    return top_products


