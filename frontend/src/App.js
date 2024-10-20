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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState(null);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://backend:8009";

  const getBooks = async (page = 1) => {
    try {
      const response = await fetch(`${API_URL}/books?page=${page}&limit=8`);
      const data = await response.json();
      setBooks(data.books);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      if (data.user) setUser(data.user);
    } catch (error) {
      console.error(t("Error fetching books"), error);
    }
  };

  useEffect(() => {
    getBooks(currentPage);
  }, [i18n.language, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      getBooks(newPage);
    }
  };

  return (
    <Router>
      <div>
        <Header getBooks={setBooks} user={user} setUser={setUser} />
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />

          <Route path="/register" element={<Register setUser={setUser} />} />

          <Route
            path="/"
            element={
              <div className="container">
                <BooksList books={books} />
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {t("Previous")}
                  </button>
                  <span>{`${t("Page")} ${currentPage} ${t("of")} ${totalPages}`}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {t("Next")}
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
