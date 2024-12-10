// src/components/Cart.js
import React from 'react';

function Cart({ cartItems, toggleCart, removeFromCart, proceedToCheckout }) {
  const totalPrice = cartItems.reduce((sum, book) => sum + book.price, 0);

  return (
    <div className="cart-overlay">
      <div className="cart">
        <button className="cart__close" onClick={toggleCart}>
          Close
        </button>
        <h2>Basket</h2>
        {cartItems.length === 0 ? (
          <p>Your basket empty</p>
        ) : (
          <>
            <ul>
              {cartItems.map((item, index) => (
                <li key={index} className="cart__item">
                  <img
                    src={item.thumbnail || 'https://via.placeholder.com/50'}
                    alt={item.title}
                    className="cart__item-image"
                  />
                  <div className="cart__item-info">
                    <p className="cart__item-title">{item.title}</p>
                    <p className="cart__item-category">
                      {item.categories || 'No category'}
                    </p>
                    <p className="cart__item-price">{item.price} Kč</p>
                  </div>
                  <button
                    className="cart__item-remove"
                    onClick={() => removeFromCart(index)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <p className="cart__total">Total: {totalPrice} Kč</p>
            <button className="cart__checkout" onClick={proceedToCheckout}>
              Accepte order 
            </button>
          </>
        )}
      </div>
    </div>
  );
}


export default Cart;