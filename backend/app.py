# backend/app.py
from flask import Flask
import logging
import os

app = Flask(__name__)

# logs
log_directory = os.path.join(os.getcwd(), 'backend/logs')
os.makedirs(log_directory, exist_ok=True)
logging.basicConfig(
    filename=os.path.join(log_directory, 'app.log'),  # fixed
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)
#app.log a error.log
@app.route("/")
def hello_world():
    app.logger.info("HelloWorld endpoint was called")
    return "Hello, World!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8009)  # Обновите хост и порт