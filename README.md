# CanteenKart - Mobile Customer App

A lightweight, modern, and beginner-friendly React Native mobile customer application for **CanteenKart**, built with **Expo (JavaScript only)**. Designed for college canteens and cafes, allowing seated customers to browse food items, customize quantities, add items to cart, and track live order progress directly from their table.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Screen List & User Flow](#screen-list--user-flow)
3. [Backend API & Render Cold Start Handling](#backend-api--render-cold-start-handling)
4. [Running the App with Expo Go](#running-the-app-with-expo-go)
5. [Building an Installable Android APK (EAS Build)](#building-an-installable-android-apk-eas-build)
6. [iOS Testing Note](#ios-testing-note)
7. [Architecture & Viva Explanation Guide](#architecture--viva-explanation-guide)
8. [Folder Structure](#folder-structure)
9. [Testing Checklist](#testing-checklist)

---

## 1. Project Overview
- **Role**: Customer-facing mobile client (NO login or registration required).
- **Target Users**: College students and faculty dining at the canteen.
- **Companion Apps**:
  - **Backend**: Express.js + MongoDB API deployed online (Render).
  - **Kitchen / Admin App**: Electron desktop app for kitchen staff to manage menu availability and update order stages in real time.
- **Tech Stack**:
  - React Native with Expo SDK 58 (JavaScript only, no TypeScript).
  - React Navigation (Native Stack + Bottom Tabs).
  - React Context API for global state management (no heavy libraries like Redux).
  - Native `fetch` API with custom 60-second `AbortController` timeout for cold-start resilience.
  - Native `StyleSheet.create` with an energetic warm orange accent color palette (`#FF6D00`), clean white cards, and rounded corners.

---

## 2. Screen List & User Flow

### Navigation Hierarchy
```text
Root Native Stack Navigator:
  ├── TableSelectScreen (Initial Route)
  ├── MainTabs (Bottom Tab Navigator)
  │     ├── MenuScreen (Tab 1: 🍽️ Menu)
  │     ├── CartScreen (Tab 2: 🛒 Cart with item count badge)
  │     └── MyOrdersScreen (Tab 3: 📋 My Orders)
  ├── ItemDetailScreen (Stack screen: Dish details & quantity)
  └── OrderStatusScreen (Stack screen: Live order polling & status tracker)
```

### Detailed Screens
1. **TableSelectScreen (Table 1 to 10)**:
   - Welcomes the customer and prompts: *"Which table are you sitting at?"*
   - Interactive grid of tables 1 to 10 with clear visual selection highlights.
   - Saves `tableNumber` into React Context.
   - Calls `GET /api/health` in the background to wake up sleeping Render servers and displays the `ServerWakeBanner`.

2. **MenuScreen**:
   - Header shows current table (e.g., *"Table 4"*) with a *"Change Table"* button.
   - Real-time search bar that filters menu items by dish name and description (case-insensitive).
   - Horizontal category chips: `All`, `Snacks`, `Meals`, `Drinks`, `Desserts`.
   - Item cards with image fallback, name, category, description, price in Rupees (`₹`), and an `+ Add` button.
   - Out-of-stock items (`isAvailable: false`) are greyed out with an "Unavailable" badge.
   - Pull-to-refresh and interactive loading/error/empty states.

3. **ItemDetailScreen**:
   - High-resolution hero image with placeholder fallback.
   - Detailed dish description, price, and category tag.
   - Quantity selector (`−` / `＋`, minimum 1).
   - Prominent *"Add to Cart"* button with instant feedback.

4. **CartScreen**:
   - List of items added to cart with thumbnails, quantity steppers, and remove (`✕`) buttons.
   - Line-by-line subtotals and grand total calculation for client display.
   - Optional *"Customer Name"* input field.
   - `KeyboardAvoidingView` to prevent keyboard overlap on mobile devices.
   - *"Place Order"* button that sends `POST /api/orders` to the server.
   - Automatically clears cart and navigates to the live tracker on success.

5. **OrderStatusScreen**:
   - Shows order ID (short format `#XXXXXX`), table number, customer name, items list, and total amount.
   - **4-Stage Visual Progress Bar**: `New` ➔ `Preparing` ➔ `Ready` ➔ `Served`.
   - **Live Polling**: Queries `GET /api/orders/:id` every 5 seconds.
   - **Automatic Cleanup**: Polling interval is automatically cleared when the component unmounts OR when the status reaches `"Served"`.

6. **MyOrdersScreen**:
   - Displays all historical orders for the seated table (`GET /api/orders?table=N`), sorted newest first.
   - Automatically refetches when navigating to this tab using `useFocusEffect`.
   - Tapping any order card navigates directly to its `OrderStatusScreen`.

---

## 3. Backend API & Render Cold Start Handling

### Changing the Backend URL
All API requests use the base URL configured in [`src/config.js`](file:///Users/atharvatiwari/Desktop/canteenkartmobile/src/config.js):

```javascript
// src/config.js
export const API_BASE_URL = 'https://YOUR-SERVICE.onrender.com';
export const REQUEST_TIMEOUT_MS = 60000;
```
> **Tip for local testing**: If running the backend locally on your computer, your physical phone cannot resolve `localhost`. Use your computer's local Wi-Fi IP address (e.g. `http://192.168.1.15:5000`) instead of `localhost`.

### Handling Render Free-Tier Cold Starts
Free hosting platforms like Render put idle web services to sleep after 15 minutes of inactivity. When a new request arrives, it can take 30 to 60 seconds for the backend instance and MongoDB connection to spin back up.

CanteenKart addresses this through:
1. **60-Second Fetch Timeout (`AbortController`)**: Standard fetch would hang or drop quickly; our custom API wrapper waits up to 60 seconds and produces friendly error messages if a timeout occurs.
2. **Background Health Wakeup**: On app launch (`TableSelectScreen`), the app immediately fires a lightweight `GET /api/health` call in the background. A friendly banner (*"Waking up the server, this can take up to a minute on free tier..."*) informs the customer so they are not surprised by a brief initial delay.

---

## 4. Running the App with Expo Go

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Start the Expo Development Server**:
   ```bash
   npx expo start
   ```

3. **Open on Physical Device**:
   - **Android**: Install **Expo Go** from the Google Play Store. Open Expo Go and tap **"Scan QR code"**, then scan the QR code displayed in your terminal or browser.
   - **iOS**: Install **Expo Go** from the Apple App Store. Open the default iOS Camera app, point it at the terminal QR code, and tap the prompt to open in Expo Go.

> **Note**: Because the backend is deployed online (on Render), your phone does **NOT** need to be on the same Wi-Fi network as your development laptop. You can test over mobile data or any Wi-Fi.

---

## 5. Building an Installable Android APK (EAS Build)

You can build a standalone `.apk` file that installs directly onto any Android phone without needing Expo Go.

### Steps:
1. **Install EAS CLI globally**:
   ```bash
   npm install -g eas-cli
   ```

2. **Log in to your Expo account**:
   ```bash
   eas login
   ```
   *(If you don't have an Expo account, create a free one at [expo.dev](https://expo.dev)).*

3. **Configure Build Project** (run once if prompted):
   ```bash
   eas build:configure
   ```

4. **Trigger the APK Build**:
   ```bash
   npm run build:apk
   # or run directly:
   eas build -p android --profile preview
   ```

5. **Download & Install**:
   - EAS will build the app in the cloud.
   - Once completed, the terminal will print a direct download URL and display a QR code.
   - Open the link on your Android phone, download the `.apk` file, and tap to install (enable **"Install from unknown sources"** in your phone settings if prompted).

---

## 6. iOS Testing Note

Apple requires an active, paid **Apple Developer Program membership (\$99/year)** to generate standalone installable iOS `.ipa` builds.

Therefore, for college evaluation and student testing on iPhones, testing is performed using **Expo Go**, which is 100% free and supports all application features without a paid developer account.

---

## 7. Architecture & Viva Explanation Guide

When presenting this project for your course viva or lab examination, here are the key technical concepts to explain:

### 1. Navigation Architecture
- **Nested Navigators**: Combines a `createNativeStackNavigator` with a `createBottomTabNavigator`. The root stack handles top-level screen transitions (`TableSelect` ➔ `MainTabs` ➔ `ItemDetail` / `OrderStatus`), while the bottom tabs allow seamless switching between `Menu`, `Cart`, and `MyOrders`.
- **Dynamic Tab Badges**: The Cart tab displays a dynamic badge showing the count of items currently in the cart (`cartCount`).

### 2. Global State Management (React Context API)
- Implemented in [`src/context/AppContext.js`](file:///Users/atharvatiwari/Desktop/canteenkartmobile/src/context/AppContext.js) using standard `createContext`, `useState`, and `useMemo`.
- Stores `tableNumber`, `customerName`, `cart` array, and helpers (`addToCart`, `updateQuantity`, `removeFromCart`, `clearCart`).
- **Security & Integrity Note**: The client calculates `cartTotal` for display purposes only. When placing an order (`POST /api/orders`), the app only sends item IDs and quantities. The backend server recalculates prices from the database, preventing price tampering.

### 3. Asynchronous Networking & Error Handling
- Implemented in [`src/services/api.js`](file:///Users/atharvatiwari/Desktop/canteenkartmobile/src/services/api.js) using native `fetch`.
- Features an `AbortController` timeout configured for 60 seconds.
- Categorizes errors into network loss, server timeouts, and HTTP status codes, rendering user-friendly UI views with `Retry` buttons.

### 4. Real-time Order Polling with Cleanup
- In [`src/screens/OrderStatusScreen.js`](file:///Users/atharvatiwari/Desktop/canteenkartmobile/src/screens/OrderStatusScreen.js), live order tracking is achieved with `setInterval` polling every 5000ms.
- **Memory Leak Prevention**: The polling timer is stored in a `useRef` and explicitly cleared inside the `useEffect` cleanup function when the component unmounts. Furthermore, polling is automatically stopped once the order status transitions to `"Served"`.

### 5. Parameter Passing between Routes
- Items are passed from `MenuScreen` to `ItemDetailScreen` using `navigation.navigate('ItemDetail', { item })`.
- When an order is placed from `CartScreen`, the created order ID is passed to `OrderStatusScreen` via `navigation.navigate('OrderStatus', { orderId: createdOrder._id })`.

---

## 8. Folder Structure

```text
canteenkartmobile/
├── App.js                      # Root application entry with NavigationContainer & Providers
├── app.json                    # Expo application metadata (name, slug, android package)
├── eas.json                    # EAS Build configuration for APK and production builds
├── package.json                # Project dependencies and build scripts
├── .gitignore                  # Excludes node_modules, .expo, .env, *.log
└── src/
    ├── config.js               # Central API URL (API_BASE_URL) & timeout constants
    ├── theme.js                # Warm orange palette, typography, spacing, status colors
    ├── context/
    │   └── AppContext.js       # Global state (table, cart, helpers, badge counts)
    ├── services/
    │   └── api.js              # Native fetch service with 60s timeout & error parser
    ├── components/
    │   ├── CategoryChips.js    # Horizontal category filters (All, Snacks, Meals, etc.)
    │   ├── ErrorView.js        # Friendly error view with Try Again action
    │   ├── LoadingView.js      # Centered activity spinner with custom label
    │   ├── MenuItemCard.js     # Food dish card with image fallback & add-to-cart
    │   ├── QuantitySelector.js # Reusable minus/plus quantity stepper
    │   ├── ServerWakeBanner.js # Cold-start alert with retry button
    │   └── StatusBadge.js      # Color-coded badge (New, Preparing, Ready, Served)
    └── screens/
        ├── TableSelectScreen.js# Table grid selection (1-10) & server wake-up trigger
        ├── MenuScreen.js       # Searchable catalog with category chips & pull-to-refresh
        ├── ItemDetailScreen.js # Detailed dish view with large image & quantity stepper
        ├── CartScreen.js       # Cart items, line subtotals, name input, and order placement
        ├── OrderStatusScreen.js# Live order tracker with 4-step progress & 5s polling
        └── MyOrdersScreen.js   # Table order history refreshed on tab focus
```

---

## 9. Testing Checklist

Use this checklist during development and demonstration:

- [x] **Setup & Cold Start**: Run `npx expo start`, scan with phone. Notice the server wake-up banner on `TableSelectScreen` while backend wakes up.
- [x] **Table Selection**: Select a table (e.g. Table 3) and tap *"Continue with Table 3"*. Ensure Table 3 is reflected in the Menu header.
- [x] **Menu Browsing & Search**:
  - Filter by category chips (`Snacks`, `Meals`, `Drinks`, `Desserts`).
  - Search for items in the search box (e.g. "coffee", "sandwich").
  - Test pull-to-refresh.
- [x] **Item Detail & Quantity**:
  - Tap on any dish card to open `ItemDetailScreen`.
  - Adjust quantity using `+` and `-`.
  - Tap *"Add to Cart"* and verify the alert confirmation.
- [x] **Cart Management & Badge**:
  - Confirm the bottom tab shows the dynamic badge count (e.g. `2`).
  - Modify quantity in `CartScreen`; ensure line subtotals and grand total update immediately.
  - Decrement quantity to 0 or tap `✕` to verify item removal.
  - Verify `KeyboardAvoidingView` behavior by entering a customer name.
- [x] **Order Placement & Live Sync**:
  - Tap *"Place Order"*.
  - Confirm instant redirection to `OrderStatusScreen`.
  - Verify that the order appears immediately on the desktop admin app's Live Orders board.
  - When the admin updates status from `New` ➔ `Preparing` ➔ `Ready` ➔ `Served`, verify the mobile screen updates within 5 seconds.
  - Verify that polling halts once the status is `Served`.
- [x] **Table Orders History**:
  - Switch to the `MyOrders` tab.
  - Verify that previous orders for your table appear sorted newest first.
  - Tap an order to return to its live status tracker.
- [x] **Network Offline Resilience**:
  - Turn on Airplane Mode or disconnect Wi-Fi.
  - Tap *"Try Again"* or pull-to-refresh to verify friendly error messages without app crashes.
