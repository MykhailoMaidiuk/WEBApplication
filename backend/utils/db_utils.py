import time
from models.book import Base
from database.database import engine
from models.audit_log import AuditLog  # Přidejte tento řádek

def create_tables_with_retry(retries=5, delay=5):
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(engine)
            return
        except Exception as err:
            if attempt < retries:
                time.sleep(delay)
            else:
                raise