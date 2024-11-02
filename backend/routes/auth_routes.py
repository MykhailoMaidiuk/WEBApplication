from flask import Blueprint, request, jsonify
from flask_login import login_user, login_required, logout_user
from database.database import Session
from models.user import User
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route("/register", methods=["POST"])
def register():
    session = Session()
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    user = User(username=username, password_hash=password_hash)
    try:
        session.add(user)
        session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except IntegrityError:
        session.rollback()
        return jsonify({"error": "Username already exists"}), 400
    finally:
        session.close()

@auth_bp.route("/login", methods=["POST"])
def login():
    session = Session()
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = session.query(User).filter_by(username=username).first()
    if user and user.check_password(password):
        login_user(user)
        return jsonify({"message": "Logged in successfully", "user": user.as_dict()}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200