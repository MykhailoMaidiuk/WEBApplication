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



## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/book-catalog.git](https://github.com/MykhailoMaidiuk/WEBApplication/tree/mykhailodev
   cd book-catalog ```
