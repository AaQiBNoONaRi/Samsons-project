import urllib.request
import urllib.parse
import http.cookiejar

# Setup cookie jar
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Login
login_url = "http://127.0.0.1:5000/viaadmin/"
login_data = urllib.parse.urlencode({
    "email": "rafay",
    "password": "admin123"
}).encode("utf-8")

req = urllib.request.Request(login_url, data=login_data, method="POST")
try:
    res = opener.open(req)
    print("Login Response URL:", res.geturl())
except Exception as e:
    print("Login Exception:", e)

# 2. Add product
add_url = "http://127.0.0.1:5000/viaadmin/add/product"
boundary = b"----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = []

# Generate a unique product name/sku so it doesn't collide
import time
timestamp = int(time.time())

post_fields = {
    "product_name": f"Test Perfume {timestamp}",
    "category": "male",
    "status": "Active",
    "type": "floral",
    "stock": "20",
    "sku": f"SKU-{timestamp}",
    "description": "Auto-generated test product.",
    "price": "1,500.00",
    "discount_price": "",
    "discount_start_date": "",
    "discount_end_date": "",
    "tags": "test,perfume"
}

for name, value in post_fields.items():
    body.append(b"--" + boundary)
    body.append(f'Content-Disposition: form-data; name="{name}"'.encode("utf-8"))
    body.append(b"")
    body.append(value.encode("utf-8"))

# add empty file fields (we staged files via JS, let's simulate)
for file_field in ["thumbnail_images[]", "product_images[]"]:
    body.append(b"--" + boundary)
    body.append(f'Content-Disposition: form-data; name="{file_field}"; filename=""'.encode("utf-8"))
    body.append(b"Content-Type: application/octet-stream")
    body.append(b"")
    body.append(b"")

body.append(b"--" + boundary + b"--")
body.append(b"")

multipart_data = b"\r\n".join(body)

req = urllib.request.Request(add_url, data=multipart_data, method="POST")
req.add_header("Content-Type", b"multipart/form-data; boundary=" + boundary)
req.add_header("Content-Length", str(len(multipart_data)))

try:
    # Disable automatic redirect to catch the 302
    class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, hdrs, newurl):
            return None
            
    no_redirect_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj), NoRedirectHandler())
    res = no_redirect_opener.open(req)
    print("POST Add Product Status Code:", res.status)
    print("POST Add Product Headers Location:", res.getheader("Location"))
except urllib.error.HTTPError as e:
    print("POST HTTPError:", e.code)
    try:
        print("POST HTTPError Content:", e.read().decode("utf-8", errors="ignore"))
    except:
        pass
except Exception as e:
    print("POST Exception:", e)
