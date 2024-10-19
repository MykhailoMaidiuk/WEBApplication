"""
Flask application for managing a book database using SQLAlchemy.
"""
import os
import sys
import time
import csv
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import (
    create_engine,
    Column,
    String,
    Integer,
    Float,
    Text,
    CheckConstraint,
    or_
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session


# Create Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
log_directory = os.path.join(os.getcwd(), 'logs')
os.makedirs(log_directory, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_directory, 'app.log')),
        logging.StreamHandler(sys.stdout),
    ],
)

app.logger.info("Application is starting")


# Database settings from environment variables or default values
POSTGRES_USER = os.environ.get('POSTGRES_USER', 'postgres')
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD', 'postgres')
POSTGRES_DB = os.environ.get('POSTGRES_DB', 'postgres')
POSTGRES_HOST = os.environ.get('POSTGRES_HOST', 'db')
POSTGRES_PORT = os.environ.get('POSTGRES_PORT', '5432')

app.logger.info(
    "Database settings: USER=%s, HOST=%s, PORT=%s, DB=%s",
    POSTGRES_USER, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB
)

# Create database URI
DATABASE_URI = (
    f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'
)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URI, echo=False)

# Create session
SessionFactory = sessionmaker(bind=engine)
Session = scoped_session(SessionFactory)

# Base model
Base = declarative_base()


class Book(Base):
    """
    Represents a book in the database with various attributes.
    """
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

    __table_args__ = (
        CheckConstraint('char_length(isbn13) = 13', name='check_isbn13_length'),
        CheckConstraint('char_length(isbn10) = 10', name='check_isbn10_length'),
        CheckConstraint('char_length(title) <= 255', name='check_title_length'),
    )

    def as_dict(self):
        """
        Convert book object to a dictionary representation.
        """
        return {
            'isbn13': self.isbn13,
            'isbn10': self.isbn10,
            'title': self.title,
            'subtitle': self.subtitle,
            'authors': self.authors,
            'categories': self.categories,
            'thumbnail': self.thumbnail,
            'description': self.description,
            'published_year': self.published_year,
            'average_rating': self.average_rating,
            'num_pages': self.num_pages,
            'ratings_count': self.ratings_count,
        }


def create_tables_with_retry(retries=5, delay=5):
    """
    Try creating the database tables with retries in case of failure.
    """
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(engine)
            app.logger.info("Database tables created")
            return
        except Exception as err:
            app.logger.error("Error creating tables: %s", err)
            if attempt < retries:
                app.logger.info("Retrying in %d seconds... (Attempt %d/%d)", delay, attempt, retries)
                time.sleep(delay)
            else:
                app.logger.error("Failed to create database tables after several attempts")
                sys.exit(1)


create_tables_with_retry()


@app.route("/", methods=['GET'])
def hello_world():
    """
    Hello World endpoint to check application health.
    """
    app.logger.info("Endpoint HelloWorld was called")
    return "Hello, World!"


@app.route("/data", methods=['POST'])
def receive_data():
    """
    Endpoint to receive book data in JSON format and save to database.
    """
    app.logger.info("Endpoint /data was called")
    if not request.is_json:
        app.logger.error("Invalid request: JSON expected")
        return jsonify({"error": "Invalid request, JSON expected"}), 400

    data = request.get_json()
    app.logger.info("Received data: %s", data)

    session = Session()
    try:
        # Delete old data
        num_deleted = session.query(Book).delete()
        app.logger.info("Deleted %d old records", num_deleted)

        # Add new data
        for item in data:
            required_fields = ['isbn13', 'isbn10', 'title']
            for field in required_fields:
                if field not in item or not item[field]:
                    app.logger.error("Missing required field: %s", field)
                    session.rollback()
                    return jsonify({"error": f"Missing required field: {field}"}), 400

            book = Book(
                isbn13=item['isbn13'],
                isbn10=item['isbn10'],
                title=item['title'],
                subtitle=item.get('subtitle'),
                authors=item.get('authors'),
                categories=item.get('categories'),
                thumbnail=item.get('thumbnail'),
                description=item.get('description'),
                published_year=item.get('published_year'),
                average_rating=item.get('average_rating'),
                num_pages=item.get('num_pages'),
                ratings_count=item.get('ratings_count'),
            )
            session.add(book)

        session.commit()
        app.logger.info("Added %d new records", len(data))
        return jsonify({"message": "Data received and saved"}), 200
    except Exception as err:
        session.rollback()
        app.logger.error("Error processing data: %s", err)
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


@app.route("/books", methods=['GET'])
def get_books():
    """
    Endpoint to get a list of all books from the database.
    """
    app.logger.info("Endpoint /books was called")
    session = Session()
    try:
        books = session.query(Book).all()
        books_list = [book.as_dict() for book in books]
        return jsonify(books_list), 200
    except Exception as err:
        app.logger.error("Error getting data: %s", err)
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


def import_data_from_csv():
    """
    Import book data from a CSV file (data_mock.csv) on startup.
    """
    csv_file_path = os.path.join(os.getcwd(), 'data_mock.csv')
    if not os.path.exists(csv_file_path):
        app.logger.error("File %s not found", csv_file_path)
        return

    session = Session()
    try:
        num_deleted = session.query(Book).delete()
        app.logger.info("Deleted %d old records", num_deleted)

        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                if len(row) != 12:
                    app.logger.error("Incorrect number of fields in row: %s", row)
                    continue

                book = Book(
                    isbn13=row[0].strip(),
                    isbn10=row[1].strip(),
                    title=row[2].strip(),
                    subtitle=row[3].strip() if row[3] else None,
                    authors=row[4].strip() if row[4] else None,
                    categories=row[5].strip() if row[5] else None,
                    thumbnail=row[6].strip() if row[6] else None,
                    description=row[7].strip() if row[7] else None,
                    published_year=int(row[8].strip()) if row[8] else None,
                    average_rating=float(row[9].strip()) if row[9] else None,
                    num_pages=int(row[10].strip()) if row[10] else None,
                    ratings_count=int(row[11].strip()) if row[11] else None,
                )
                session.add(book)

        session.commit()
        app.logger.info("Data from CSV successfully imported")
    except Exception as err:
        session.rollback()
        app.logger.error("Error importing data: %s", err)
    finally:
        session.close()


@app.route("/books/search", methods=['GET'])
def search_books():
    """
    Endpoint to search for books by title, authors, or categories.
    """
    query = request.args.get('query', '')
    app.logger.info("Endpoint /books/search called with query: %s", query)
    session = Session()
    try:
        books = session.query(Book).filter(
            or_(
                Book.title.ilike(f'%{query}%'),
                Book.authors.ilike(f'%{query}%'),
                Book.categories.ilike(f'%{query}%'),
            )
        ).all()
        books_list = [book.as_dict() for book in books]
        return jsonify(books_list), 200
    except Exception as err:
        app.logger.error("Error searching books: %s", err)
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


if os.environ.get('IMPORT_CSV_ON_STARTUP', 'False') == 'True':
    import_data_from_csv()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8009)
