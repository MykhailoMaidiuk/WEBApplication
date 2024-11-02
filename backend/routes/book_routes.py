from flask import Blueprint, request, jsonify
from sqlalchemy import or_, asc, desc
from database.database import Session
from models.book import Book

books_bp = Blueprint('books', __name__)

@books_bp.route("/books", methods=['GET'])
def get_books():
    sort_by = request.args.get('sort_by', 'title_asc')
    session = Session()
    try:
        query = session.query(Book)

        # Řazení podle parametru `sort_by`
        if sort_by == 'title_asc':
            query = query.order_by(asc(Book.title))
        elif sort_by == 'title_desc':
            query = query.order_by(desc(Book.title))
        elif sort_by == 'author_asc':
            query = query.order_by(asc(Book.authors))
        elif sort_by == 'author_desc':
            query = query.order_by(desc(Book.authors))
        elif sort_by == 'rating_asc':
            query = query.order_by(asc(Book.average_rating))
        elif sort_by == 'rating_desc':
            query = query.order_by(desc(Book.average_rating))
        elif sort_by == 'year_asc':
            query = query.order_by(asc(Book.published_year))
        elif sort_by == 'year_desc':
            query = query.order_by(desc(Book.published_year))

        # Výpis dotazu pro ladění
        print("Final SQL query:", query)

        books = query.all()
        books_list = [book.as_dict() for book in books]
        return jsonify({
            'books': books_list,
            'totalBooks': len(books_list)
        }), 200
    except Exception as err:
        print("Error:", err)  # Log error for debugging
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


@books_bp.route("/books/search", methods=['GET'])
def search_books():
    query = request.args.get('query', '')
    sort_by = request.args.get('sort_by', 'title_asc')
    session = Session()
    try:
        # Vyhledávací dotaz na základě `query`
        search_query = session.query(Book).filter(
            or_(
                Book.title.ilike(f'%{query}%'),
                Book.authors.ilike(f'%{query}%'),
                Book.categories.ilike(f'%{query}%'),
            )
        )

        # Řazení podle `sort_by`
        if sort_by == 'title_asc':
            search_query = search_query.order_by(asc(Book.title))
        elif sort_by == 'title_desc':
            search_query = search_query.order_by(desc(Book.title))
        elif sort_by == 'author_asc':
            search_query = search_query.order_by(asc(Book.authors))
        elif sort_by == 'author_desc':
            search_query = search_query.order_by(desc(Book.authors))
        elif sort_by == 'rating_asc':
            search_query = search_query.order_by(asc(Book.average_rating))
        elif sort_by == 'rating_desc':
            search_query = search_query.order_by(desc(Book.average_rating))
        elif sort_by == 'year_asc':
            search_query = search_query.order_by(asc(Book.published_year))
        elif sort_by == 'year_desc':
            search_query = search_query.order_by(desc(Book.published_year))

        books = search_query.all()
        books_list = [book.as_dict() for book in books]

        print("Books returned:", books_list)  # Debug print statement

        return jsonify({
            'books': books_list,
            'totalBooks': len(books_list)
        }), 200
    except Exception as err:
        print("Error:", err)  # Log error for debugging
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@books_bp.route("/books/<string:isbn13>", methods=['GET'])
def get_book_detail(isbn13):
    session = Session()
    try:
        # Fetch the book by isbn13
        book = session.query(Book).filter_by(isbn13=isbn13).first()
        if book:
            return jsonify(book.as_dict())
        else:
            return jsonify({"error": "Book not found"}), 404
    except Exception as err:
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()