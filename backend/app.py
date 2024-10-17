# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
from sqlalchemy import (
    create_engine,
    Column,
    String,
    Integer,
    Float,
    Text,
    CheckConstraint,
    or_,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
import sys
import time
import csv

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
    f"Database settings: USER={POSTGRES_USER}, HOST={POSTGRES_HOST}, PORT={POSTGRES_PORT}, DB={POSTGRES_DB}"
)

# Create database URI
DATABASE_URI = f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URI, echo=False)

# Create session
SessionFactory = sessionmaker(bind=engine)
Session = scoped_session(SessionFactory)

# Base model
Base = declarative_base()

# Book model
class Book(Base):
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

    # Method to convert object to dictionary
    def as_dict(self):
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


# Function to create tables with retries
def create_tables_with_retry(retries=5, delay=5):
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(engine)
            app.logger.info("Database tables created")
            return
        except Exception as e:
            app.logger.error(f"Error creating tables: {e}")
            if attempt < retries:
                app.logger.info(
                    f"Retrying in {delay} seconds... (Attempt {attempt}/{retries})"
                )
                time.sleep(delay)
            else:
                app.logger.error(
                    "Failed to create database tables after several attempts"
                )
                sys.exit(1)


create_tables_with_retry()

# Endpoint to check application
@app.route("/", methods=['GET'])
def hello_world():
    app.logger.info("Endpoint HelloWorld was called")
    return "Hello, World!"


# Endpoint to receive data from CDB
@app.route("/data", methods=['POST'])
def receive_data():
    app.logger.info("Endpoint /data was called")
    if not request.is_json:
        app.logger.error("Invalid request: JSON expected")
        return jsonify({"error": "Invalid request, JSON expected"}), 400

    data = request.get_json()
    app.logger.info(f"Received data: {data}")

    session = Session()
    try:
        # Delete old data
        num_deleted = session.query(Book).delete()
        app.logger.info(f"Deleted {num_deleted} old records")

        # Add new data
        for item in data:
            # Check required fields
            required_fields = ['isbn13', 'isbn10', 'title']
            for field in required_fields:
                if field not in item or not item[field]:
                    app.logger.error(f"Missing required field: {field}")
                    session.rollback()
                    return (
                        jsonify({"error": f"Missing required field: {field}"}),
                        400,
                    )

            # Create book instance
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
        app.logger.info(f"Added {len(data)} new records")
        return jsonify({"message": "Data received and saved"}), 200
    except Exception as e:
        session.rollback()
        app.logger.error(f"Error processing data: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


# Endpoint to get list of books
@app.route("/books", methods=['GET'])
def get_books():
    app.logger.info("Endpoint /books was called")
    session = Session()
    try:
        books = session.query(Book).all()
        books_list = [book.as_dict() for book in books]
        return jsonify(books_list), 200
    except Exception as e:
        app.logger.error(f"Error getting data: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


# Function to import data from data_mock.csv
def import_data_from_csv():
    csv_file_path = os.path.join(os.getcwd(), 'data_mock.csv')
    if not os.path.exists(csv_file_path):
        app.logger.error(f"File {csv_file_path} not found")
        return

    session = Session()
    try:
        # Delete old data
        num_deleted = session.query(Book).delete()
        app.logger.info(f"Deleted {num_deleted} old records")

        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                if len(row) != 12:
                    app.logger.error(f"Incorrect number of fields in row: {row}")
                    continue

                (
                    isbn13,
                    isbn10,
                    title,
                    subtitle,
                    authors,
                    categories,
                    thumbnail,
                    description,
                    published_year,
                    average_rating,
                    num_pages,
                    ratings_count,
                ) = row

                book = Book(
                    isbn13=isbn13.strip(),
                    isbn10=isbn10.strip(),
                    title=title.strip(),
                    subtitle=subtitle.strip() if subtitle else None,
                    authors=authors.strip() if authors else None,
                    categories=categories.strip() if categories else None,
                    thumbnail=thumbnail.strip() if thumbnail else None,
                    description=description.strip() if description else None,
                    published_year=int(published_year.strip())
                    if published_year
                    else None,
                    average_rating=float(average_rating.strip())
                    if average_rating
                    else None,
                    num_pages=int(num_pages.strip()) if num_pages else None,
                    ratings_count=int(ratings_count.strip())
                    if ratings_count
                    else None,
                )
                session.add(book)

        session.commit()
        app.logger.info("Data from CSV successfully imported")
    except Exception as e:
        session.rollback()
        app.logger.error(f"Error importing data: {e}")
    finally:
        session.close()


# Endpoint for searching books
@app.route("/books/search", methods=['GET'])
def search_books():
    query = request.args.get('query', '')
    app.logger.info(f"Endpoint /books/search called with query: {query}")
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
    except Exception as e:
        app.logger.error(f"Error searching books: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


# Import data from CSV on application startup if the file exists
if os.environ.get('IMPORT_CSV_ON_STARTUP', 'False') == 'True':
    import_data_from_csv()

# Run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8009)
