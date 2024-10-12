# backend/app.py
from flask import Flask, jsonify
import requests
import logging
import psycopg2
import os


DB_CONFIG = {
    'host': 'localhost',
    'dbname': 'your_database',
    'user': 'postgres',
    'password': 'your_password',
    'port': 5432
}

app = Flask(__name__)
#API_BASE_URL = "https://wea.nti.tul.cz:1337/"
csv_file_path = "../data_mock.csv"

conn = psycopg2.connect(host="localhost", dbname="postgres", user="postgres", password="postgres" ,port=5432)
cur = conn.cursor()

cur.execute("""
    CREATE TABLE IF NOT EXISTS book (
        isbn13 VARCHAR(13) NOT NULL,               -- ISBN 13 identifier, exactly 13 characters
        isbn10 VARCHAR(10) NOT NULL,               -- ISBN 10 identifier, exactly 10 characters
        title VARCHAR(255) NOT NULL,               -- Book title, maximum 255 characters
        categories VARCHAR(255),                   -- Comma-separated list of categories
        subtitle VARCHAR(255),                     -- Book subtitle, can be NULL
        authors VARCHAR(255),                      -- Semicolon-separated list of authors
        thumbnail TEXT,                            -- URL to the book's thumbnail
        description TEXT,                          -- Short description of the book
        published_year INTEGER,                    -- Year of publication, as an integer
        average_rating NUMERIC(3, 2),              -- Average rating (e.g., 3.60), supports up to 2 decimal places
        num_pages INTEGER,                         -- Number of pages
        ratings_count INTEGER,                     -- Number of ratings
        PRIMARY KEY (isbn13)                       -- ISBN13 as the primary key
    );
""")

try:
    with open(csv_file_path, 'r') as f:
        # Skip the header row in the CSV (if it exists)
        next(f)
        # Use the COPY command to load the data into the table
        cur.copy_expert("COPY book (isbn13, isbn10, title, categories,"
                        " subtitle, authors, thumbnail, description, published_year,"
                        " average_rating, num_pages, ratings_count) FROM STDIN WITH CSV", f)
    print("Data imported successfully!")

except Exception as e:
    print(f"Error importing data: {e}")
    conn.rollback()

conn.commit()
cur.close()
conn.close()

# logs
log_directory = os.path.join(os.getcwd(), 'backend/logs')
os.makedirs(log_directory, exist_ok=True)
logging.basicConfig(
    filename=os.path.join(log_directory, 'app.log'),  # fixed
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)

@app.route('/update_books', methods=['GET'])
def update_books():
    response = requests.get('http://wea.nti.tul.cz:1337/')
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch data from the CDB service"}), 500

    books_data = response.json()
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        cur.execute("DELETE FROM book")

        for book in books_data:
            cur.execute("""
                INSERT INTO book (isbn13, isbn10, title, categories, subtitle, authors, thumbnail, description, published_year, average_rating, num_pages, ratings_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                book['isbn13'],
                book['isbn10'],
                book['title'],
                book['categories'],
                book.get('subtitle', None),
                book['authors'],
                book['thumbnail'],
                book['description'],
                book['published_year'],
                book.get('average_rating', None),
                book.get('num_pages', None),
                book.get('ratings_count', None)
            ))

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Books updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def hello_world():
    app.logger.info("HelloWorld endpoint was called")
    return "Hello, World!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8009)