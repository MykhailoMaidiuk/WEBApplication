import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import BooksList from "./components/BooksList";
import Login from "./components/Login";
import Register from "./components/Register";
import "./index.css";
import "./i18n";

function App() {
  const { t, i18n } = useTranslation();
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://backend:8009";

  const getBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/books`);
      const data = await response.json();
      setBooks(data.books);
      if (data.user) setUser(data.user);
    } catch (error) {
      console.error(t("Error fetching books"), error);
    }
  };

  useEffect(() => {
    getBooks();
  }, [i18n.language]);

  return (
    <Router>
      <div className="app-layout">
        <aside className="sidebar">
          <Header getBooks={setBooks} user={user} setUser={setUser} />
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/" element={<BooksList books={books} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
