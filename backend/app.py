# backend/app.py
from flask import Flask, request, jsonify
import logging
import os
from sqlalchemy import create_engine, Column, String, Integer, Float, Text, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
import sys
import time

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
app.logger.info(f"Database settings: USER={POSTGRES_USER}, HOST={POSTGRES_HOST}, PORT={POSTGRES_PORT}, DB={POSTGRES_DB}")

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
                app.logger.error("Failed to create database tables after several attempts")  # Logování selhání po opakování
                sys.exit(1)  # Ukončení aplikace

# Volání funkce pro vytvoření tabulek
create_tables_with_retry()

# Definice kořenového endpointu
@app.route("/", methods=['GET'])
def hello_world():
    app.logger.info("HelloWorld endpoint was called")  # Logování volání endpointu
    return "Hello, World!"  # Návratová zpráva

# Definice endpointu pro příjem dat
@app.route("/data", methods=['POST'])
def receive_data():
    app.logger.info("Data endpoint was called")  # Logování volání endpointu
    if not request.is_json:
        app.logger.error("Invalid request: JSON expected")  # Logování chyby při neplatném požadavku
        return jsonify({"error": "Invalid request, JSON expected"}), 400  # Návrat chyby 400

    data = request.get_json()  # Získání JSON dat z požadavku
    app.logger.info(f"Received data: {data}")  # Logování přijatých dat

    session = Session()  # Vytvoření nové databázové session
    try:
        # Smazání starých dat v tabulce books
        num_deleted = session.query(Book).delete()
        app.logger.info(f"Deleted {num_deleted} old records")  # Logování počtu smazaných záznamů

        # Přidání nových dat
        for item in data:
            # Kontrola povinných polí
            required_fields = ['isbn13', 'isbn10', 'title']
            for field in required_fields:
                if field not in item or item[field] is None:
                    app.logger.error(f"Missing required field: {field}")  # Logování chybějícího pole
                    session.rollback()  # Vrácení změn
                    return jsonify({"error": f"Missing required field: {field}"}), 400  # Návrat chyby 400

            # Vytvoření instance Book
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
            session.add(book)  # Přidání knihy do session

        session.commit()  # Uložení změn do databáze
        app.logger.info(f"Added {len(data)} new records")  # Logování počtu přidaných záznamů
        return jsonify({"message": "Data received and saved"}), 200  # Návrat úspěchu
    except Exception as e:
        session.rollback()  # Vrácení změn při chybě
        app.logger.error(f"Error processing data: {e}")  # Logování chyby
        return jsonify({"error": "Internal server error"}), 500  # Návrat chyby 500
    finally:
        session.close()  # Uzavření session

# Spuštění Flask aplikace
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8009)  # Běh aplikace na hostiteli 0.0.0.0 a portu 8009
