# models/__init__.py

from .book import Book
from .user import User
from .favorite_book import FavoriteBook
from .audit_log import AuditLog

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
