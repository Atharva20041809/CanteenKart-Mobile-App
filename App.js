/**
 * CanteenKart Mobile Customer App
 *
 * Navigation Architecture:
 * - Root Stack Navigator:
 *    - TableSelect (First screen: table selection & server wake-up)
 *    - MainTabs (Bottom tab navigator)
 *    - ItemDetail (Full dish view with quantity and add-to-cart)
 *    - OrderStatus (Real-time live order polling & progress step indicator)
 *
 * - MainTabs (Bottom Tab Navigator):
 *    - Menu (Searchable food catalog with category chips)
 *    - Cart (Line subtotals, quantity adjustments, badge count, checkout)
 *    - MyOrders (Order history for selected table, auto-refreshed via useFocusEffect)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AppProvider, useApp } from './src/context/AppContext';
import { colors } from './src/theme';

// Screens
import TableSelectScreen from './src/screens/TableSelectScreen';
import MenuScreen from './src/screens/MenuScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import CartScreen from './src/screens/CartScreen';
import OrderStatusScreen from './src/screens/OrderStatusScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Bottom Tab Navigator for the main screens: Menu, Cart, My Orders.
 */
function MainTabNavigator() {
  const { cartCount } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 18 }}>🍽️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.textWhite,
            fontSize: 11,
            fontWeight: '700',
          },
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 18 }}>🛒</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MyOrders"
        component={MyOrdersScreen}
        options={{
          tabBarLabel: 'My Orders',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: focused ? 22 : 18 }}>📋</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root Stack Navigator containing Table Selection, Main Tabs, Item Detail, and Order Status.
 */
function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="TableSelect"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.cardBackground,
        },
        headerTintColor: colors.primaryDark,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: colors.textPrimary,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="TableSelect"
        component={TableSelectScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{
          title: 'Dish Details',
          headerBackTitle: 'Menu',
        }}
      />
      <Stack.Screen
        name="OrderStatus"
        component={OrderStatusScreen}
        options={{
          title: 'Live Order Tracker',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Top-level application entry point.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
