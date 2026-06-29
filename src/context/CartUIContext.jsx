/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const CartUIContext = createContext();

export function CartUIProvider({ children }) {
  const [isCartOpen, setCartOpen] = useState(false);

  return (
    <CartUIContext.Provider value={{ isCartOpen, setCartOpen }}>
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  return useContext(CartUIContext);
}
