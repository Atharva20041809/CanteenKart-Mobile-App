/**
 * Application Configuration
 *
 * Change API_BASE_URL below to point to your deployed backend or local server.
 * Note: When testing on a physical phone via Expo Go, avoid "localhost" as the phone
 * cannot resolve the development computer's localhost. Use the Render URL or your LAN IP.
 */

// Deployed backend base URL on Render
export const API_BASE_URL = 'https://YOUR-SERVICE.onrender.com';

// Network request timeout in milliseconds (60 seconds to accommodate Render free-tier cold starts)
export const REQUEST_TIMEOUT_MS = 60000;

export default {
  API_BASE_URL,
  REQUEST_TIMEOUT_MS,
};
