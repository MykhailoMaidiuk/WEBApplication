from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import or_, asc, desc, and_
from database.database import Session
from models.book import Book

books_bp = Blueprint('books', __name__)

@books_bp.route("/books", methods=['GET'])
def get_books():
    # Načteme parametry pro stránkování a řazení
    page = int(request.args.get('page', 1))  # Výchozí stránka je 1
    page_size = int(request.args.get('page_size', 50))  # Výchozí počet knih na stránce je 50
    sort_by = request.args.get('sort_by', 'title_asc')

    session = Session()
    try:
        # Filtrování pouze aktivních knih
        query = session.query(Book).filter(Book.is_active == True)

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

        # Výpočet OFFSETu a aplikace LIMITu
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        # Načtení knih
        books = query.all()
        books_list = [book.as_dict() for book in books]

        # Počet všech knih v databázi pro zobrazení celkového počtu
        total_books = session.query(Book).filter(Book.is_active == True).count()

        return jsonify({
            'books': books_list,
            'totalBooks': total_books,
            'totalPages': (total_books // page_size) + (1 if total_books % page_size > 0 else 0),
            'currentPage': page
        }), 200

    except Exception as err:
        print("Error:", err)  # Log error for debugging
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


@books_bp.route("/data", methods=['POST'])
def receive_data():
    current_app.logger.info("Endpoint /data was called")
    if not request.is_json:
        current_app.logger.error("Invalid request: JSON expected")
        return jsonify({"error": "Invalid request, JSON expected"}), 400

    data = request.get_json()
    current_app.logger.info(f"Received data: {data}")

    session = Session()
    try:
        existing_books = {book.isbn13: book for book in session.query(Book).all()}
        current_app.logger.info(f"Loaded {len(existing_books)} existing records from the database")

        added_records = 0
        updated_records = 0
        skipped_records = 0
        processed_isbns = set()  # Sada pro ISBN knih, které byly přijaty v nových datech

        for index, item in enumerate(data, start=1):
            try:
                required_fields = ['isbn13', 'isbn10', 'title']
                missing_fields = [field for field in required_fields if not item.get(field)]
                if missing_fields:
                    current_app.logger.error(f"Record {index}: Missing required fields: {', '.join(missing_fields)}. Skipping record.")
                    skipped_records += 1
                    continue

                isbn13 = item['isbn13']
                processed_isbns.add(isbn13)

                if isbn13 in existing_books:
                    book = existing_books[isbn13]
                    book.isbn10 = item['isbn10']
                    book.title = item['title']
                    book.subtitle = item.get('subtitle')
                    book.authors = item.get('authors')
                    book.categories = item.get('categories')
                    book.thumbnail = item.get('thumbnail')
                    book.description = item.get('description')
                    book.published_year = item.get('published_year')
                    book.average_rating = item.get('average_rating')
                    book.num_pages = item.get('num_pages')
                    book.ratings_count = item.get('ratings_count')
                    book.is_active = True  # Oznaceni jako aktivni
                    updated_records += 1
                else:
                    book = Book(
                        isbn13=isbn13,
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
                        is_active=True  # Nastaveni nove knihy jako aktivni
                    )
                    session.add(book)
                    added_records += 1

            except Exception as e:
                current_app.logger.error(f"Record {index}: Error processing book: {e}. Skipping record.")
                skipped_records += 1
                continue

        inactive_records = 0
        for isbn13, book in existing_books.items():
            if isbn13 not in processed_isbns:
                book.is_active = False
                inactive_records += 1

        session.commit()
        current_app.logger.info(f"Added {added_records} new records. Updated {updated_records} existing records. Skipped {skipped_records} invalid records. Marked {inactive_records} records as inactive.")
        return jsonify({
            "message": "Data received and saved",
            "added": added_records,
            "updated": updated_records,
            "skipped": skipped_records,
            "inactive": inactive_records
        }), 200

    except Exception as e:
        session.rollback()
        current_app.logger.error(f"Error processing data: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


@books_bp.route("/books/search", methods=['GET'])
def search_books():
    # Získáme parametry pro stránkování
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('page_size', 50))
    title = request.args.get('title', '')
    author = request.args.get('author', '')
    category = request.args.get('category', '')
    isbn13 = request.args.get('isbn13', '')
    sort_by = request.args.get('sort_by', 'title_asc')
    session = Session()

    try:
        search_conditions = [Book.is_active == True]

        # Přidáme podmínky pro vyhledávání
        if title:
            search_conditions.append(Book.title.ilike(f'%{title}%'))
        if author:
            search_conditions.append(Book.authors.ilike(f'%{author}%'))
        if category:
            search_conditions.append(Book.categories.ilike(f'%{category}%'))
        if isbn13:
            search_conditions.append(Book.isbn13.ilike(f'%{isbn13}%'))

        # Vytvoříme základní query
        search_query = session.query(Book)
        if search_conditions:
            search_query = search_query.filter(and_(*search_conditions))

        # Aplikujeme řazení
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

        # Získáme celkový počet knih odpovídajících vyhledávání
        total_books = search_query.count()

        # Aplikujeme stránkování
        offset = (page - 1) * page_size
        books = search_query.offset(offset).limit(page_size).all()
        books_list = [book.as_dict() for book in books]

        return jsonify({
            'books': books_list,
            'totalBooks': total_books,
            'totalPages': (total_books // page_size) + (1 if total_books % page_size > 0 else 0),
            'currentPage': page
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
        book = session.query(Book).filter_by(isbn13=isbn13).first()
        if book:
            return jsonify(book.as_dict())
        else:
            return jsonify({"error": "Book not found"}), 404
    except Exception as err:
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


