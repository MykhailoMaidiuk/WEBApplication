# backend/app.py
import csv

from flask import Flask, jsonify, request
import logging
import os

from flask_cors import CORS
from db.models import Book, db
from db.operations import get_all_books
app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:user@db:5432/mydb'
db.init_app(app)
with app.app_context():
    db.create_all()




# logs
log_directory = os.path.join(os.getcwd(), 'backend/logs')
os.makedirs(log_directory, exist_ok=True)
logging.basicConfig(
    filename=os.path.join(log_directory, 'app.log'),  # fixed
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)
#app.log a error.log
@app.route("/")
def hello_world():
    app.logger.info("HelloWorld endpoint was called")
    return "Hello, World!"


@app.route('/api/books')
def get_books():
    books = get_all_books()
    if books is None:
        app.logger.info("Errore: No books were returned")
        return jsonify({'error': 'Nepodařilo se získat knihy'}), 500

    books_data = [{
        'ISBN10': book.ISBN10,
        'ISBN13': book.ISBN13,
        'Title': book.Title,
        'Author': book.Author,
        'Genres': book.Genres,
        'Cover_Image': book.Cover_Image,  # Include cover image
        'Year_of_Publication': book.Year_of_Publication,
        'Number_of_Pages': book.Number_of_Pages,
        'Average_Customer_Rating': book.Average_Customer_Rating,
        'Number_of_Ratings': book.Number_of_Ratings
    } for book in books]

    app.logger.info(f'Returned {len(books_data)} books')
    return jsonify(books_data)


@app.route('/api/import-csv', methods=['POST'])
def import_csv():
    csv_file_path = os.path.join(os.getcwd(), 'mock.csv')  # Path to your mock.csv
    try:
        with open(csv_file_path, 'r', encoding='windows-1251') as f:
            csv_reader = csv.reader(f)
            next(csv_reader)  # Skip header row

            # Insert each row into the database
            for row in csv_reader:
                book = Book(
                    ISBN13=row[0],
                    ISBN10=row[1],
                    Title=row[2],
                    Genres=row[3],
                    Author=row[4],
                    Cover_Image=row[5],
                    Year_of_Publication=row[6],
                    Number_of_Pages=row[7],
                    Average_Customer_Rating=row[8],
                    Number_of_Ratings=row[9]
                )
                db.session.add(book)

            db.session.commit()  # Commit all the changes
            app.logger.info("Data imported successfully!")
            return jsonify({'message': 'Data imported successfully!'}), 201

    except Exception as e:
        app.logger.error(f"Error importing data: {e}")
        db.session.rollback()  # Rollback the session on error
        return jsonify({'error': 'Error importing data'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8009)  # Обновите хост и порт