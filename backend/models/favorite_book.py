from sqlalchemy import ForeignKey, DateTime
from sqlalchemy import (Column, String, Integer)
from sqlalchemy.orm import relationship
from datetime import datetime
from .book import Base

class FavoriteBook(Base):
    __tablename__ = 'favorite_books'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    book_isbn13 = Column(String(13), ForeignKey('books.isbn13'), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='favorites')
    book = relationship('Book', back_populates='favorited_by')
