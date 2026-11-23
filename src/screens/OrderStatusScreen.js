/**
 * OrderStatusScreen
 * Real-time order tracker that polls GET /api/orders/:id every 5 seconds.
 * Features a visual progress step indicator (New -> Preparing -> Ready -> Served)
 * and properly stops/cleans up the polling interval once 'Served' or on unmount.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getOrder } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingView from '../components/LoadingView';
import ErrorView from '../components/ErrorView';
import { colors, spacing, borderRadius, shadow } from '../theme';

const STATUS_STEPS = ['New', 'Preparing', 'Ready', 'Served'];

export default function OrderStatusScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { orderId } = route.params || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep track of polling interval reference
  const intervalRef = useRef(null);

  // Fetch the latest order status
  const fetchOrderStatus = useCallback(async (isInitial = false) => {
    if (!orderId) {
      setError('Invalid order ID provided.');
      setLoading(false);
      return;
    }

    if (isInitial) {
      setLoading(true);
    }

    try {
      const data = await getOrder(orderId);
      setOrder(data);
      setError(null);

      // Stop polling once order is completely served
      if (data && data.status === 'Served' && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (err) {
      // Only set error screen if we don't have order cached
      if (isInitial) {
        setError(err.message || 'Could not fetch order status.');
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [orderId]);

  useEffect(() => {
    // Initial fetch
    fetchOrderStatus(true);

    // Setup 5-second polling interval
    intervalRef.current = setInterval(() => {
      fetchOrderStatus(false);
    }, 5000);

    // ALWAYS clear the interval in the cleanup function!
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchOrderStatus]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingView message="Loading your order status..." />
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorView
          title="Could not find order"
          message={error || 'Order details are unavailable.'}
          onRetry={() => fetchOrderStatus(true)}
        />
      </SafeAreaView>
    );
  }

  // Format short order id
  const displayId = order._id ? order._id.slice(-6).toUpperCase() : 'UNKNOWN';

  // Format creation time
  const formattedTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  // Calculate current step index for visual progress bar
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Status Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.orderLabel}>Order #{displayId}</Text>
              <Text style={styles.orderTime}>Placed at {formattedTime}</Text>
            </View>
            <StatusBadge status={order.status} />
          </View>

          {/* Real-time Visual Progress Tracker */}
          <View style={styles.trackerWrapper}>
            <View style={styles.stepsLineBackground} />
            <View
              style={[
                styles.stepsLineActive,
                {
                  width:
                    currentStepIndex >= 0
                      ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`
                      : '0%',
                },
              ]}
            />
            <View style={styles.stepsContainer}>
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isUpcoming = idx > currentStepIndex;

                return (
                  <View key={step} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isPassed && styles.stepDotPassed,
                        isCurrent && styles.stepDotCurrent,
                        isUpcoming && styles.stepDotUpcoming,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepDotText,
                          (isPassed || isCurrent) && styles.stepDotTextActive,
                        ]}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && styles.stepLabelCurrent,
                        isPassed && styles.stepLabelPassed,
                      ]}
                    >
                      {step}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Polling live feedback notice */}
          {order.status !== 'Served' ? (
            <View style={styles.liveNotice}>
              <Text style={styles.livePulse}>●</Text>
              <Text style={styles.liveText}>
                Live tracking enabled (updates automatically every 5s)
              </Text>
            </View>
          ) : (
            <View style={[styles.liveNotice, styles.servedNotice]}>
              <Text style={styles.servedText}>🎉 Order served. Enjoy your meal!</Text>
            </View>
          )}
        </View>

        {/* Order Details Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Order Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Table Number</Text>
            <Text style={styles.infoValue}>Table {order.tableNumber}</Text>
          </View>

          {order.customerName ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer Name</Text>
              <Text style={styles.infoValue}>{order.customerName}</Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Status</Text>
            <Text style={styles.infoValue}>{order.status}</Text>
          </View>
        </View>

        {/* Ordered Items List */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Ordered Items</Text>
          {Array.isArray(order.items) &&
            order.items.map((item, idx) => {
              const itemTotal = (item.price || 0) * (item.quantity || 1);
              return (
                <View
                  key={item._id || item.menuItemId || idx}
                  style={[
                    styles.itemRow,
                    idx < order.items.length - 1 && styles.itemRowBorder,
                  ]}
                >
                  <View style={styles.itemQuantityBadge}>
                    <Text style={styles.itemQuantityText}>{item.quantity}x</Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemUnitPrice}>₹{item.price} each</Text>
                  </View>
                  <Text style={styles.itemTotal}>₹{itemTotal}</Text>
                </View>
              );
            })}

          {/* Total Breakdown */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.actionButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.actionButtonText}>Back to Menu</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  headerCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  orderLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  orderTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trackerWrapper: {
    position: 'relative',
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  stepsLineBackground: {
    position: 'absolute',
    top: 14,
    left: spacing.xl,
    right: spacing.xl,
    height: 3,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  stepsLineActive: {
    position: 'absolute',
    top: 14,
    left: spacing.xl,
    height: 3,
    backgroundColor: colors.primary,
    zIndex: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
  },
  stepDotPassed: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDotCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    transform: [{ scale: 1.15 }],
  },
  stepDotUpcoming: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.disabled,
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stepDotTextActive: {
    color: colors.textWhite,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  stepLabelCurrent: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  stepLabelPassed: {
    color: colors.textPrimary,
  },
  liveNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryUltraLight,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  livePulse: {
    color: colors.primary,
    fontSize: 10,
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  servedNotice: {
    backgroundColor: colors.statusReadyBg,
  },
  servedText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.statusReady,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemQuantityBadge: {
    backgroundColor: colors.primaryUltraLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  itemQuantityText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemUnitPrice: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
