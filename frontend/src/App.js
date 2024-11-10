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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [pageSize] = useState(50); // Přidáno pageSize

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://backend:8009";

  const getBooks = async (page = 1) => {
    try {
      const response = await fetch(`${API_URL}/books?page=${page}&page_size=${pageSize}`);
      const data = await response.json();
      setBooks(data.books);
      setTotalBooks(data.totalBooks);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
      if (data.user) setUser(data.user);
    } catch (error) {
      console.error(t("Error fetching books"), error);
    }
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
    getBooks(page);
  };

  const checkCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/current_user`, {
        method: "GET",
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking current user", error);
      setUser(null);
    }
  };

  useEffect(() => {
    getBooks(currentPage);
    checkCurrentUser();
  }, [i18n.language]);

  return (
    <Router>
      <div className="app-layout">
        <aside className="sidebar">
          <Header
            getBooks={setBooks}
            user={user}
            setUser={setUser}
            setTotalPages={setTotalPages}
            setTotalBooks={setTotalBooks}
            setCurrentPage={setCurrentPage}
          />
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route
              path="/"
              element={
                <BooksList
                  books={books}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;