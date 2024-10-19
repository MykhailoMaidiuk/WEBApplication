from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from config import DATABASE_URI
import time
import sys

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URI, echo=False)

# Create session
SessionFactory = sessionmaker(bind=engine)
Session = scoped_session(SessionFactory)

# Base model
Base = declarative_base()

def create_tables_with_retry(logger, retries=5, delay=5):
    from models import Book  # Import models here to register them with Base
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(engine)
            logger.info("Database tables created")
            return
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            if attempt < retries:
                logger.info(
                    f"Retrying in {delay} seconds... (Attempt {attempt}/{retries})"
                )
                time.sleep(delay)
            else:
                logger.error(
                    "Failed to create database tables after several attempts"
                )
                sys.exit(1)
