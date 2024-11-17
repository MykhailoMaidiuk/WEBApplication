from flask import Blueprint, request, jsonify, session
from flask_login import login_user, login_required, logout_user, current_user
from database.database import Session as DBSession
from models.user import User
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt
import logging

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()


@auth_bp.route("/register", methods=["POST"])
def register():
    db_session = DBSession()
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Vyžadováno jméno a heslo"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, password_hash=password_hash)

    try:
        db_session.add(user)
        db_session.commit()
        return jsonify({"message": "Uživatel úspěšně registrován"}), 201
    except IntegrityError:
        db_session.rollback()
        return jsonify({"error": "Jméno uživatele již existuje"}), 400
    finally:
        db_session.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    db_session = DBSession()
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    try:
        user = db_session.query(User).filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user, remember=True)  # Přidáno `remember=True`
            return jsonify({"message": "Přihlášení úspěšné"}), 200
        else:
            return jsonify({"error": "Neplatné přihlašovací údaje"}), 401
    finally:
        db_session.close()


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Odhlášení úspěšné"}), 200


@auth_bp.route("/current_user", methods=["GET"])
def current_user_info():
    if current_user.is_authenticated:
        return jsonify({"user": current_user.username}), 200
    return jsonify({"error": "Uživatel není přihlášen"}), 401
