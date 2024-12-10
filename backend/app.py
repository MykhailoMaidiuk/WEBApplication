import os
import logging
import sys
from flask import Flask, render_template_string, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, current_user
from flask_migrate import Migrate
from flask_session import Session  # Přidán import
from routes.auth_routes import auth_bp
from datetime import timedelta
from routes.book_routes import books_bp
from routes.comment_routes import comments_bp
from utils.db_utils import create_tables_with_retry
from utils.csv_utils import import_data_from_csv
from database.database import db, init_app
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
session_directory = os.path.join(os.getcwd(), 'session')
os.makedirs(session_directory, exist_ok=True)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = '/usr/src/app/session'
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key')
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['REMEMBER_COOKIE_DURATION'] = timedelta(days=30)
app.config['SESSION_COOKIE_SECURE'] = 'None'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Nebo 'Strict' pro větší bezpečnost

Session(app)  # Inicializace Flask-Session
init_app(app)

migrate = Migrate(app, db, directory=os.path.join(os.getcwd(), 'migrations'))

CORS(app, supports_credentials=True, origins=["http://localhost:3009"])
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(books_bp)
app.register_blueprint(comments_bp)

@login_manager.user_loader
def load_user(user_id):
    db_session = db.session()
    try:
        user = db_session.query(User).get(user_id)
        if user:
            logging.info(f"User loaded: {user.username}")
        else:
            logging.warning(f"User not found for ID: {user_id}")
        return user
    except Exception as e:
        logging.error(f"Error loading user: {e}")
        return None
    finally:
        db_session.close()

@app.before_request
def log_request_cookies():
    logging.info(f"Received cookies: {request.cookies}")

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

def create_default_user():
    with app.app_context():  # Zajištění kontextu aplikace
        db_session = db.session
        try:
            # Zkontrolovat, zda uživatel 'user1' již existuje
            default_user = db_session.query(User).filter_by(username='user1').first()
            if not default_user:
                # Pokud uživatel neexistuje, vytvořit ho
                default_user = User(username='user1')
                default_user.set_password('123')  # Použití metody set_password
                db_session.add(default_user)
                db_session.commit()
                logging.info("Výchozí uživatel 'user1' vytvořen.")
            else:
                logging.info("Výchozí uživatel 'user1' již existuje.")
        except Exception as e:
            logging.error(f"Chyba při vytváření výchozího uživatele: {e}")
        finally:
            db_session.close()



if __name__ == '__main__':
    create_tables_with_retry()

    if os.environ.get('IMPORT_CSV_ON_STARTUP', 'False') == 'True':
        import_data_from_csv()
    app.run(host='0.0.0.0', port=8009)
