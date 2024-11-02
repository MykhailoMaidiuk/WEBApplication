from flask import Flask
from flask_cors import CORS
import os

from logging_config import setup_logging
from config import POSTGRES_USER, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, SECRET_KEY
from database.database import create_tables_with_retry
from routes import routes_bp

# Create Flask application
app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS for all routes with credentials support

# Setup secret key for sessions
app.secret_key = SECRET_KEY  # Используйте безопасный ключ из config.py

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

# Run the application
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8009)
