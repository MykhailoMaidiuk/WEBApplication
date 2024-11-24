from flask import request, jsonify, Blueprint, current_app, session
from database import Session
from models import Book
from sqlalchemy import or_
from database import Session
from models import User
import bcrypt

routes_bp = Blueprint('routes', __name__)

@routes_bp.route("/", methods=['GET'])
def hello_world():
    current_app.logger.info("Endpoint HelloWorld was called")
    return "Hello, World!"

@routes_bp.route("/data", methods=['POST'])
def receive_data():
    current_app.logger.info("Endpoint /data was called")
    if not request.is_json:
        current_app.logger.error("Invalid request: JSON expected")
        return jsonify({"error": "Invalid request, JSON expected"}), 400

    data = request.get_json()
    current_app.logger.info(f"Received data: {data}")

    session = Session()
    try:
        # Delete old data
        num_deleted = session.query(Book).delete()
        current_app.logger.info(f"Deleted {num_deleted} old records")

        added_records = 0
        skipped_records = 0

        for index, item in enumerate(data, start=1):
            try:
                # Check required fields
                required_fields = ['isbn13', 'isbn10', 'title']
                missing_fields = [field for field in required_fields if not item.get(field)]
                if missing_fields:
                    current_app.logger.error(f"Record {index}: Missing required fields: {', '.join(missing_fields)}. Skipping record.")
                    skipped_records += 1
                    continue

                # Create book instance
                book = Book(
                    isbn13=item['isbn13'],
                    isbn10=item['isbn10'],
                    title=item['title'],
                    subtitle=item.get('subtitle'),
                    authors=item.get('authors'),
                    categories=item.get('categories'),
                    thumbnail=item.get('thumbnail'),
                    description=item.get('description'),
                    published_year=item.get('published_year'),
                    average_rating=item.get('average_rating'),
                    num_pages=item.get('num_pages'),
                    ratings_count=item.get('ratings_count'),
                )
                session.add(book)
                added_records += 1

            except Exception as e:
                current_app.logger.error(f"Record {index}: Error processing book: {e}. Skipping record.")
                skipped_records += 1
                continue

        session.commit()
        current_app.logger.info(f"Added {added_records} new records. Skipped {skipped_records} invalid records.")
        return jsonify({"message": "Data received and saved", "added": added_records, "skipped": skipped_records}), 200
    except Exception as e:
        session.rollback()
        current_app.logger.error(f"Error processing data: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@routes_bp.route("/books", methods=['GET'])
def get_books():
    current_app.logger.info("Endpoint /books was called")
    session = Session()
    try:
        books = session.query(Book).all()
        books_list = [book.as_dict() for book in books]
        return jsonify(books_list), 200
    except Exception as e:
        current_app.logger.error(f"Error getting data: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@routes_bp.route("/books/search", methods=['GET'])
def search_books():
    query = request.args.get('query', '')
    current_app.logger.info(f"Endpoint /books/search called with query: {query}")
    session = Session()
    try:
        books = session.query(Book).filter(
            or_(
                Book.title.ilike(f'%{query}%'),
                Book.authors.ilike(f'%{query}%'),
                Book.categories.ilike(f'%{query}%'),
            )
        ).all()
        books_list = [book.as_dict() for book in books]
        return jsonify(books_list), 200
    except Exception as e:
        current_app.logger.error(f"Error searching books: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

# Новый маршрут для регистрации пользователей
@routes_bp.route("/register", methods=['POST'])
def register():
    current_app.logger.info("Endpoint /register was called")
    if not request.is_json:
        current_app.logger.error("Invalid request: JSON expected")
        return jsonify({"error": "Invalid request, JSON expected"}), 400

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Проверка наличия всех полей
    if not username or not password:
        current_app.logger.error("Missing required fields")
        return jsonify({"error": "Username and password are required"}), 400

    session_db = Session()
    try:
        # Проверка существования пользователя
        existing_user = session_db.query(User).filter_by(username=username).first()
        if existing_user:
            current_app.logger.error("User already exists")
            return jsonify({"error": "User with this username already exists"}), 400

        # Хеширование пароля
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Создание нового пользователя
        new_user = User(
            username=username,
            password_hash=hashed_password.decode('utf-8')
        )

        session_db.add(new_user)
        session_db.commit()

        current_app.logger.info(f"User {username} registered successfully")
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        session_db.rollback()
        current_app.logger.error(f"Error registering user: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session_db.close()

# Новый маршрут для входа пользователей
@routes_bp.route("/login", methods=['POST'])
def login():
    current_app.logger.info("Endpoint /login was called")
    if not request.is_json:
        current_app.logger.error("Invalid request: JSON expected")
        return jsonify({"error": "Invalid request, JSON expected"}), 400

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Проверка наличия всех полей
    if not username or not password:
        current_app.logger.error("Missing required fields")
        return jsonify({"error": "Username and password are required"}), 400

    session_db = Session()
    try:
        user = session_db.query(User).filter_by(username=username).first()
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            # Аутентификация успешна
            session['username'] = user.username  # Сохраняем имя пользователя в сессии
            current_app.logger.info(f"User {user.username} logged in successfully")
            return jsonify({"message": "Login successful"}), 200
        else:
            current_app.logger.error("Invalid username or password")
            return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        current_app.logger.error(f"Error during login: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session_db.close()

# Пример защищенного маршрута
@routes_bp.route("/protected", methods=['GET'])
def protected():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"message": f"Hello, {session['username']}! This is a protected route."}), 200

# Маршрут для выхода из системы
@routes_bp.route("/logout", methods=['GET'])
def logout():
    session.pop('username', None)
    current_app.logger.info("User logged out")
    return jsonify({"message": "Logged out successfully"}), 200