from flask_login import UserMixin
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from .book import Base
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

class User(Base, UserMixin):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    favorites = relationship('FavoriteBook', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password):
        """Zahashuje heslo a uloží ho."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Porovná heslo s uloženým hashem."""
        return bcrypt.check_password_hash(self.password_hash, password)

    def as_dict(self):
        """Vrátí slovníkovou reprezentaci uživatele."""
        return {
            'id': self.id,
            'username': self.username,
        }