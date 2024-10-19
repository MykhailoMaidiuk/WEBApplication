# Book Catalog Application

A full-stack web application that allows users to browse and search for books. The frontend is built with React and served by Nginx, while the backend is developed using Flask and connects to a PostgreSQL database. The entire application is containerized using Docker and orchestrated with Docker Compose for seamless deployment and scalability.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Browse Books:** View a list of books with their cover images, titles, and categories.
- **Search Functionality:** Search for books by title, author, or category.
- **Responsive Design:** User-friendly interface that works well on various devices.
- **Dockerized Setup:** Easily deploy the application using Docker and Docker Compose.
- **Logging:** Comprehensive logging for both frontend and backend to aid in debugging and monitoring.

## Technologies Used

- **Frontend:**
  - React
  - Nginx
  - CSS

- **Backend:**
  - Flask
  - SQLAlchemy
  - PostgreSQL
  - Flask-CORS

- **Containerization:**
  - Docker
  - Docker Compose

- **Others:**
  - DBeaver (SQL Client)

## Environment Variables

Create a `.env` file in the root directory of the project and define the following variables:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=****
POSTGRES_DB=postgres
CB_SERVER_HOST=localhost
CB_SERVER_PORT=8978
```
### **Get Books**

- **URL:** `/books`
- **Method:** `GET`
- **Description:** Retrieves a list of all books.
- **Response:**

  ```json
  [
    {
      "isbn13": "9781556434952",
      "isbn10": "1556434952",
      "title": "Empire 2.0",
      "subtitle": "A Modest Proposal for a United States of the West",
      "authors": "Régis Debray",
      "categories": "Political Science",
      "thumbnail": "http://example.com/image.jpg",
      "description": "Description of the book",
      "published_year": 2004,
      "average_rating": 4.75,
      "num_pages": 144,
      "ratings_count": 4
    },
    ...
  ]

## API Endpoints

### `/data` Endpoint for CDB Data Import

**URL:** `/data`  
**Method:** `POST`  
**Content-Type:** `application/json`

**Description:**

This endpoint is designed to receive data from the Central Database (CDB). It accepts a JSON payload containing an array of book records and imports them into the application's database. Before importing, it deletes all existing records to ensure the database is up-to-date with the latest data from the CDB.

**Request Body Format:**

- The request body must be a JSON array of objects.
- Each object represents a book and should include the required fields.
- Fields that are not applicable can be omitted or set to `null`.

**Required Fields for Each Book Object:**

- `isbn13` (string, 13 characters): The 13-digit ISBN number.
- `isbn10` (string, 10 characters): The 10-digit ISBN number.
- `title` (string): The title of the book.

**Optional Fields:**

- `subtitle` (string): The subtitle of the book.
- `authors` (string): The authors of the book.
- `categories` (string): The categories or genres of the book.
- `thumbnail` (string): A URL to an image of the book cover.
- `description` (string): A brief description or synopsis of the book.
- `published_year` (integer): The year the book was published.
- `average_rating` (float): The average rating of the book.
- `num_pages` (integer): The number of pages in the book.
- `ratings_count` (integer): The number of ratings the book has received.

**Example Request:**

```http
POST /data HTTP/1.1
Host: your-api-domain.com
Content-Type: application/json

[
  {
    "isbn13": "9781234567897",
    "isbn10": "1234567897",
    "title": "Sample Book Title",
    "subtitle": "An Example Subtitle",
    "authors": "Jane Doe, John Smith",
    "categories": "Fiction, Adventure",
    "thumbnail": "http://example.com/thumbnail.jpg",
    "description": "This is a sample book description.",
    "published_year": 2020,
    "average_rating": 4.5,
    "num_pages": 320,
    "ratings_count": 150
  },
  {
    "isbn13": "9789876543210",
    "isbn10": "9876543210",
    "title": "Another Sample Book",
    "authors": "Alice Johnson",
    "categories": "Non-Fiction",
    "published_year": 2018,
    "num_pages": 250
  }
]


## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/book-catalog.git](https://github.com/MykhailoMaidiuk/WEBApplication/tree/mykhailodev
   cd book-catalog ```
