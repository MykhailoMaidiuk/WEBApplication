from database.database import Session as DBSession
from models.user import User
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


def register_user(username, password):
    db_session = DBSession()
    try:
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(username=username, password_hash=password_hash)

        db_session.add(user)
        db_session.commit()
        return {"message": "Uživatel úspěšně registrován"}, 201
    except IntegrityError:
        db_session.rollback()
        return {"error": "Jméno uživatele již existuje"}, 400
    finally:
        db_session.close()


def login_user_service(username, password):
    db_session = DBSession()
    try:
        user = db_session.query(User).filter_by(username=username).first()
        if user and user.check_password(password):
            return user
        return None
    finally:
        db_session.close()


def get_user_by_username(username):
    db_session = DBSession()
    try:
        user = db_session.query(User).filter_by(username=username).first()
        return user
    finally:
        db_session.close()


def update_user_profile(username, updated_data):
    db_session = DBSession()
    try:
        user = db_session.query(User).filter_by(username=username).first()
        if not user:
            return {"error": "Uživatel nenalezen"}, 404

        # Aktualizace atributů
        for key, value in updated_data.items():
            setattr(user, key, value)

        db_session.commit()
        return {"user": user.as_dict()}, 200
    except Exception as e:
        db_session.rollback()
        return {"error": str(e)}, 500
    finally:
        db_session.close()
