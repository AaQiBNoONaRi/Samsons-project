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

# 2. Get edit product page to verify GET works
product_id = "6893267cff2f1da4b0f0cb3d"
edit_url = f"http://127.0.0.1:5000/viaadmin/edit/product/{product_id}"

# 3. Post update
boundary = b"----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = []

post_fields = {
    "product_name": "Versace Men Dylan",
    "category": "male",
    "status": "Active",
    "type": "floral",
    "stock": "10",
    "sku": "VERS-DYLAN-001",
    "description": "Premium scent.",
    "price": "1200", # without comma!
    "discount_price": "",
    "discount_start_date": "",
    "discount_end_date": "",
    "tags": "fresh,woody"
}

for name, value in post_fields.items():
    body.append(b"--" + boundary)
    body.append(f'Content-Disposition: form-data; name="{name}"'.encode("utf-8"))
    body.append(b"")
    body.append(value.encode("utf-8"))

# add empty file fields
for file_field in ["thumbnail_images[]", "product_images[]"]:
    body.append(b"--" + boundary)
    body.append(f'Content-Disposition: form-data; name="{file_field}"; filename=""'.encode("utf-8"))
    body.append(b"Content-Type: application/octet-stream")
    body.append(b"")
    body.append(b"")

body.append(b"--" + boundary + b"--")
body.append(b"")

multipart_data = b"\r\n".join(body)

req = urllib.request.Request(edit_url, data=multipart_data, method="POST")
req.add_header("Content-Type", b"multipart/form-data; boundary=" + boundary)
req.add_header("Content-Length", str(len(multipart_data)))

try:
    # Disable automatic redirect to catch the 302
    class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, hdrs, newurl):
            return None
            
    no_redirect_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj), NoRedirectHandler())
    res = no_redirect_opener.open(req)
    print("POST Edit Product Status Code:", res.status)
    print("POST Edit Product Headers Location:", res.getheader("Location"))
except urllib.error.HTTPError as e:
    print("POST HTTPError:", e.code)
    try:
        print("POST HTTPError Content:", e.read().decode("utf-8", errors="ignore"))
    except:
        pass
except Exception as e:
    print("POST Exception:", e)
