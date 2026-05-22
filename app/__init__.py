from flask import Flask
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from app.config import Config
from flask_session import Session

mongo_client = None
db = None


def create_app():
    global mongo_client, db

    app = Flask(__name__, static_folder='../static', template_folder='../templates')
    app.config.from_object(Config)

    # Add this for session support
    app.config["SECRET_KEY"] = "9f4a1c2e3b8d4f5a6c7e8d9f0b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b"
    app.config["SESSION_TYPE"] = "filesystem"

    # Initiaflize Flask-Session after config
    Session(app)

    # Mongo connection: use configured MONGO_URI (now points to localhost)
    try:
        mongo_client = MongoClient(app.config.get('MONGO_URI'), serverSelectionTimeoutMS=5000)
        # Try a ping to verify connection
        mongo_client.admin.command('ping')
        print("[SUCCESS] MongoDB connected successfully!")
        db = mongo_client.get_database(app.config.get('DATABASE_NAME', 'samsuns'))
    except ServerSelectionTimeoutError as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
        mongo_client = None
        db = None

    from app.routes import routes_bp
    from app.admin import admin_bp 
     
    app.register_blueprint(routes_bp, url_prefix="/")
    app.register_blueprint(admin_bp, url_prefix="/viaadmin/")

    app.db = db

    return app