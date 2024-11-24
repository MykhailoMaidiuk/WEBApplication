// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BooksList from './components/BooksList';
import Cart from './components/Cart'; // Импортируем новый компонент Cart
import './index.css';

function App() {
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]); // Состояние для корзины
  const [isCartOpen, setIsCartOpen] = useState(false); // Состояние для видимости корзины

  const API_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:8009'
      : 'http://backend:8009';

  useEffect(() => {
    getBooks();
  }, []);

  const getBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Ошибка при получении данных книг:', error);
    }
  };

  const addToCart = (book) => {
    setCart([...cart, book]); // Добавляем книгу в корзину
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart); // Удаляем книгу из корзины
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen); // Переключаем видимость корзины
  };

  return (
    <div>
      <Header
        getBooks={setBooks}
        cartItems={cart.length}
        toggleCart={toggleCart} // Передаем функцию toggleCart
      />
      <div className="container">
        <BooksList books={books} addToCart={addToCart} />
      </div>
      {isCartOpen && (
        <Cart
          cartItems={cart}
          toggleCart={toggleCart}
          removeFromCart={removeFromCart}
        />
      )}
    </div>
  );
}

export default App;
