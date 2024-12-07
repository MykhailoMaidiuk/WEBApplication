from database.database import Session
from models.comment import Comment
from models.book import Book
from datetime import datetime

def add_comment_to_book(isbn13, user_id, content):
    with Session() as session:
        try:
            # Zkontrolujeme, zda kniha existuje
            book = session.query(Book).filter_by(isbn13=isbn13).first()
            if not book:
                return {"error": "Book not found"}, 404

            # Vytvoříme nový komentář
            new_comment = Comment(
                content=content,
                book_id=isbn13,
                user_id=user_id,
                created_at=datetime.utcnow()
            )
            session.add(new_comment)
            session.commit()
            return {
                "message": "Comment added successfully",
                "comment": new_comment.as_dict()
            }, 201

        except Exception as e:
            session.rollback()
            return {"error": f"Failed to add comment: {str(e)}"}, 500


def fetch_comments_for_book(isbn13):
    with Session() as session:
        try:
            # Zkontrolujeme, zda kniha existuje
            book = session.query(Book).filter_by(isbn13=isbn13).first()
            if not book:
                return {"error": "Book not found"}, 404

            # Načteme komentáře pro knihu
            comments = session.query(Comment).filter_by(book_id=isbn13).all()
            comments_list = [
                {
                    "content": comment.content,
                    "user": comment.user.username if comment.user else "Unknown User",
                    "timestamp": comment.created_at.isoformat() if comment.created_at else None,
                }
                for comment in comments
            ]

            return {"comments": comments_list}, 200

        except Exception as e:
            return {"error": f"Failed to fetch comments: {str(e)}"}, 500
