from flask_login import UserMixin
from sqlalchemy import Column, String, Integer
from .book import Base
from flask_bcrypt import Bcrypt

class User(Base, UserMixin):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)

    def check_password(self, password):
        return Bcrypt().check_password_hash(self.password_hash, password)

    def as_dict(self):
        return {
            'id': self.id,
            'username': self.username,
        }