from sqlalchemy.orm import joinedload
from sqlalchemy import and_, asc, desc
from models.book import Book
from models.favorite_book import FavoriteBook
from database.database import Session
from models.user_rating import UserRating

def apply_sorting(query, sort_by):
    if sort_by == 'title_asc':
        return query.order_by(asc(Book.title))
    elif sort_by == 'title_desc':
        return query.order_by(desc(Book.title))
    elif sort_by == 'author_asc':
        return query.order_by(asc(Book.authors))
    elif sort_by == 'author_desc':
        return query.order_by(desc(Book.authors))
    elif sort_by == 'rating_asc':
        return query.order_by(asc(Book.average_rating))
    elif sort_by == 'rating_desc':
        return query.order_by(desc(Book.average_rating))
    elif sort_by == 'year_asc':
        return query.order_by(asc(Book.published_year))
    elif sort_by == 'year_desc':
        return query.order_by(desc(Book.published_year))
    return query

def apply_pagination(query, page, page_size):
    """Aplikuje stránkování na dotaz."""
    offset = (page - 1) * page_size
    return query.offset(offset).limit(page_size)


def apply_search_filters(query, title=None, author=None, category=None, isbn13=None):
    """Aplikuje vyhledávací podmínky na dotaz."""
    search_conditions = [Book.is_active == True]

    if title:
        search_conditions.append(Book.title.ilike(f'%{title}%'))
    if author:
        search_conditions.append(Book.authors.ilike(f'%{author}%'))
    if category:
        categories = category.split(",")
        print(f"Filtering by categories: {categories}")
        query = query.filter(Book.categories.in_(categories))
    if isbn13:
        search_conditions.append(Book.isbn13.ilike(f'%{isbn13}%'))
    if search_conditions:
        query = query.filter(and_(*search_conditions))
    return query

def add_to_favorites(user_id, isbn13):
    session = Session()
    try:
        favorite = session.query(FavoriteBook).filter_by(user_id=user_id, book_isbn13=isbn13).first()
        if not favorite:
            new_favorite = FavoriteBook(user_id=user_id, book_isbn13=isbn13)
            session.add(new_favorite)
            session.commit()
        books = session.query(Book).join(FavoriteBook).filter(FavoriteBook.user_id == user_id).all()
        return {"favorites": [book.as_dict() for book in books], "status": 201}
    finally:
        session.close()


def get_books_list(page, page_size, sort_by):
    session = Session()
    try:
        query = session.query(Book).filter(Book.is_active == True)
        query = apply_sorting(query, sort_by)
        query = apply_pagination(query, page, page_size)

        books = query.all()
        total_books = session.query(Book).filter(Book.is_active == True).count()

        return {
            'books': [book.as_dict() for book in books],
            'totalBooks': total_books,
            'totalPages': (total_books // page_size) + (1 if total_books % page_size > 0 else 0),
            'currentPage': page
        }
    finally:
        session.close()


def process_received_data(data, logger):
    session = Session()
    try:
        num_deleted = session.query(Book).delete()
        logger.info(f"Deleted {num_deleted} old records")

        added_records = 0
        skipped_records = 0

        for index, item in enumerate(data, start=1):
            if not all(key in item for key in ['isbn13', 'isbn10', 'title']):
                logger.error(f"Record {index}: Missing required fields. Skipping record.")
                skipped_records += 1
                continue

            try:
                price = float(item.get('price', 0)) if item.get('price') else None
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
                logger.error(f"Record {index}: Error processing book: {e}. Skipping record.")
                skipped_records += 1

        session.commit()
        return {"message": "Data processed", "added": added_records, "skipped": skipped_records}
    except Exception as e:
        session.rollback()
        logger.error(f"Error processing data: {e}")
        return {"error": "Internal server error", "status": 500}
    finally:
        session.close()


def search_books_query(page, page_size, title, author, category, isbn13, sort_by):
    session = Session()
    try:
        query = session.query(Book)
        query = apply_search_filters(query, title, author, category, isbn13)
        query = apply_sorting(query, sort_by)

        total_books = query.count()
        books = apply_pagination(query, page, page_size).all()

        return {
            'books': [book.as_dict() for book in books],
            'totalBooks': total_books,
            'totalPages': (total_books // page_size) + (1 if total_books % page_size > 0 else 0),
            'currentPage': page
        }
    finally:
        session.close()


def get_book_details(isbn13):
    session = Session()
    try:
        book = session.query(Book).filter_by(isbn13=isbn13).first()
        if not book:
            return {"error": "Book not found", "status": 404}
        return book.as_dict()
    finally:
        session.close()





def remove_from_favorites(user_id, isbn13):
    session = Session()
    try:
        favorite = session.query(FavoriteBook).filter_by(user_id=user_id, book_isbn13=isbn13).first()
        if not favorite:
            return {"error": "Kniha není mezi oblíbenými", "status": 404}

        session.delete(favorite)
        session.commit()

        favorites = (
            session.query(FavoriteBook)
            .filter_by(user_id=user_id)
            .options(joinedload(FavoriteBook.book))
            .all()
        )
        return {"favorites": [fav.book.as_dict() for fav in favorites], "status": 200}
    finally:
        session.close()


def get_user_favorites(user_id, page, page_size, sort_by):
    session = Session()
    try:
        query = session.query(Book).join(FavoriteBook).filter(FavoriteBook.user_id == user_id)
        query = apply_sorting(query, sort_by)

        total_books = query.count()
        query = apply_pagination(query, page, page_size)

        books = query.all()
        return {
            'books': [book.as_dict() for book in books],
            'totalBooks': total_books,
            'totalPages': (total_books // page_size) + (1 if total_books % page_size > 0 else 0),
            'currentPage': page
        }
    finally:
        session.close()

def get_categories_db():
    session = Session()
    try:
        categories = session.query(Book.categories).distinct().all()
        unique_categories = set()
        for category_row in categories:
            if category_row.categories:
                unique_categories.update(map(str.strip, category_row.categories.split(',')))

        return sorted(unique_categories)
    finally:
        session.close()

def rate_book_service(user_id, isbn13, user_rating):
    session = Session()
    try:
        # Ověření, že kniha existuje
        book = session.query(Book).filter_by(isbn13=isbn13).first()
        if not book:
            return {"error": "Book not found", "status": 404}

        # Ověření, jestli uživatel už knihu hodnotil
        existing_rating = session.query(UserRating).filter_by(user_id=user_id, isbn13=isbn13).first()

        if existing_rating:
            # Aktualizace existujícího hodnocení
            previous_rating = existing_rating.rating
            existing_rating.rating = user_rating
        else:
            # Přidání nového hodnocení
            previous_rating = None
            new_rating = UserRating(user_id=user_id, isbn13=isbn13, rating=user_rating)
            session.add(new_rating)

        # Aktualizace průměrného hodnocení knihy
        book.update_rating(user_rating, previous_rating)
        session.commit()

        return {
            "average_rating": book.average_rating,
            "ratings_count": book.ratings_count,
            "status": 200
        }
    except Exception as e:
        session.rollback()
        return {"error": str(e), "status": 500}
    finally:
        session.close()

def get_user_rating_service(user_id, isbn13):
    session = Session()
    try:
        # Vyhledání hodnocení uživatele
        user_rating = session.query(UserRating).filter_by(user_id=user_id, isbn13=isbn13).first()
        if user_rating:
            return {"user_rating": user_rating.rating, "status": 200}
        return {"user_rating": None, "status": 200}
    except Exception as e:
        return {"error": str(e), "status": 500}
    finally:
        session.close()
