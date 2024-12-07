from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from database.database import Session
from models.comment import Comment
from models.book import Book
from datetime import datetime
from flask_cors import CORS
from utils.comment_services import add_comment_to_book, fetch_comments_for_book

# Ініціалізація Blueprint
comments_bp = Blueprint('comments', __name__)
CORS(comments_bp, supports_credentials=True, origins=["http://localhost:3009"])

@comments_bp.route("/books/<string:isbn13>/comments", methods=["POST", "OPTIONS"])
@login_required
def add_comment(isbn13):
    if request.method == "OPTIONS":
        # CORS preflight handling
        response = jsonify({"message": "CORS preflight successful"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3009")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    data = request.json
    content = data.get("content")

    if not content:
        return jsonify({"error": "Content is required"}), 400

    result, status = add_comment_to_book(isbn13, current_user.id, content)
    return jsonify(result), status


@comments_bp.route("/books/<string:isbn13>/comments", methods=["GET"])
def get_comments(isbn13):
    result, status = fetch_comments_for_book(isbn13)
    return jsonify(result), status
