from sqlalchemy import (Column, String, Integer, Float, Text, Boolean, CheckConstraint, Numeric)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship


Base = declarative_base()

class Book(Base):
    __tablename__ = 'books'
    isbn13 = Column(String(13), primary_key=True, nullable=False)
    isbn10 = Column(String(10), nullable=False)
    title = Column(String(255), nullable=False)
    subtitle = Column(String(), nullable=True)
    authors = Column(String(), nullable=True)
    categories = Column(String(), nullable=True)
    thumbnail = Column(String(), nullable=True)
    description = Column(Text, nullable=True)
    published_year = Column(Integer, nullable=True)
    average_rating = Column(Float, nullable=True)
    num_pages = Column(Integer, nullable=True)
    ratings_count = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    price = Column(Numeric(10, 2), nullable=True)
    favorited_by = relationship('FavoriteBook', back_populates='book', cascade='all, delete-orphan')
    comments = relationship('Comment', back_populates='book', cascade='all, delete-orphan')
    ratings = relationship("UserRating", back_populates="book", cascade="all, delete-orphan")
    __table_args__ = (
        CheckConstraint('char_length(isbn13) = 13', name='check_isbn13_length'),
        CheckConstraint('char_length(isbn10) = 10', name='check_isbn10_length'),
        CheckConstraint('char_length(title) <= 255', name='check_title_length'),
    )

    def as_dict(self):
        return {
            'isbn13': self.isbn13,
            'isbn10': self.isbn10,
            'title': self.title,
            'subtitle': self.subtitle,
            'authors': self.authors,
            'categories': self.categories.split(',') if isinstance(self.categories, str) else self.categories,
            'thumbnail': self.thumbnail,
            'description': self.description,
            'published_year': self.published_year,
            'average_rating': self.average_rating,
            'num_pages': self.num_pages,
            'ratings_count': self.ratings_count,
            'is_active': self.is_active,
            'price': float(self.price) if self.price is not None else None,
            'availability': 'Available' if self.price is not None else 'Not Available',
        }


    def update_rating(self, new_rating, previous_rating=None):
        """
        Оновлює середній рейтинг книги.
        :param new_rating: Нова оцінка користувача.
        :param previous_rating: Попередня оцінка користувача (якщо змінюється).
        """
        if previous_rating is not None:
            # Якщо є попередній рейтинг, оновити середнє
            self.average_rating = round((
                    (self.average_rating * self.ratings_count - previous_rating + new_rating)
                    / self.ratings_count
            ),2)
        else:
            self.average_rating = round((
                    (self.average_rating * self.ratings_count + new_rating)
                    / (self.ratings_count + 1)
            ),2)
            self.ratings_count += 1


from .comment import Comment
from .favorite_book import FavoriteBook