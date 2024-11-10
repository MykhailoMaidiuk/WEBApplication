import os
import logging
import sys
from flask import Flask, render_template_string
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, current_user
from flask_migrate import Migrate
from flask_session import Session  # Přidán import
from routes.auth_routes import auth_bp
from datetime import timedelta
from routes.book_routes import books_bp
from utils.db_utils import create_tables_with_retry
from utils.csv_utils import import_data_from_csv
from database.database import Session as DBSession
from models.book import Base
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
app.config['SESSION_TYPE'] = 'filesystem'  # Nastavení ukládání session do souborového systému
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_FILE_DIR'] = '/usr/src/app/session'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['REMEMBER_COOKIE_DURATION'] = timedelta(days=30)
Session(app)  # Inicializace Flask-Session
migrate = Migrate(app, Base, directory=os.path.join(os.getcwd(), 'migrations'))

CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(books_bp)

@login_manager.user_loader
def load_user(user_id):
    db_session = DBSession()
    try:
        return db_session.query(User).get(user_id)
    finally:
        db_session.close()


@app.route('/')
def home():
    return render_template_string("""
        <h1>Vítejte v aplikaci</h1>
        {% if current_user.is_authenticated %}
            <p>Aktuální uživatel: {{ current_user.username }}</p>
            <p><a href="{{ url_for('auth.logout') }}">Odhlásit se</a></p>
        {% else %}
            <p><a href="{{ url_for('auth.login') }}">Přihlásit se</a> nebo <a href="{{ url_for('auth.register') }}">Registrovat</a></p>
        {% endif %}
    """)

if __name__ == '__main__':
    create_tables_with_retry()

    if os.environ.get('IMPORT_CSV_ON_STARTUP', 'False') == 'True':
        import_data_from_csv()

    app.run(host='0.0.0.0', port=8009)
