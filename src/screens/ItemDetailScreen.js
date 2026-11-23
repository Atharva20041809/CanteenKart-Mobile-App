/**
 * ItemDetailScreen
 * Displays full item specifications, large image, category,
 * quantity selector (min 1), and "Add to Cart" action.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import QuantitySelector from '../components/QuantitySelector';
import { colors, spacing, borderRadius, shadow } from '../theme';

export default function ItemDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { item } = route.params || {};
  const { addToCart } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Item not found</Text>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back to Menu</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isAvailable = item.isAvailable !== false;
  const totalPrice = (item.price || 0) * quantity;

  const handleIncrease = () => {
    setQuantity(q => q + 1);
  };

  const handleDecrease = () => {
    setQuantity(q => (q > 1 ? q - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;

    addToCart(item, quantity);

    Alert.alert(
      'Added to Cart!',
      `${quantity}x ${item.name} added to your cart.`,
      [
        {
          text: 'Continue Ordering',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const getCategoryEmoji = cat => {
    switch (cat) {
      case 'Snacks':
        return '🍟';
      case 'Meals':
        return '🍱';
      case 'Drinks':
        return '🥤';
      case 'Desserts':
        return '🍰';
      default:
        return '🍽️';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Item Image with Fallback */}
        <View style={styles.imageWrapper}>
          {item.imageUrl && !imageError ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.imageFallback}>
              <Text style={styles.fallbackEmoji}>{getCategoryEmoji(item.category)}</Text>
              <Text style={styles.fallbackCategory}>{item.category || 'Special'}</Text>
            </View>
          )}

          {!isAvailable && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>Currently Unavailable</Text>
            </View>
          )}
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Category Tag */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {getCategoryEmoji(item.category)} {item.category || 'General'}
            </Text>
          </View>

          {/* Name & Single Item Price */}
          <View style={styles.titleRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>

          {/* Item Description */}
          {item.description ? (
            <View style={styles.descriptionBox}>
              <Text style={styles.sectionHeader}>Description</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          ) : null}

          {/* Quantity Selection Area (if available) */}
          {isAvailable ? (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Select Quantity</Text>
              <QuantitySelector
                quantity={quantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                min={1}
                size="large"
              />
            </View>
          ) : (
            <View style={styles.unavailableNotice}>
              <Text style={styles.unavailableNoticeText}>
                This item is currently sold out or out of stock in the kitchen.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.md }]}>
        <View style={styles.totalPreview}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{totalPrice}</Text>
        </View>

        <Pressable
          style={[
            styles.addToCartButton,
            !isAvailable && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={!isAvailable}
        >
          <Text style={styles.addToCartButtonText}>
            {isAvailable ? 'Add to Cart' : 'Item Sold Out'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageWrapper: {
    width: '100%',
    height: 280,
    backgroundColor: colors.primaryUltraLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryUltraLight,
  },
  fallbackEmoji: {
    fontSize: 72,
    marginBottom: spacing.xs,
  },
  fallbackCategory: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  contentContainer: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -20,
    padding: spacing.xl,
    minHeight: 300,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryUltraLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  categoryBadgeText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  itemName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginRight: spacing.md,
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  descriptionBox: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.md,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  unavailableNotice: {
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  unavailableNoticeText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  totalPreview: {
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  addToCartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadow.card,
  },
  addToCartButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  addToCartButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});
