import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import BooksList from "./components/BooksList";
import Login from "./components/Login";
import Register from "./components/Register";
import FavoriteBooks from "./components/FavoriteBooks";
import "./index.css";
import "./i18n";

function App() {
  const { t, i18n } = useTranslation();
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [pageSize] = useState(50); // Velikost stránky
  const [favorites, setFavorites] = useState([]);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://backend:8009";

  // Fetch knih ze serveru
  const getBooks = async (page = 1) => {
    try {
      const response = await fetch(`${API_URL}/books?page=${page}&page_size=${pageSize}`);
      if (!response.ok) throw new Error("Failed to fetch books");
      const data = await response.json();
      setBooks(data.books);
      setTotalBooks(data.totalBooks);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error(t("Error fetching books"), error);
    }
  };

  // Kontrola aktuálního uživatele
   const checkCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/current_user`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || null);
        setFavorites(data.favorites || []);  // Nastavte favorites
        console.log('User favorites:', data.favorites);  // Přidejte log pro ověření
      } else {
        setUser(null);
        setFavorites([]);  // Vymažte favorites, pokud uživatel není přihlášen
      }
    } catch (error) {
      console.error("Error checking current user", error);
      setUser(null);
      setFavorites([]);  // Vymažte favorites v případě chyby
    }
  };

  // Přidání/odebrání knihy z oblíbených
  const toggleFavorite = async (book) => {
    console.log("toggleFavorite voláno pro knihu:", book); // Přidání logu pro diagnostiku
    const isAlreadyFavorite = favorites.some((fav) => fav.isbn13 === book.isbn13);

    try {
      if (isAlreadyFavorite) {
        // Odebrání z oblíbených
        const response = await fetch(`${API_URL}/remove_from_favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ book_isbn13: book.isbn13 }),
          credentials: "include", // Zajišťuje odesílání cookies
        });

        if (response.ok) {
          console.log("Kniha úspěšně odebrána z oblíbených");
          setFavorites((prevFavorites) =>
            prevFavorites.filter((fav) => fav.isbn13 !== book.isbn13)
          );
        } else {
          console.error("Chyba při odebrání z oblíbených", await response.text());
        }
      } else {
        // Přidání do oblíbených
        const response = await fetch(`${API_URL}/add_to_favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isbn13: book.isbn13 }),
          credentials: "include",
        });

        if (response.ok) {
          console.log("Kniha úspěšně přidána do oblíbených");
          setFavorites((prevFavorites) => [...prevFavorites, book]);
        } else {
          console.error("Chyba při přidávání do oblíbených", await response.text());
        }
      }
    } catch (error) {
      console.error("Chyba při přepínání oblíbených", error);
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
              path="/favorites"
              element={<FavoriteBooks favorites={favorites} toggleFavorite={toggleFavorite} />}
            />
            <Route
              path="/"
              element={
                <BooksList
                  books={books}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={getBooks}
                  toggleFavorite={toggleFavorite}
                  favorites={favorites}
                  user={user}
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
