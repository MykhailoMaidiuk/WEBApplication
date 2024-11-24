# logging_config.py
import logging
import os
from logging.handlers import RotatingFileHandler
from config import LOG_DIRECTORY

def setup_logging(app):
    if not os.path.exists(LOG_DIRECTORY):
        os.makedirs(LOG_DIRECTORY)

    log_file = os.path.join(LOG_DIRECTORY, 'app.log')

    handler = RotatingFileHandler(log_file, maxBytes=100000, backupCount=10)
    formatter = logging.Formatter(
        '%(asctime)s %(levelname)s in %(module)s: %(message)s'
    )
    handler.setFormatter(formatter)
    handler.setLevel(logging.INFO)

    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
