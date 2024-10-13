# backend/app.py
from flask import Flask, request, jsonify
import logging
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint
import sys
import time

app = Flask(__name__)

# Logging configuration
log_directory = os.path.join(os.getcwd(), 'logs')
os.makedirs(log_directory, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_directory, 'app.log')),
        logging.StreamHandler(sys.stdout)
    ]
)

app.logger.info("Application is starting")

# Database settings
POSTGRES_USER = os.environ.get('POSTGRES_USER', 'postgres')
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD', 'postgres')
POSTGRES_DB = os.environ.get('POSTGRES_DB', 'postgres')
POSTGRES_HOST = os.environ.get('POSTGRES_HOST', 'db')
POSTGRES_PORT = os.environ.get('POSTGRES_PORT', '5432')

app.logger.info(f"Database settings: USER={POSTGRES_USER}, HOST={POSTGRES_HOST}, PORT={POSTGRES_PORT}, DB={POSTGRES_DB}")

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Book model
class Book(db.Model):
    __tablename__ = 'books'
    isbn13 = db.Column(db.String(13), primary_key=True, nullable=False)
    isbn10 = db.Column(db.String(10), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    categories = db.Column(db.String(), nullable=True)
    subtitle = db.Column(db.String(), nullable=True)
    authors = db.Column(db.String(), nullable=True)
    thumbnail = db.Column(db.String(), nullable=True)
    description = db.Column(db.Text, nullable=True)
    published_year = db.Column(db.Integer, nullable=True)
    average_rating = db.Column(db.Float, nullable=True)
    num_pages = db.Column(db.Integer, nullable=True)
    ratings_count = db.Column(db.Integer, nullable=True)

    __table_args__ = (
        CheckConstraint('char_length(isbn13) = 13', name='check_isbn13_length'),
        CheckConstraint('char_length(isbn10) = 10', name='check_isbn10_length'),
        CheckConstraint('char_length(title) <= 255', name='check_title_length'),
    )

# Function to create tables with retry logic
def create_tables_with_retry(retries=5, delay=5):
    for i in range(retries):
        try:
            with app.app_context():
                db.create_all()
                app.logger.info("Database tables created")
                return
        except Exception as e:
            app.logger.error(f"Error creating tables: {e}")
            app.logger.info(f"Retrying in {delay} seconds...")
            time.sleep(delay)
    app.logger.error("Failed to create database tables after several attempts")
    sys.exit(1)

# Call the function to create tables
create_tables_with_retry()

@app.route("/", methods=['GET'])
def hello_world():
    app.logger.info("HelloWorld endpoint was called")
    return "Hello, World!"

@app.route("/data", methods=['POST'])
def receive_data():
    app.logger.info("Data endpoint was called")
    if not request.is_json:
        app.logger.error("Invalid request: JSON expected")
        return jsonify({"error": "Invalid request, JSON expected"}), 400

    data = request.get_json()
    app.logger.info(f"Received data: {data}")

    try:
        # Delete old data
        num_deleted = db.session.query(Book).delete()
        app.logger.info(f"Deleted {num_deleted} old records")

        # Add new data
        for item in data:
            # Check for required fields
            required_fields = ['isbn13', 'isbn10', 'title']
            for field in required_fields:
                if field not in item or item[field] is None:
                    app.logger.error(f"Missing required field: {field}")
                    return jsonify({"error": f"Missing required field: {field}"}), 400

            # Create book object
            book = Book(
                isbn13=item['isbn13'],
                isbn10=item['isbn10'],
                title=item['title'],
                categories=item.get('categories'),
                subtitle=item.get('subtitle'),
                authors=item.get('authors'),
                thumbnail=item.get('thumbnail'),
                description=item.get('description'),
                published_year=item.get('published_year'),
                average_rating=item.get('average_rating'),
                num_pages=item.get('num_pages'),
                ratings_count=item.get('ratings_count')
            )
            db.session.add(book)

        db.session.commit()
        app.logger.info(f"Added {len(data)} new records")
        return jsonify({"message": "Data received and saved"}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error processing data: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8009)
