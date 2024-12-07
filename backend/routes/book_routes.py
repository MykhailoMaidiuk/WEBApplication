from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, login_required, logout_user, current_user
from utils.books_services import (
    get_books_list,
    process_received_data,
    search_books_query,
    get_book_details,
    add_to_favorites,
    remove_from_favorites,
    get_user_favorites,
    get_categories_db,
    rate_book_service,
    get_user_rating_service
)

books_bp = Blueprint('books', __name__)

@books_bp.route("/books", methods=['GET'])
def get_books():
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 50))
    sort_by = request.args.get('sort_by', 'title_asc')

    result = get_books_list(page, page_size, sort_by)
    return jsonify(result), 200


@books_bp.route("/data", methods=['POST'])
def receive_data():
    current_app.logger.info("Endpoint /data was called")
    if not request.is_json:
        current_app.logger.error("Invalid request: JSON expected")
        return jsonify({"error": "Invalid request, JSON expected"}), 400

    data = request.get_json()
    result = process_received_data(data, current_app.logger)
    return jsonify(result), result.get("status", 200)


@books_bp.route("/books/search", methods=['GET'])
def search_books():
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 50))
    title = request.args.get('title', '')
    author = request.args.get('author', '')
    category = request.args.get('category', '')
    isbn13 = request.args.get('isbn13', '')
    sort_by = request.args.get('sort_by', 'title_asc')

    result = search_books_query(page, page_size, title, author, category, isbn13, sort_by)
    return jsonify(result), 200


@books_bp.route("/books/<string:isbn13>", methods=['GET'])
def get_book_detail(isbn13):
    result = get_book_details(isbn13)
    return jsonify(result), result.get("status", 200)


@books_bp.route('/add_to_favorites', methods=['POST'])
@login_required
def add_favorite():
    data = request.get_json()
    isbn13 = data.get('isbn13')

    if not isbn13:
        return jsonify({"error": "ISBN13 je povinné"}), 400

    result = add_to_favorites(current_user.id, isbn13)
    return jsonify(result), result.get("status", 201)


@books_bp.route('/remove_from_favorites', methods=['POST'])
@login_required
def remove_favorite():
    data = request.get_json()
    isbn13 = data.get('isbn13')

    if not isbn13:
        return jsonify({"error": "ISBN13 je povinné"}), 400

    result = remove_from_favorites(current_user.id, isbn13)
    return jsonify(result), result.get("status", 200)


@books_bp.route('/favorites', methods=['GET'])
@login_required
def favorites():
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 50))
    sort_by = request.args.get('sort_by', 'title_asc')

    result = get_user_favorites(current_user.id, page, page_size, sort_by)
    return jsonify(result), 200


@books_bp.route("/categories", methods=['GET'])
def get_categories():
    return jsonify(get_categories_db()), 200


@books_bp.route('/books/<string:isbn13>/rate', methods=['POST', 'OPTIONS'])
@login_required
def rate_book(isbn13):
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight successful"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3009")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    data = request.get_json()
    user_rating = data.get('rating')
    if not user_rating or not (1 <= user_rating <= 5):
        return jsonify({'error': 'Invalid rating'}), 400

    result = rate_book_service(current_user.id, isbn13, user_rating)
    return jsonify(result), result.get("status", 200)


@books_bp.route('/books/<string:isbn13>/user-rating', methods=['GET'])
@login_required
def get_user_rating(isbn13):
    result = get_user_rating_service(current_user.id, isbn13)
    return jsonify(result), result.get("status", 200)