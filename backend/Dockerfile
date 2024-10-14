# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*


# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8009
ENV FLASK_ENV=development

# Copy the rest of the application
COPY . .

CMD ["python", "app.py"]