/**
 * CartScreen
 * Shows customer's selected items, quantity adjustments, line subtotals,
 * total calculation, optional customer name, and places order to POST /api/orders.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { placeOrder } from '../services/api';
import { colors, spacing, borderRadius, shadow } from '../theme';

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    tableNumber,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    customerName,
    setCustomerName,
  } = useApp();

  const [submitting, setSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = id => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Place order to backend
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first.');
      return;
    }

    if (!tableNumber) {
      Alert.alert(
        'Table Required',
        'Please select your table before placing an order.',
        [{ text: 'Select Table', onPress: () => navigation.navigate('TableSelect') }]
      );
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        tableNumber: Number(tableNumber),
        customerName: customerName ? customerName.trim() : '',
        items: cart.map(item => ({
          menuItemId: item.menuItem._id,
          quantity: item.quantity,
        })),
      };

      const createdOrder = await placeOrder(orderPayload);

      // Successfully placed! Clear cart and navigate to OrderStatus
      clearCart();

      const orderId = createdOrder._id || createdOrder.id;
      if (orderId) {
        navigation.navigate('OrderStatus', { orderId });
      } else {
        // Fallback to MyOrders if ID missing
        navigation.navigate('MyOrders');
      }
    } catch (err) {
      Alert.alert(
        'Order Failed',
        err.message || 'Could not place order. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderCartItem = ({ item }) => {
    const { menuItem, quantity } = item;
    const lineTotal = (menuItem.price || 0) * quantity;
    const hasImageError = imageErrors[menuItem._id];

    return (
      <View style={styles.cartItemCard}>
        {/* Thumbnail */}
        <View style={styles.itemImageContainer}>
          {menuItem.imageUrl && !hasImageError ? (
            <Image
              source={{ uri: menuItem.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
              onError={() => handleImageError(menuItem._id)}
            />
          ) : (
            <View style={styles.itemImageFallback}>
              <Text style={styles.fallbackEmoji}>🍴</Text>
            </View>
          )}
        </View>

        {/* Info & Line Total */}
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>
              {menuItem.name}
            </Text>
            <Pressable
              onPress={() => removeFromCart(menuItem._id)}
              style={styles.deleteButton}
              hitSlop={8}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.itemUnitPrice}>₹{menuItem.price} each</Text>

          <View style={styles.itemControlsRow}>
            {/* Quantity Stepper */}
            <View style={styles.stepperContainer}>
              <Pressable
                style={styles.stepperButton}
                onPress={() => updateQuantity(menuItem._id, quantity - 1)}
                hitSlop={6}
              >
                <Text style={styles.stepperButtonText}>−</Text>
              </Pressable>
              <Text style={styles.stepperCount}>{quantity}</Text>
              <Pressable
                style={[styles.stepperButton, styles.stepperButtonPlus]}
                onPress={() => updateQuantity(menuItem._id, quantity + 1)}
                hitSlop={6}
              >
                <Text style={[styles.stepperButtonText, styles.stepperButtonPlusText]}>
                  ＋
                </Text>
              </Pressable>
            </View>

            {/* Line Subtotal */}
            <Text style={styles.lineSubtotal}>₹{lineTotal}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Screen Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Your Cart</Text>
            <Text style={styles.headerSubtitle}>
              Table {tableNumber || '—'} • {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          {cart.length > 0 && (
            <Pressable onPress={clearCart} style={styles.clearCartButton}>
              <Text style={styles.clearCartText}>Clear All</Text>
            </Pressable>
          )}
        </View>

        {cart.length === 0 ? (
          // Empty State
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Looks like you haven't added any delicious food or drinks yet!
            </Text>
            <Pressable
              style={styles.browseMenuButton}
              onPress={() => navigation.navigate('Menu')}
            >
              <Text style={styles.browseMenuText}>Browse Menu</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.contentFlex}>
            {/* Cart Items List */}
            <FlatList
              data={cart}
              keyExtractor={item => item.menuItem._id}
              renderItem={renderCartItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                <View style={styles.formSection}>
                  {/* Customer Name Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Customer Name <Text style={styles.optionalText}>(Optional)</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your name (e.g. Alex)"
                      placeholderTextColor={colors.textMuted}
                      value={customerName}
                      onChangeText={setCustomerName}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Bill Summary */}
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Bill Summary</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryValue}>₹{cartTotal}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Taxes & Canteen Charges</Text>
                      <Text style={styles.summaryValue}>₹0</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.grandTotalRow]}>
                      <Text style={styles.grandTotalLabel}>Grand Total</Text>
                      <Text style={styles.grandTotalValue}>₹{cartTotal}</Text>
                    </View>
                    <Text style={styles.serverNotice}>
                      * Total will be verified by the kitchen server
                    </Text>
                  </View>
                </View>
              }
            />

            {/* Sticky Checkout Bar */}
            <View style={[styles.footerBar, { paddingBottom: insets.bottom || spacing.md }]}>
              <View style={styles.footerPriceContainer}>
                <Text style={styles.footerTotalLabel}>Total to Pay</Text>
                <Text style={styles.footerTotalAmount}>₹{cartTotal}</Text>
              </View>

              <Pressable
                style={[
                  styles.placeOrderButton,
                  submitting && styles.placeOrderButtonDisabled,
                ]}
                onPress={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <Text style={styles.placeOrderText}>Place Order →</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  contentFlex: {
    flex: 1,
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
  clearCartButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  clearCartText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackEmoji: {
    fontSize: 26,
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
  },
  itemUnitPrice: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  itemControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  stepperButton: {
    width: 28,
    height: 28,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.sm - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonPlus: {
    backgroundColor: colors.primary,
  },
  stepperButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepperButtonPlusText: {
    color: colors.textWhite,
  },
  stepperCount: {
    minWidth: 26,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lineSubtotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  formSection: {
    marginTop: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionalText: {
    color: colors.textMuted,
    fontWeight: '400',
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  serverNotice: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  footerBar: {
    backgroundColor: colors.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadow.cardHover,
  },
  footerPriceContainer: {
    justifyContent: 'center',
  },
  footerTotalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footerTotalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  placeOrderButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  placeOrderButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  placeOrderText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  browseMenuButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  browseMenuText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
});
