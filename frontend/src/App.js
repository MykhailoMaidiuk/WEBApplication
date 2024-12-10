import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import BooksList from "./components/BooksList";
import Login from "./components/Login";
import Register from "./components/Register";
import FavoriteBooks from "./components/FavoriteBooks";
import UserProfile from "./components/UserProfile";
import Cart from './components/Cart';
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
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8009"
    : "http://backend:8009";

  // Fetch knih ze serveru
  const getBooks = async (page = currentPage) => {
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
  const addToCart = (book) => {
    const newCart = [...cart, book];
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const toggleCart = () => {
    console.log("Toggling cart");
    setIsCartOpen(!isCartOpen);
  };



  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Kontrola aktuálního uživatele
   const checkCurrentUser = async () => {
    try {
      // Nejprve zjistíme aktuálního uživatele
      const userResponse = await fetch(`${API_URL}/current_user`, {
        method: "GET",
        credentials: "include",  // Zajištění, že cookies jsou odesílány
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("Aktuální uživatel:", userData.user);

        // Nastavíme uživatele
        setUser(userData.user || null);

        // Pokud uživatel existuje, zavoláme endpoint pro detaily uživatele
        if (userData.user) {
          const response = await fetch(`${API_URL}/user`, {
            method: "GET",
            credentials: "include",  // Ujistíme se, že cookies budou odeslány
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Uživatelský detail:", data);
            setUser(data); // Uložíme detaily uživatele do stavu
          } else {
            console.error("Chyba při získávání uživatelských detailů");
            setUser(userData.user); // Pokud endpoint /user selže, stále nastavíme uživatele bez detailů
          }
        } else {
          setFavorites([]); // Pokud uživatel není přihlášený, vymažeme oblíbené knihy
        }
      } else {
        setUser(null); // Pokud /current_user vrátí chybu, nastavíme uživatele na null
        setFavorites([]); // Vymažeme oblíbené knihy v případě chyby
      }
    } catch (error) {
      console.error("Chyba při ověřování aktuálního uživatele nebo získávání oblíbených knih", error);
      setUser(null);
      setFavorites([]);  // Vymažte oblíbené knihy v případě chyby
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser)); // Optionally store it locally
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
          body: JSON.stringify({ isbn13: book.isbn13 }),
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
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        console.log("Readed categories: ", data);
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [])

  useEffect(() => {
    checkCurrentUser(); // Zavoláme funkci pro získání uživatele a detailů
    getBooks(currentPage); // Načteme knihy pro aktuální stránku
  }, [i18n.language, currentPage, setUser]); // Spustí se při změně jazyka nebo změně stránky



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
            categories={categories}
            cartItems={cart.length}
            toggleCart={toggleCart}
          />
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route
              path="/user-profile"
              element={<UserProfile user={user} updateUserProfile={updateUserProfile} />}
            />
            {isCartOpen && (
              <Cart
                cartItems={cart}
                toggleCart={toggleCart}
                removeFromCart={removeFromCart}
              />
            )}
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
                  addToCart={addToCart}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <FavoriteBooks
                  favorites={favorites || []}
                  user={user}
                  setFavorites={setFavorites}
                  toggleFavorite={toggleFavorite}
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