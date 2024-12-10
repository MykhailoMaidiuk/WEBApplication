import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logging(app):
    # Configure logging
    log_directory = os.path.join(os.getcwd(), 'logs')
    os.makedirs(log_directory, exist_ok=True)

    # Setup RotatingFileHandler
    rotating_handler = RotatingFileHandler(
        os.path.join(log_directory, 'app.log'),
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5  # Keep up to 5 backup files
    )

    rotating_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    rotating_handler.setFormatter(formatter)

    # Setup logging in Flask app
    app.logger.addHandler(rotating_handler)
    app.logger.setLevel(logging.INFO)