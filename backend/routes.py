from flask import request, jsonify, Blueprint, current_app
from database import Session
from models import Book
from sqlalchemy import or_

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
