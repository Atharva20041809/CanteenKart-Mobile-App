/**
 * MyOrdersScreen (Tab)
 * Lists all orders placed for the current table (GET /api/orders?table=N), sorted newest first.
 * Refetches automatically whenever the tab gains focus (useFocusEffect) and supports pull-to-refresh.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getOrdersByTable } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingView from '../components/LoadingView';
import ErrorView from '../components/ErrorView';
import { colors, spacing, borderRadius, shadow } from '../theme';

export default function MyOrdersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { tableNumber } = useApp();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch orders for current table
  const fetchTableOrders = useCallback(async (isRefresh = false) => {
    if (!tableNumber) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getOrdersByTable(tableNumber);
      // Ensure sorted newest first
      const sorted = (data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders for this table.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tableNumber]);

  // Refetch orders whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchTableOrders();
    }, [fetchTableOrders])
  );

  const onRefresh = () => {
    fetchTableOrders(true);
  };

  const handleOrderPress = order => {
    const id = order._id || order.id;
    if (id) {
      navigation.navigate('OrderStatus', { orderId: id });
    }
  };

  const renderOrderCard = ({ item }) => {
    const displayId = item._id ? item._id.slice(-6).toUpperCase() : 'UNKNOWN';
    const totalItemCount = Array.isArray(item.items)
      ? item.items.reduce((sum, i) => sum + (i.quantity || 1), 0)
      : 0;

    const formattedDate = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        })
      : '';

    const formattedTime = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recently';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.orderCard,
          pressed && styles.orderCardPressed,
        ]}
        onPress={() => handleOrderPress(item)}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{displayId}</Text>
            <Text style={styles.orderDate}>
              {formattedDate ? `${formattedDate} at ` : ''}
              {formattedTime}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.itemsSummary}>
          <Text style={styles.itemsText} numberOfLines={1}>
            {Array.isArray(item.items)
              ? item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
              : 'Items ordered'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.itemCountText}>
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total: </Text>
            <Text style={styles.priceValue}>₹{item.totalAmount}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cardBackground} />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>
            {tableNumber ? `Orders placed for Table ${tableNumber}` : 'No table selected'}
          </Text>
        </View>
        <Pressable
          style={styles.refreshIconContainer}
          onPress={() => fetchTableOrders(false)}
        >
          <Text style={styles.refreshIconText}>🔄</Text>
        </Pressable>
      </View>

      {/* Content */}
      {loading ? (
        <LoadingView message="Loading table orders..." />
      ) : error ? (
        <ErrorView
          title="Could not load orders"
          message={error}
          onRetry={() => fetchTableOrders(false)}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id || String(Math.random())}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>
                {tableNumber
                  ? `No orders yet for Table ${tableNumber}`
                  : 'No table selected'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {tableNumber
                  ? 'Orders you place will show up here with live status updates.'
                  : 'Please select a table to see its orders.'}
              </Text>
              <Pressable
                style={styles.browseButton}
                onPress={() => navigation.navigate('Menu')}
              >
                <Text style={styles.browseButtonText}>Explore Menu</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  refreshIconContainer: {
    padding: spacing.xs,
  },
  refreshIconText: {
    fontSize: 18,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  orderCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
  orderCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemsSummary: {
    marginVertical: spacing.xs,
  },
  itemsText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  itemCountText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 1.5,
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  browseButtonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});
