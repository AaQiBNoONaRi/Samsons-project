import urllib.request

try:
    response = urllib.request.urlopen("http://127.0.0.1:5000/custom")
    status = response.getcode()
    print(f"Status Code: {status}")
    if status == 200:
        print("Success! /custom page loaded successfully.")
    else:
        print(f"Error! Server returned status {status}")
except Exception as e:
    print(f"Failed to connect to the server: {e}")
