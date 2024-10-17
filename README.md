# **Books Application**

A full-stack application for displaying and managing book data. The backend is built with Flask and connects to a PostgreSQL database, while the frontend is developed using React. Docker is used for containerization to simplify deployment.

---

## **Table of Contents**

- [Description](#description)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Docker Usage](#docker-usage)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## **Description**

This application fetches book data from a REST service and displays it on the frontend. The backend provides an endpoint to receive book data in JSON format, processes it, and stores it in a PostgreSQL database. The frontend fetches data from the backend and displays it to the user.

---

## **Features**

- **Backend:**
  - Flask application with REST API.
  - PostgreSQL database integration using SQLAlchemy.
  - Data validation and error handling.
  - Logging to file and console.
- **Frontend:**
  - React application with component-based architecture.
  - Responsive design using CSS.
  - Fetches and displays book data from the backend.
- **Dockerized:**
  - Multi-stage Docker builds for optimized images.
  - Docker Compose configuration for managing multiple services.

---

## **Prerequisites**

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) and npm (if running frontend locally)
- [Python 3.10+](https://www.python.org/downloads/) and pip (if running backend locally)
- [PostgreSQL](https://www.postgresql.org/download/) (if not using Docker for the database)

---

## **Installation**

### **Clone the Repository**

```bash
git clone https://gitlab.tul.cz/mykhailo.maidiuk/bookweb/-/tree/main
cd bookweb
