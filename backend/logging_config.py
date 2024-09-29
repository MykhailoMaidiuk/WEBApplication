import logging
import os

def configure_logging():
    log_dir = '/app/logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[
            logging.FileHandler(f'{log_dir}/app.log'),
            logging.StreamHandler()
        ]
    )