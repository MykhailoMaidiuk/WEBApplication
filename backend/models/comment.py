# comment.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .book import Base

class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True)
    content = Column(String, nullable=False)
    book_id = Column(String, ForeignKey('books.isbn13', ondelete='CASCADE'))
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)  # Додаємо поле created_at

    # Relationships
    book = relationship("Book", back_populates="comments", passive_deletes=True)
    user = relationship("User", back_populates="comments")

    def as_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "book_id": self.book_id,
            "user_id": self.user_id,
            "created_at": self.created_at,  # форматування дати у рядок
        }

from .book import Book