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

## API Endpoints

### User Endpoints
- **`POST /register`**: Register a new user.
- **`POST /login`**: Authenticate a user.
- **`POST /logout`**: Logout the current user.
- **`GET /current_user`**: Fetch the currently logged-in user.
- **`POST /user/update`**: Update user profile information.

### Book Endpoints
- **`GET /books`**: Fetch a paginated list of books.
- **`GET /books/search`**: Search for books by title, author, category, or ISBN.
- **`GET /books/<isbn13>`**: Fetch detailed information for a specific book.
- **`POST /books/<isbn13>/rate`**: Submit or update a user's rating for a book.
- **`GET /books/<isbn13>/user-rating`**: Retrieve the current user's rating for a specific book.

### Favorites Endpoints
- **`POST /add_to_favorites`**: Add a book to the user's favorites.
- **`POST /remove_from_favorites`**: Remove a book from the user's favorites.
- **`GET /favorites`**: Retrieve the user's list of favorite books.

### Comments Endpoints
- **`POST /books/<isbn13>/comments`**: Add a comment for a book.
- **`GET /books/<isbn13>/comments`**: Retrieve comments for a specific book.

### Categories Endpoint
- **`GET /categories`**: Fetch all available book categories.



## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Installation

1. **Clone the Repository:**

   ```bash
  git clone https://github.com/yourusername/book-catalog.git](https://github.com/MykhailoMaidiuk/WEBApplication/tree/mykhailodev
  cd book-catalog ```
