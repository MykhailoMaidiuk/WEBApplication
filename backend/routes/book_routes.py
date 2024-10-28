from flask import Blueprint, request, jsonify
from sqlalchemy import or_, asc, desc
from database.database import Session
from models.book import Book

books_bp = Blueprint('books', __name__)

@books_bp.route("/books", methods=['GET'])
def get_books():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 8))
    sort_by = request.args.get('sort_by', 'title_asc')
    session = Session()
    try:
        offset = (page - 1) * limit

        query = session.query(Book)

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

        total_books = query.count()
        books = query.limit(limit).offset(offset).all()

        books_list = [book.as_dict() for book in books]
        return jsonify({
            'books': books_list,
            'totalBooks': total_books,
            'currentPage': page,
            'totalPages': (total_books + limit - 1) // limit
        }), 200
    except Exception as err:
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@books_bp.route("/books/search", methods=['GET'])
def search_books():
    query = request.args.get('query', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 8))
    sort_by = request.args.get('sort_by', 'title_asc')
    session = Session()
    try:
        offset = (page - 1) * limit

        search_query = session.query(Book).filter(
            or_(
                Book.title.ilike(f'%{query}%'),
                Book.authors.ilike(f'%{query}%'),
                Book.categories.ilike(f'%{query}%'),
            )
        )

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

        total_books = search_query.count()
        books = search_query.limit(limit).offset(offset).all()

        books_list = [book.as_dict() for book in books]
        return jsonify({
            'books': books_list,
            'totalBooks': total_books,
            'currentPage': page,
            'totalPages': (total_books + limit - 1) // limit
        }), 200
    except Exception as err:
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()