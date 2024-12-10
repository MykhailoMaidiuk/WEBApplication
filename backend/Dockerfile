# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install pylint

RUN pip install flask-login flask-bcrypt

# Copy source code and CSV file
COPY . .

# Set environment variable to import CSV on startup
ENV IMPORT_CSV_ON_STARTUP=True

CMD ["python", "app.py"]
