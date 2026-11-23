/**
 * CanteenKart API Service
 * Built using native fetch with 60s timeout handling for Render free-tier cold starts.
 */

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config';

/**
 * Custom helper to execute HTTP requests with an AbortController timeout.
 * Provides user-friendly error messages for network drops, timeouts, and HTTP errors.
 *
 * @param {string} endpoint - API path starting with /api
 * @param {object} options - fetch options (method, headers, body)
 * @returns {Promise<any>} - parsed JSON response
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    };

    const response = await fetch(url, config);

    // Parse JSON safely
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    // Check HTTP status code
    if (!response.ok) {
      const errorMessage =
        (data && data.message) ||
        (data && data.error) ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error(
        'Server took too long to respond (60s timeout). On free hosting (Render), the server may be waking up from sleep. Please try again in a few moments.'
      );
      timeoutError.isTimeout = true;
      throw timeoutError;
    }

    // Network / connectivity issues
    if (err.message && err.message.toLowerCase().includes('network request failed')) {
      const netError = new Error(
        'Cannot connect to the server. Please check your internet connection or verify the backend URL.'
      );
      netError.isNetworkError = true;
      throw netError;
    }

    // Re-throw if already formatted
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Health check endpoint used to detect if the backend server and MongoDB are awake.
 * GET /api/health
 */
export async function getHealth() {
  try {
    const data = await request('/api/health');
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * Fetch list of menu items.
 * GET /api/menu
 * Returns array of available menu items:
 * [{ _id, name, description, price, category, imageUrl, isAvailable }]
 */
export async function getMenu() {
  try {
    const data = await request('/api/menu');
    // Adapt response: could be array directly, or { items: [...] }, or { menu: [...] }
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    if (data && Array.isArray(data.menu)) {
      return data.menu;
    }
    return [];
  } catch (err) {
    throw err;
  }
}

/**
 * Place a new customer order.
 * POST /api/orders
 *
 * @param {object} payload
 * @param {number} payload.tableNumber - Table sitting at (1-10)
 * @param {string} [payload.customerName] - Optional customer name
 * @param {Array<{ menuItemId: string, quantity: number }>} payload.items - Ordered items
 * @returns {Promise<object>} - Created order object with _id
 */
export async function placeOrder({ tableNumber, customerName, items }) {
  try {
    const payload = {
      tableNumber: Number(tableNumber),
      customerName: customerName ? customerName.trim() : '',
      items: items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: Number(item.quantity),
      })),
    };

    const data = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Adapt response: if wrapped in { order: {...} } or returned directly
    if (data && data.order) {
      return data.order;
    }
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * Get details for a specific order by ID.
 * GET /api/orders/:id
 *
 * @param {string} orderId - MongoDB _id of the order
 * @returns {Promise<object>} - Order details
 */
export async function getOrder(orderId) {
  try {
    const data = await request(`/api/orders/${orderId}`);
    if (data && data.order) {
      return data.order;
    }
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * Get all orders for a specific table number.
 * GET /api/orders?table=N
 *
 * @param {number} tableNumber - Table number
 * @returns {Promise<Array<object>>} - List of orders for the table, newest first
 */
export async function getOrdersByTable(tableNumber) {
  try {
    const data = await request(`/api/orders?table=${tableNumber}`);
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.orders)) {
      return data.orders;
    }
    return [];
  } catch (err) {
    throw err;
  }
}

export default {
  getHealth,
  getMenu,
  placeOrder,
  getOrder,
  getOrdersByTable,
};
