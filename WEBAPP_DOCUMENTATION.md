# Web App Documentation

## Overview

This project is a Flask-based perfume/e-commerce web application backed by MongoDB. It has two main areas:

- Public storefront for browsing products, managing cart/checkout, tracking orders, and viewing content pages.
- Admin portal for authentication, product management, order management, analytics, and customer/marketing tools.

The application uses server-side sessions, MongoDB collections for persistence, and static image folders for product media.

## Application Entry Point

- [main.py](main.py) creates the Flask app through `create_app()` and exposes `application` for Gunicorn.
- [app/__init__.py](app/__init__.py) configures Flask, initializes Flask-Session, connects to MongoDB, and registers blueprints.
- Public routes are mounted at `/` through the `routes` blueprint.
- Admin routes are mounted at `/viaadmin/` through the `admin` blueprint.

## Configuration

- [app/config.py](app/config.py) stores the core runtime settings.
- MongoDB connection target: `mongodb://localhost:27017`
- Database name: `samsuns`
- Collections used by the app:
  - `users`
  - `admin`
  - `products`
  - `orders`
  - `testimonials`
  - `testers`
  - `List`

## Module Responsibilities

### `app/database.py`

This module defines the MongoDB client and collection handles, plus helper functions that format data for templates.

- `format_datetime()` formats timestamps for display.
- `get_admin_data()` returns customer-like records from the `users` collection with registration and last-login timestamps.
- `get_products()` returns product data for the admin product list.
- `get_orders_details()` returns order data with customer and product line-item details.
- `get_testimonials()` returns testimonial records with masked email addresses.

### `app/utils.py`

This module contains reusable business logic shared by the admin views.

- `get_dashboard_metrics()` computes daily, weekly, monthly, and all-time sales, orders, and customer metrics.
- `get_inventory_alerts()` detects low-stock and out-of-stock products.
- `admin_login_required()` protects admin routes and validates the admin session hash.
- `get_top_selling_products()` computes product ranking data from the orders collection.

### `app/routes.py`

This module defines the public storefront behavior, including browsing, login, cart, checkout, tracking, and content pages.

### `app/admin.py`

This module defines the admin login flow and the management interface for products, orders, analytics, and marketing.

## Public Site Features

### Home Page

Route: `/`

The home page loads all products and groups them into storefront sections:

- Men products
- Women products
- Unisex products
- Sale products
- Hot deals
- Best sellers
- Latest products
- Latest women products
- Testimonials
- Cart count from the session

### Product Listing

Route: `/products`

This page shows all products and also splits them by category:

- Male
- Female
- Unisex
- Attar

### Product Details

Route: `/products/details/<product_id>`

This page loads one product and finds related products using:

- Matching brand and category
- Category fallback
- Brand fallback

If the product id is invalid or not found, the route returns a 404 template.

### Login and Registration

Route: `/login`

This route supports both registration and login through the same endpoint.

- Registration inserts a new `users` record.
- Login checks `email` and `password` against the `users` collection.
- Successful login stores the user in the Flask session and updates `last_login`.

### Logout

Route: `/logout`

This clears the `user` session key and returns the visitor to the home page.

### Checkout Flow

Route: `/checkout`

This route supports both GET and POST checkout behavior.

- GET renders a blank checkout page.
- POST builds a checkout view from the selected product and quantity.
- The route accepts product metadata such as name, description, bottle size, gender, stock, and price.

### Cart Management

Route: `/checkout/cart`

This route stores cart items in the Flask session and renders the cart page.

- Adds products to session cart.
- Increments quantity when the same product and bottle size already exist.
- Recomputes line totals before rendering.

Route: `/checkout/remove`

- Removes a specific cart line item by product id and bottle size.

### Order Submission

Route: `/save-data`

This route finalizes the order and writes it to the `orders` collection.

- Uses the session cart if present.
- Supports direct single-product checkout if the cart is empty.
- Stores shipping and payment details.
- Generates order id and tracking number.
- Stores total quantity and total price.
- Decrements product stock after a successful order.
- Clears the session cart after saving.

### Order Summary

Route: `/checkout/summary`

This route loads the order using an encrypted token and renders the summary page.

- Returns the matching order by ObjectId.
- Encrypts the tracking number for display or follow-up use.

### Order Tracking

Route: `/tracking`

This route accepts a tracking number and searches existing orders.

- POST looks up an order by tracking number.
- The template shows whether the tracking number was found.

### Content Pages

Routes:

- `/about`
- `/contact`
- `/blog`

These routes render the corresponding static content templates.

## Admin Portal Features

### Admin Login

Route: `/viaadmin/`

Admin login checks the `admin` collection using `username` and bcrypt password verification.

- On success, admin session keys are created.
- A session hash is generated from the admin id and app secret key.
- The admin guard uses that hash to detect tampering.

### Dashboard

Route: `/viaadmin/dashboard`

The dashboard shows operational metrics and inventory alerts.

- Sales, orders, and customer counts
- Daily, weekly, and monthly change percentages
- Total product count
- Low-stock and out-of-stock alerts

### Queries Page

Route: `/viaadmin/queries`

Renders the admin queries page.

### Customers Page

Route: `/viaadmin/costumers`

Displays customer-style data generated from the `users` collection.

### Add Product

Route: `/viaadmin/add/product`

Supports creating new product records and uploading media.

- Accepts product metadata such as category, type, description, SKU, stock, tags, price, volume, discount fields, and status.
- Accepts up to 2 thumbnail files.
- Accepts multiple product variant images.
- Saves files under `static/products/<product_name>/thumbnail` and `static/products/<product_name>/variant`.
- Stores relative media paths in MongoDB.

### Product Listing and Editing

Route: `/viaadmin/products`

Renders the admin product list from formatted MongoDB data.

Route: `/viaadmin/edit/product/<product_id>`

Allows product editing, folder renaming/merging, and additional image uploads.

- Updates product fields.
- Moves or merges image folders when the product name changes.
- Keeps DB image paths aligned with renamed folders.
- Adds new thumbnails or variant images without removing existing ones.

### Product Deletion and Media Cleanup

Routes:

- `/viaadmin/delete/product/<product_id>`
- `/viaadmin/delete/products`
- `/viaadmin/delete/thumbnail/<product_id>`
- `/viaadmin/delete/variant/<product_id>`
- `/viaadmin/clear/thumbnails/<product_id>`
- `/viaadmin/clear/variants/<product_id>`

These routes support single-delete, bulk-delete, and file cleanup for product media.

### Orders Management

Routes:

- `/viaadmin/orders`
- `/viaadmin/update-status/<order_id>`
- `/viaadmin/delete-order/<order_id>`
- `/viaadmin/edit-order/<order_id>`
- `/viaadmin/update-order/<order_id>`

These endpoints support order review, status updates, order removal, and manual order editing.

### Analytics

Routes:

- `/viaadmin/analytics`
- `/viaadmin/chart-data`

The analytics page combines dashboard metrics, inventory alerts, and top-selling products.

The chart-data endpoint returns JSON for:

- Last 7 days of sales
- Order status counts

### Marketing

Routes:

- `/viaadmin/marketing`
- `/viaadmin/send-bulk-message`
- `/viaadmin/send-individual-message`

The marketing page extracts unique customers from orders and supports message-send simulations through JSON endpoints.

## Data Model Summary

### `users`

Used for storefront authentication and customer history.

Common fields:

- `name`
- `email`
- `password`
- `registered_at`
- `last_login`

### `admin`

Used for admin authentication.

Common fields:

- `username`
- `password` stored as bcrypt hash

### `products`

Used for storefront catalog and admin product management.

Common fields:

- `name`
- `category`
- `type`
- `Volume`
- `description`
- `sku`
- `stock`
- `tags`
- `price`
- `discount_price`
- `discount_start`
- `discount_end`
- `thumbnails`
- `images`
- `created_at`
- `status`

### `orders`

Used for checkout, order history, tracking, and admin reporting.

Common fields:

- `order_id`
- `tracking_number`
- `created_at`
- `status`
- `details`
- `products`
- `total_quantity`
- `total_price`

### `testimonials`

Used on the home page to show customer testimonials.

Common fields:

- `name`
- `fragrance`
- `type`
- `message`
- `rating`
- `email`
- `created_at`

## Static Assets

### CSS

Styles are organized in [static/css](static/css) with both storefront and admin styling.

### JavaScript

Client-side behavior is organized in [static/js](static/js), including cart, checkout, home, login, products, tracking, and admin scripts.

### Product Media

Uploaded product assets are stored under [static/products](static/products), separated into product-specific `thumbnail` and `variant` folders.

## Template Structure

Templates are stored in [templates](templates) and split into storefront and admin views.

- Storefront pages: `home.html`, `web.html`, `products.html`, `product_details.html`, `login.html`, `cart.html`, `checkout.html`, `summary.html`, `tracking.html`, `about.html`, `contact.html`, `blog.html`
- Shared layout parts: `header.html`, `footer.html`, `product_card.html`
- Admin pages: `admin/login.html`, `admin/dashboard.html`, `admin/products.html`, `admin/add_products.html`, `admin/editproduct.html`, `admin/orders.html`, `admin/edit-order.html`, `admin/analytics.html`, `admin/marketing.html`, `admin/queries.html`, `admin/costumers.html`, `admin/sidebar.html`, `admin/2fa_setup.html`, `admin/2fa_verify.html`

## Runtime Notes

- Sessions are stored on the filesystem through Flask-Session.
- MongoDB is expected to be available locally on port 27017.
- Product images and order state are tightly coupled to session and database records.
- The code relies on the configured `SECRET_KEY` for session integrity and encrypted order tokens.

## What This App Covers

At a functional level, the current codebase supports:

- Product browsing by category and featured groups
- Product detail views with related-item suggestions
- User registration and login
- Session-based cart management
- Checkout and order creation
- Order tracking by tracking number
- Admin authentication and authorization
- Product CRUD with file uploads
- Order status management
- Dashboard analytics and inventory alerts
- Customer reporting and marketing message workflows

## Maintenance Notes

- The document reflects the current implementation in code, not a planned feature list.
- If new routes, collections, or templates are added later, this file should be updated alongside the code.