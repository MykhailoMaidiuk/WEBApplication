from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from database.database import Session
from models.comment import Comment
from models.book import Book
from datetime import datetime
from flask_cors import CORS

# Ініціалізація Blueprint
comments_bp = Blueprint('comments', __name__)
CORS(comments_bp, supports_credentials=True, origins=["http://localhost:3009"])

@comments_bp.route("/books/<string:isbn13>/comments", methods=["POST", "OPTIONS"])
@login_required
def add_comment(isbn13):
    if request.method == "OPTIONS":
        # Обробка preflight-запиту CORS
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

    session_cookie = request.cookies.get('session')
    if not session_cookie:
        return jsonify({"error": "Not authenticated"}), 401

    print(f"Session cookie: {session_cookie}")

    # Додавання нового коментаря
    with Session() as session:
        try:
            new_comment = Comment(
                content=content,
                book_id=isbn13,
                user_id=current_user.id,
                created_at=datetime.utcnow()
            )
            session.add(new_comment)
            session.commit()

            print(f"Added comment: {content} for book {isbn13} by user {current_user.username}")
            return jsonify({
                "message": "Comment added successfully",
                "comment": {
                    "content": new_comment.content,
                    "user": current_user.username,
                    "timestamp": new_comment.created_at.isoformat() if new_comment.created_at else None,
                }
            }), 201

        except Exception as e:
            session.rollback()  # Відкат змін у разі помилки
            print(f"Error adding comment: {e}")
            return jsonify({"error": "Failed to add comment"}), 500

@comments_bp.route("/books/<string:isbn13>/comments", methods=["GET"])
def get_comments(isbn13):
    with Session() as session:
        try:
            # Перевірка наявності книги
            book = session.query(Book).filter_by(isbn13=isbn13).first()
            if not book:
                return jsonify({"error": "Book not found"}), 404

            # Отримання коментарів для книги
            comments = session.query(Comment).filter_by(book_id=isbn13).all()
            comments_list = [
                {
                    "content": comment.content,
                    "user": comment.user.username if comment.user else "Unknown User",
                    "timestamp": comment.created_at.isoformat() if comment.created_at else None,
                }
                for comment in comments
            ]

            return jsonify({"comments": comments_list}), 200

        except Exception as e:
            print(f"Error fetching comments: {e}")
            return jsonify({"error": "Failed to fetch comments"}), 500
