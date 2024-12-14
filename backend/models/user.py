from flask_login import UserMixin
from sqlalchemy import Column, String, Integer, Boolean, Text
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
    comments = relationship('Comment', back_populates='user', cascade='all, delete-orphan')
    ratings = relationship("UserRating", back_populates="user", cascade="all, delete-orphan")

    full_name = Column(String(255), nullable=True)
    email = Column(String(120), unique=True, nullable=True)  # Added email field
    personal_address = Column(String(120), nullable=True)  # Osobní adresa
    billing_address = Column(String(120), nullable=True)  # Fakturační adresa
    billing_same_as_personal = Column(Boolean, default=True)  # Přepínač pro adresy
    marketing_consent = Column(Boolean, default=False)  # Souhlas se zpracováním dat
    gender = Column(String(10), nullable=True)  # Pohlaví
    age = Column(Integer, nullable=True)  # Věk
    favorite_genres = Column(String(300), nullable=True)  # Oblíbené žánry
    referral = Column(String(300), nullable=True)  # Zdroj reference
    phone = Column(String(20), nullable=True)

    def set_password(self, password):
        """Zahashuje heslo a uloží ho."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Porovná heslo s uloženým hashem."""
        return bcrypt.check_password_hash(self.password_hash, password)

    def as_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'email': self.email,  # Added email to dictionary output
            'personal_address': self.personal_address,
            'billing_address': self.billing_address,
            'billing_same_as_personal': self.billing_same_as_personal,
            'marketing_consent': self.marketing_consent,
            'gender': self.gender,
            'age': self.age,
            'favorite_genres': self.favorite_genres,
            'referral': self.referral,
            'phone': self.phone,
        }