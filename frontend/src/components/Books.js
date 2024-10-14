// src/components/Books.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch books from the backend API
        axios.get('http://localhost:8009/api/books')
            .then((response) => {
                setBooks(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching books:", error);
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error fetching books: {error.message}</div>;
    }

    return (
        <div>
            <h1>Books List</h1>
            <ul>
                {books.map((book) => (
                    <li key={book.ISBN13}>
                        <h2>{book.Title}</h2>
                        <p>Author: {book.Author}</p>
                        <p>Genres: {book.Genres}</p>
                        <p>Year of Publication: {book.Year_of_Publication}</p>
                        <p>Number of Pages: {book.Number_of_Pages}</p>
                        <p>Average Rating: {book.Average_Customer_Rating}</p>
                        <p>Number of Ratings: {book.Number_of_Ratings}</p>
                        <img src={book.Cover_Image} alt={book.Title} style={{width: "100px"}}/>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Books;
