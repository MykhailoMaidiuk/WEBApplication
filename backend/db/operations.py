from .models import db, Book
from sqlalchemy.exc import SQLAlchemyError

def add_book(isbn10, isbn13, title, author, genres=None, cover_image=None, critics_rating=None,
             year_of_publication=None, number_of_pages=None, average_customer_rating=None, number_of_ratings=None):
    try:
        new_book = Book(
            ISBN10=isbn10,
            ISBN13=isbn13,
            Title=title,
            Author=author,
            Genres=genres,
            Cover_Image=cover_image,
            Critics_Rating=critics_rating,
            Year_of_Publication=year_of_publication,
            Number_of_Pages=number_of_pages,
            Average_Customer_Rating=average_customer_rating,
            Number_of_Ratings=number_of_ratings
        )
        db.session.add(new_book)
        db.session.commit()
        return True, "Book added successfully"
    except SQLAlchemyError as e:
        db.session.rollback()
        return False, str(e)


def get_all_books():
    try:
        books = Book.query.all()
        return books
    except SQLAlchemyError as e:
        return None
