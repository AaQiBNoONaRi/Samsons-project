import bcrypt

h = b'$2b$12$3/yNvI8MDB29Si0aka/JQujPTJAlmFAXfj1oNkfFPu/qzCCojwSMW'

passwords = ["admin", "rafay", "123456", "12345678", "password", "samsuns", "samsons", "admin123"]
for p in passwords:
    if bcrypt.checkpw(p.encode('utf-8'), h):
        print(f"Match found! Password is: {p}")
        break
else:
    print("No match found in defaults.")
