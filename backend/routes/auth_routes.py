from flask import Blueprint, request, jsonify, session
from flask_login import login_user, login_required, logout_user, current_user
from database.database import Session as DBSession
from models.user import User
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt
import logging
from utils.audit_logger import log_event

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
        log_event(
            event_type='register',
            event_details={'username': username},
            user=user
        )
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
            login_user(user, remember=True)
            log_event(
                event_type='login',
                event_details={'username': username},
                user=user
            )
            return jsonify({"message": "Přihlášení úspěšné"}), 200
        else:
            return jsonify({"error": "Neplatné přihlašovací údaje"}), 401
    finally:
        db_session.close()


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    user = current_user  # Uchovejte si uživatele před logoutem
    logout_user()
    log_event(
        event_type='logout',
        event_details={'username': user.username},
        user=user
    )
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
    db_session = DBSession()
    try:
        # Získání uživatele, který je přihlášený
        user = db_session.query(User).filter_by(username=current_user.username).first()
        if not user:
            return jsonify({"error": "Uživatel nenalezen"}), 404
        return jsonify(user.as_dict()), 200
    finally:
        db_session.close()




@auth_bp.route('/user/update', methods=['PUT'])
@login_required  # Ujistíme se, že je uživatel přihlášen
def update_user():
    data = request.get_json()

    # Získání username z požadavku (frontend posílá username)
    username = data.get('username', current_user.username)

    if not username:
        return jsonify({"error": "Username is required"}), 400

    db_session = DBSession()

    # Hledání uživatele podle username
    user = db_session.query(User).filter_by(username=username).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Ujistíme se, že aktualizujeme pouze profil aktuálně přihlášeného uživatele
    if user.username != current_user.username:
        return jsonify({"error": "Unauthorized to update this user profile"}), 403

    # Aktualizace údajů o uživatelském profilu
    user.full_name = data.get('full_name', user.full_name)  # Příklad pro jméno
    user.email = data.get('email', user.email)
    user.personal_address = data.get('personal_address', user.personal_address)
    user.billing_address = data.get('billing_address', user.billing_address)
    user.billing_same_as_personal = data.get('billing_same_as_personal', user.billing_same_as_personal)
    user.marketing_consent = data.get('marketing_consent', user.marketing_consent)
    user.gender = data.get('gender', user.gender)
    user.age = data.get('age', user.age)
    user.favorite_genres = data.get('favorite_genres', user.favorite_genres)
    user.referral = data.get('referral', user.referral)
    user.phone = data.get('phone', user.phone)

    try:
        # Uložení změn do databáze
        db_session.commit()
        return jsonify({"user": user.as_dict()}), 200
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": str(e)}), 500  # Pokud dojde k chybě
    finally:
        db_session.close()
