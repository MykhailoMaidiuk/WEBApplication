from flask import Flask
from flask_cors import CORS
import os

from logging_config import setup_logging
from config import POSTGRES_USER, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB
from database import create_tables_with_retry
from routes import routes_bp
from utils import import_data_from_csv

# Create Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Setup logging
setup_logging(app)
app.logger.info("Application is starting")

# Log database settings
app.logger.info(
    f"Database settings: USER={POSTGRES_USER}, HOST={POSTGRES_HOST}, PORT={POSTGRES_PORT}, DB={POSTGRES_DB}"
)

# Create database tables with retry
create_tables_with_retry(app.logger)

# Register Blueprints
app.register_blueprint(routes_bp)

# Import data from CSV on application startup if the file exists
if os.environ.get('IMPORT_CSV_ON_STARTUP', 'False') == 'True':
    import_data_from_csv(app)

# Run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8009)
