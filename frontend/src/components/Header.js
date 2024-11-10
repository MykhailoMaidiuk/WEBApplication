import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import SortingOptions from "./SortingOptions";
import LanguageSwitcher from "./LanguageSwitcher";
import "../i18n.js";

function Header({
  getBooks,
  user,
  setUser,
  setTotalPages,
  setTotalBooks,
  setCurrentPage
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [isbn13, setIsbn13] = useState("");
  const location = useLocation();

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://backend:8009";

  const handleSubmit = (e) => {
    e.preventDefault();
    getBooksBySearch();
  };

  const getBooksBySearch = async (sortBy = "title_asc") => {
    try {
      const queryParams = new URLSearchParams({
        title,
        author,
        category,
        isbn13,
        sort_by: sortBy,
        page: 1, // Reset to first page on new search
        page_size: 50
      });
      const response = await fetch(`${API_URL}/books/search?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await response.json();
      if (data.books.length === 0) {
        alert(t("No books found"));
      }
      getBooks(data.books);
      setTotalPages(data.totalPages);
      setTotalBooks(data.totalBooks);
      setCurrentPage(1);
    } catch (error) {
      console.error(t("Error searching for books"), error);
      getBooks([]);
      setTotalPages(0);
      setTotalBooks(0);
      setCurrentPage(1);
    }
  };

  const handleSortChange = (newSortBy) => {
    getBooksBySearch(newSortBy);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
      setUser(null);
    } catch (error) {
      console.error(t("Error logging out"), error);
    }
  };

  const isLoginOrRegister = location.pathname === "/login" || location.pathname === "/register";

  return (
    <header className="header__filters">
      <Link to="/" className="header__logo">{t("Books")}</Link>
      <LanguageSwitcher />
      {user ? (
        <div>
          <span>{t("Hello")}, {user.username}!</span>
          <button onClick={handleLogout}>{t("Logout")}</button>
        </div>
      ) : (
        <div className="auth-links">
          <Link to="/login">{t("Login")}</Link>
          <Link to="/register">{t("Register")}</Link>
        </div>
      )}
      <SortingOptions onSortChange={handleSortChange} />

      <form onSubmit={handleSubmit} className={isLoginOrRegister ? "hidden" : ""}>
        <br/><br/><br/><p>{t("Title")}</p>
        <input
          className="header__search"
          type="text"
          placeholder={t("Search by title")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p>{t("Author")}</p>
        <input
          className="header__search"
          type="text"
          placeholder={t("Search by author")}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <p>{t("Category")}</p>
        <input
          className="header__search"
          type="text"
          placeholder={t("Search by category")}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <p>{t("ISBN13")}</p>
        <input
          className="header__search"
          type="text"
          placeholder={t("Search by ISBN13")}
          value={isbn13}
          onChange={(e) => setIsbn13(e.target.value)}
        />
        <button type="submit">{t("Search")}</button>
      </form>
    </header>
  );
}

export default Header;
