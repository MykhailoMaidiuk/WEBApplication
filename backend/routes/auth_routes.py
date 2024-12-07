from flask import Blueprint, request, jsonify, session
from flask_login import login_user, login_required, logout_user, current_user
from database.database import Session as DBSession
from models.user import User
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt
import logging
from utils.auth_services import (
    register_user,
    login_user_service,
    get_user_by_username,
    update_user_profile,
)

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Vyžadováno jméno a heslo"}), 400

    result, status = register_user(username, password)
    return jsonify(result), status


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = login_user_service(username, password)
    if user:
        login_user(user, remember=True)
        return jsonify({"message": "Přihlášení úspěšné"}), 200
    return jsonify({"error": "Neplatné přihlašovací údaje"}), 401


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Odhlášení úspěšné"}), 200


@auth_bp.route('/current_user', methods=['GET'])
@login_required
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            'user': current_user.username,
            'user_id': current_user.id
        }), 200
    return jsonify({"error": "Uživatel není přihlášen"}), 401


@auth_bp.route("/user", methods=["GET"])
@login_required
def get_user_details():
    user = get_user_by_username(current_user.username)
    if not user:
        return jsonify({"error": "Uživatel nenalezen"}), 404
    return jsonify(user.as_dict()), 200


@auth_bp.route('/user/update', methods=['PUT'])
@login_required
def update_user():
    data = request.get_json()
    result, status = update_user_profile(current_user.username, data)
    return jsonify(result), status