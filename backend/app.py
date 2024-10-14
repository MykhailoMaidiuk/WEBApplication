from flask import Flask, request, jsonify
import logging
import os
import sys
import time
import pandas as pd  # For handling CSV files
from flask_cors import CORS
from sqlalchemy import create_engine, Column, String, Integer, Float, Text, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session

# Vytvoření instance Flask aplikace
app = Flask(__name__)


# Konfigurace logování
log_directory = os.path.join(os.getcwd(), 'logs')  # Definování adresáře pro logy
os.makedirs(log_directory, exist_ok=True)  # Vytvoření adresáře, pokud neexistuje

logging.basicConfig(
    level=logging.INFO,  # Nastavení úrovně logování na INFO
    format='%(asctime)s %(levelname)s %(message)s',  # Formát logovacích zpráv
    handlers=[
        logging.FileHandler(os.path.join(log_directory, 'app.log')),  # Logování do souboru
        logging.StreamHandler(sys.stdout)  # Logování na konzoli
    ]
)

app.logger.info("Application is starting")  # Logovací zpráva při spuštění aplikace

# Nastavení databáze pomocí environmentálních proměnných nebo výchozích hodnot
POSTGRES_USER = os.environ.get('POSTGRES_USER', 'postgres')
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD', 'postgres')
POSTGRES_DB = os.environ.get('POSTGRES_DB', 'postgres')
POSTGRES_HOST = os.environ.get('POSTGRES_HOST', 'db')
POSTGRES_PORT = os.environ.get('POSTGRES_PORT', '5432')

# Logování nastavení databáze
app.logger.info(
    f"Database settings: USER={POSTGRES_USER}, HOST={POSTGRES_HOST}, PORT={POSTGRES_PORT}, DB={POSTGRES_DB}")

# Vytvoření URI pro připojení k databázi
DATABASE_URI = f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'

# Vytvoření SQLAlchemy engine
engine = create_engine(DATABASE_URI, echo=False)

# Vytvoření konfigurace Session třídy
SessionFactory = sessionmaker(bind=engine)

# Vytvoření scoped session pro správu databázových session
Session = scoped_session(SessionFactory)

# Deklarativní základ pro modely
Base = declarative_base()


# Definice modelu Book
class Book(Base):
    __tablename__ = 'books'  # Název tabulky v databázi
    isbn13 = Column(String(13), primary_key=True, nullable=False)  # Primární klíč, ISBN13
    isbn10 = Column(String(10), nullable=False)  # ISBN10
    title = Column(String(255), nullable=False)  # Název knihy
    categories = Column(String(), nullable=True)  # Kategorie knihy
    subtitle = Column(String(), nullable=True)  # Podtitul knihy
    authors = Column(String(), nullable=True)  # Autoři knihy
    thumbnail = Column(String(), nullable=True)  # URL náhledu knihy
    description = Column(Text, nullable=True)  # Popis knihy
    published_year = Column(Integer, nullable=True)  # Rok vydání
    average_rating = Column(Float, nullable=True)  # Průměrné hodnocení
    num_pages = Column(Integer, nullable=True)  # Počet stran
    ratings_count = Column(Integer, nullable=True)  # Počet hodnocení

    # Omezení na tabulku
    __table_args__ = (
        CheckConstraint('char_length(isbn13) = 13', name='check_isbn13_length'),  # Kontrola délky ISBN13
        CheckConstraint('char_length(isbn10) = 10', name='check_isbn10_length'),  # Kontrola délky ISBN10
        CheckConstraint('char_length(title) <= 255', name='check_title_length'),  # Kontrola délky názvu
    )


# Funkce pro vytvoření tabulek s logikou opakování při chybě
def create_tables_with_retry(retries=5, delay=5):
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(engine)  # Vytvoření všech tabulek definovaných v modelech
            app.logger.info("Database tables created")  # Logování úspěchu
            return
        except Exception as e:
            app.logger.error(f"Error creating tables: {e}")  # Logování chyby
            if attempt < retries:
                app.logger.info(f"Retrying in {delay} seconds... (Attempt {attempt}/{retries})")  # Logování opakování
                time.sleep(delay)  # Čekání před dalším pokusem
            else:
                app.logger.error(
                    "Failed to create database tables after several attempts")  # Logování selhání po opakování
                sys.exit(1)  # Ukončení aplikace


# Volání funkce pro vytvoření tabulek
create_tables_with_retry()

from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)


@app.route("/api/upload", methods=['POST'])
def upload_csv():
    session = None  # Initialize session to None

    if 'file' not in request.files:
        app.logger.error("No file part in the request")
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename != 'data_mock.csv':
        app.logger.error("Incorrect file name: %s", file.filename)
        return jsonify({"error": "Incorrect file name, please upload 'data_mock.csv'"}), 400

    if file.filename == '':
        app.logger.error("No selected file")
        return jsonify({"error": "No selected file"}), 400

    try:
        # Read CSV file into Pandas DataFrame without header
        column_names = [
            'isbn13', 'isbn10', 'title', 'subtitle', 'authors',
            'categories', 'thumbnail', 'description',
            'published_year', 'average_rating', 'num_pages', 'ratings_count'
        ]

        # Try reading with a different encoding
        df = pd.read_csv(file, names=column_names, header=None, encoding='ISO-8859-1')

        # Print the columns for debugging
        app.logger.info(f"Columns in CSV: {df.columns.tolist()}")

        # Validate required columns
        required_columns = ['isbn13', 'isbn10', 'title']
        if not all(column in df.columns for column in required_columns):
            app.logger.error("Missing required columns in CSV: %s",
                             [col for col in required_columns if col not in df.columns])
            return jsonify({"error": "Missing required columns in CSV"}), 400

        session = Session()  # Create a new database session

        # Delete old data
        num_deleted = session.query(Book).delete()
        app.logger.info(f"Deleted {num_deleted} old records")

        # Insert new data into the table
        books = []
        for _, row in df.iterrows():
            book = Book(
                isbn13=row['isbn13'],
                isbn10=row['isbn10'],
                title=row['title'],
                categories=row['categories'],
                subtitle=row['subtitle'],
                authors=row['authors'],
                thumbnail=row['thumbnail'],
                description=row['description'],
                published_year=row['published_year'],
                average_rating=row['average_rating'],
                num_pages=row['num_pages'],
                ratings_count=row['ratings_count']
            )
            books.append(book)

        session.bulk_save_objects(books)  # Use bulk insert for faster save
        session.commit()
        app.logger.info(f"Added {len(books)} new records")
        return jsonify({"message": f"Successfully uploaded {len(books)} records"}), 200

    except Exception as e:
        if session:  # Only rollback if session was created
            session.rollback()
        app.logger.error(f"Error processing CSV: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        if session:  # Only close if session was created
            session.close()



@app.route("/api/books", methods=['GET'])
def get_books():
    session = Session()
    try:
        books = session.query(Book).all()
        # Convert to a list of dictionaries for JSON response
        return jsonify([{
            "ISBN13": book.isbn13,
            "ISBN10": book.isbn10,
            "Title": book.title,
            "Author": book.authors,  # Assuming authors is a string
            "Genres": book.categories,  # Assuming categories is a string
            "Year_of_Publication": book.published_year,
            "Number_of_Pages": book.num_pages,
            "Average_Customer_Rating": book.average_rating,
            "Number_of_Ratings": book.ratings_count,
            "Cover_Image": book.thumbnail  # Assuming thumbnail is a URL
        } for book in books]), 200
    except Exception as e:
        app.logger.error(f"Error fetching books: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()


CORS(app)


# Spuštění Flask aplikace
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8009)  # Běh aplikace na hostiteli 0.0.0.0 a portu 8009
