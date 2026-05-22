from flask import Flask, redirect, url_for, session, render_template
from authlib.integrations.flask_client import OAuth
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["myapp"]
users = db["users"]

# Authlib setup
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={'scope': 'openid email profile'},
)

@app.route('/')
def index():
    return render_template("register.html")

@app.route('/register/google')
def register_google():
    return google.authorize_redirect(redirect_uri=url_for('google_callback', _external=True))

@app.route('/auth/google/callback')
def google_callback():
    token = google.authorize_access_token()
    resp = google.get('userinfo')
    user_info = resp.json()
    
    email = user_info['email']
    name = user_info.get('name')

    # Check if user already exists
    existing_user = users.find_one({'email': email})

    if not existing_user:
        users.insert_one({
            'name': name,
            'email': email,
            'registered_with': 'google'
        })

    session['user'] = {'name': name, 'email': email}
    return f"Hello, {name}! You have been registered via Google."

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True)
