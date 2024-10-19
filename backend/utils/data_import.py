import os
import csv
from models import Book
from database import Session

def import_data_from_csv(app):
    csv_file_path = os.path.join(os.getcwd(), 'data_mock.csv')
    if not os.path.exists(csv_file_path):
        app.logger.error(f"File {csv_file_path} not found")
        return

    session = Session()
    try:
        # Delete old data
        num_deleted = session.query(Book).delete()
        app.logger.info(f"Deleted {num_deleted} old records")

        added_records = 0
        skipped_records = 0

        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            for index, row in enumerate(reader, start=1):
                if len(row) != 12:
                    app.logger.error(f"Record {index}: Incorrect number of fields ({len(row)}). Expected 12. Skipping record.")
                    skipped_records += 1
                    continue

                try:
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

                    # Check required fields
                    if not isbn13.strip() or not isbn10.strip() or not title.strip():
                        app.logger.error(f"Record {index}: Missing required fields. Skipping record.")
                        skipped_records += 1
                        continue

                    book = Book(
                        isbn13=isbn13.strip(),
                        isbn10=isbn10.strip(),
                        title=title.strip(),
                        subtitle=subtitle.strip() if subtitle else None,
                        authors=authors.strip() if authors else None,
                        categories=categories.strip() if categories else None,
                        thumbnail=thumbnail.strip() if thumbnail else None,
                        description=description.strip() if description else None,
                        published_year=int(published_year.strip()) if published_year.strip() else None,
                        average_rating=float(average_rating.strip()) if average_rating.strip() else None,
                        num_pages=int(num_pages.strip()) if num_pages.strip() else None,
                        ratings_count=int(ratings_count.strip()) if ratings_count.strip() else None,
                    )
                    session.add(book)
                    added_records += 1

                except ValueError as ve:
                    app.logger.error(f"Record {index}: Value conversion error: {ve}. Skipping record.")
                    skipped_records += 1
                    continue
                except Exception as e:
                    app.logger.error(f"Record {index}: Unexpected error: {e}. Skipping record.")
                    skipped_records += 1
                    continue

        session.commit()
        app.logger.info(f"Imported data from CSV: {added_records} added, {skipped_records} skipped.")
    except Exception as e:
        session.rollback()
        app.logger.error(f"Error importing data: {e}")
    finally:
        session.close()
