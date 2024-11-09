import os
import logging
import sys
from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from routes.auth_routes import auth_bp
from routes.book_routes import books_bp
from utils.db_utils import create_tables_with_retry
from utils.csv_utils import import_data_from_csv
from database.database import Session
from models.user import User

# Configure logging
log_directory = os.path.join(os.getcwd(), 'logs')
os.makedirs(log_directory, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_directory, 'app.log')),
        logging.StreamHandler(sys.stdout),
    ],
)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key')
CORS(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(books_bp)


@login_manager.user_loader
def load_user(user_id):
    session = Session()
    return session.query(User).get(user_id)


@app.route("/", methods=['GET'])
def hello_world():
    return "Hello, World!"


if __name__ == '__main__':
    create_tables_with_retry()

    if os.environ.get('IMPORT_CSV_ON_STARTUP', 'False') == 'True':
        import_data_from_csv()

    app.run(host='0.0.0.0', port=8009)