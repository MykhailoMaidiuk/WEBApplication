from sqlalchemy import Column, Integer, String, ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from .book import Base

class UserRating(Base):
    __tablename__ = 'user_ratings'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    isbn13 = Column(String(13), ForeignKey('books.isbn13', ondelete='CASCADE'), nullable=False)
    rating = Column(Float, nullable=False)

    # Relationships
    user = relationship("User", back_populates="ratings")
    book = relationship("Book", back_populates="ratings")

    __table_args__ = (
        UniqueConstraint('user_id', 'isbn13', name='user_book_rating_uc'),
    )

    def as_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'isbn13': self.isbn13,
            'rating': self.rating,
        }
