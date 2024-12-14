import csv
import os
from database.database import Session
from models.book import Book

def import_data_from_csv():
    csv_file_path = os.path.join(os.getcwd(), 'data_mock.csv')
    if not os.path.exists(csv_file_path):
        return

    session = Session()
    try:
        num_deleted = session.query(Book).delete()

        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                if len(row) != 12:
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
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()