# Flask & React App with PostgreSQL

This project is a full-stack web application that consists of a Flask-based backend, a React frontend, and a PostgreSQL database. The backend serves API endpoints for managing book data, while the frontend provides a user interface. The application uses Docker for containerization and orchestration of services.

## Features
- Flask API for handling book data.
- PostgreSQL database for storing and managing book records.
- React frontend served using NGINX.
- Docker Compose for easy setup and management of services.
- CloudBeaver SQL client for managing the PostgreSQL database via a web interface.

## Table of Contents
- [Endpoint Documentation](#endpoint-documentation)
- [Docker Configuration](#docker-configuration)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [Logs](#logs)

---

## Endpoint Documentation

### `/update_books` - Update Books

**Method:** `GET`  
**URL:** `/update_books`  
**Description:** This endpoint fetches book data from an external API (http://wea.nti.tul.cz:1337/), clears the existing data in the `book` table of the PostgreSQL database, and then inserts the new data.

**Request:**  
No parameters or body are required.

**Response:**

- **Success (200):**  
  - `message`: `"Books updated successfully"`
  - Example:  
    ```json
    {
      "message": "Books updated successfully"
    }
    ```

- **Error (500):**  
  If the API call or the database update fails, the response will contain an error message.
  - `error`: Describes the problem.
  - Example:  
    ```json
    {
      "error": "Failed to fetch data from the CDB service"
    }
    ```

---

## Docker Configuration

This application uses Docker Compose to manage and run the backend, frontend, PostgreSQL database, and an SQL client.

### Docker Compose Services

1. **Backend (sk10-web)**:
   - **Dockerfile**: `backend/Dockerfile`
   - **Ports**: Exposes port `8009` (Flask app) on the host.
   - **Volumes**: Binds the local `backend/logs` directory to `/usr/src/app/logs` inside the container for logging.
   - **Environment Variables**: Uses `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `POSTGRES_HOST` for database configuration.

2. **Frontend (sk10-frontend)**:
   - **Dockerfile**: `frontend/react-app/Dockerfile`
   - **Ports**: Exposes port `3009` on the host to serve the React app via NGINX.
   - **Volumes**: Binds the local `frontend/logs` directory to `/var/log/nginx` inside the container for logging NGINX output.

3. **Database (my_postgres)**:
   - **Image**: `postgres:latest`
   - **Ports**: Exposes port `5432` (PostgreSQL) on the host.
   - **Volumes**: A Docker volume `postgres-data` is used to persist PostgreSQL data across container restarts.
   - **Environment Variables**: `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` for initializing the PostgreSQL instance.

4. **SQL Client (sk10-sql-client)**:
   - **Image**: `dbeaver/cloudbeaver:latest`
   - **Ports**: Exposes port `10009` on the host for accessing the CloudBeaver SQL client.

### Networks and Volumes

- **Network**: All services are connected to a Docker network named `cdb-network`. It allows the backend, database, and other services to communicate seamlessly.
- **Volumes**: The `postgres-data` volume is used to store the PostgreSQL data persistently.

---

## Running the Application

### Prerequisites

- Docker and Docker Compose installed on your system.
- Environment variables set for the PostgreSQL configuration in a `.env` file or through your shell environment:
  - `POSTGRES_USER`: Username for PostgreSQL.
  - `POSTGRES_PASSWORD`: Password for PostgreSQL.
  - `POSTGRES_DB`: Database name.
  - `CB_SERVER_HOST`: Host for CloudBeaver SQL client.
  - `CB_SERVER_PORT`: Port for CloudBeaver SQL client.

### Steps to Run

1. Clone the repository and navigate to the project directory.
2. Build and start all services using Docker Compose:

   ```bash
   docker-compose up --build

## Database Setup

The PostgreSQL database table `book` is created if it does not already exist, with the following schema:

```sql
CREATE TABLE IF NOT EXISTS book (
    isbn13 VARCHAR(13) NOT NULL,
    isbn10 VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    categories VARCHAR(255),
    subtitle VARCHAR(255),
    authors VARCHAR(255),
    thumbnail TEXT,
    description TEXT,
    published_year INTEGER,
    average_rating NUMERIC(3, 2),
    num_pages INTEGER,
    ratings_count INTEGER,
    PRIMARY KEY (isbn13)
);
