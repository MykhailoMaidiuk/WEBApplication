# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /usr/src/app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода и файла CSV
COPY . .

# Установка переменной окружения для импорта CSV при запуске
ENV IMPORT_CSV_ON_STARTUP=True

CMD ["python", "app.py"]
