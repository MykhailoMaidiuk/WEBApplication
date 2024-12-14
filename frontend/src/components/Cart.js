import React from 'react';

function Cart({ cartItems, toggleCart, removeFromCart, proceedToCheckout }) {
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.book.price || 0) * item.quantity, 0);

  return (
    <div className="cart-overlay">
      <div className="cart">
        <button className="cart__close" onClick={toggleCart}>
          Close
        </button>
        <h2>Basket</h2>
        {cartItems.length === 0 ? (
          <p>Your basket is empty</p>
        ) : (
          <>
            <ul>
              {cartItems.map((item, index) => (
                <li key={index} className="cart__item">
                  <img
                    src={item.book.thumbnail || 'https://via.placeholder.com/50'}
                    alt={item.book.title}
                    className="cart__item-image"
                  />
                  <div className="cart__item-info">
                    <p className="cart__item-title">{item.book.title}</p>
                    <p className="cart__item-category">
                      {item.book.categories && item.book.categories.length > 0
                        ? item.book.categories.join(", ")
                        : 'No category'}
                    </p>
                    <p className="cart__item-price">
                      {item.book.price ? `${item.book.price} Kč` : 'Not priced'}
                    </p>
                    <p className="cart__item-quantity">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <button
                    className="cart__item-remove"
                    onClick={() => removeFromCart(item.book.isbn13)}
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
