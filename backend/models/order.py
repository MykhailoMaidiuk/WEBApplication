# models/order.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .book import Base
from .user import User



class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)
    
    user = relationship('User')
    items = relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')
    
    def as_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'total_amount': self.total_amount,
            'payment_method': self.payment_method,
            'items': [item.as_dict() for item in self.items],
        }

class OrderItem(Base):
    __tablename__ = 'order_items'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    book_isbn13 = Column(String(13), ForeignKey('books.isbn13'), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    price = Column(Float, nullable=False)  # Cena za jednotku
    
    order = relationship('Order', back_populates='items')
    book = relationship('Book')
    
    def as_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'book_isbn13': self.book_isbn13,
            'quantity': self.quantity,
            'price': self.price,
        }
