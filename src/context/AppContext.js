/**
 * CanteenKart Global Application Context
 *
 * Manages:
 * 1. Selected table number (1-10)
 * 2. Customer cart state (items, quantities, local totals, add/remove/update helpers)
 * 3. Customer name (optional preference retained across screens)
 * 4. Server wake status for Render cold-start tracking
 */

import React, { createContext, useContext, useState, useMemo } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Table selected by customer (1 to 10)
  const [tableNumber, setTableNumber] = useState(null);

  // Optional customer name for friendly greetings and order labels
  const [customerName, setCustomerName] = useState('');

  // Cart state: Array of { menuItem: MenuItemObject, quantity: number }
  const [cart, setCart] = useState([]);

  // Server health/wake state: 'idle' | 'checking' | 'awake' | 'error'
  const [serverStatus, setServerStatus] = useState('idle');
  const [serverError, setServerError] = useState(null);

  /**
   * Add an item to the cart or increment quantity if it already exists.
   * @param {object} menuItem - MenuItem object ({ _id, name, price, imageUrl, ... })
   * @param {number} [quantity=1] - Quantity to add
   */
  const addToCart = (menuItem, quantity = 1) => {
    if (!menuItem || !menuItem._id) return;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.menuItem._id === menuItem._id
      );

      if (existingIndex > -1) {
        // Increment existing item
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        // Add new item
        return [...prevCart, { menuItem, quantity }];
      }
    });
  };

  /**
   * Update quantity of an item in cart.
   * If newQuantity <= 0, item is removed.
   * @param {string} menuItemId - ID of the item
   * @param {number} newQuantity - Target quantity
   */
  const updateQuantity = (menuItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.menuItem._id === menuItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  /**
   * Remove an item completely from cart.
   * @param {string} menuItemId - ID of item to remove
   */
  const removeFromCart = menuItemId => {
    setCart(prevCart => prevCart.filter(item => item.menuItem._id !== menuItemId));
  };

  /**
   * Clear all items from the cart (e.g. after successful order placement).
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * Total item quantity count in cart (for tab badge and summary).
   */
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  /**
   * Local calculated total in Rupees (₹) for UI display only.
   * Note: The server always recalculates and enforces the real total on POST /api/orders.
   */
  const cartTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (item.menuItem.price || 0) * item.quantity,
      0
    );
  }, [cart]);

  const value = {
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    serverStatus,
    setServerStatus,
    serverError,
    setServerError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to access the AppContext.
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
