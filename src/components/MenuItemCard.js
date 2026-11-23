/**
 * MenuItemCard Component
 * Displays a single menu item in a card layout.
 * Supports image load failure fallback, price formatting in ₹, and unavailable state.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadow } from '../theme';

export default function MenuItemCard({ item, onPress, onAddToCart }) {
  const [imageError, setImageError] = useState(false);

  const isAvailable = item.isAvailable !== false;

  // Category indicator icon fallback
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
        return '🍴';
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        !isAvailable && styles.cardUnavailable,
        pressed && isAvailable && styles.cardPressed,
      ]}
      onPress={onPress}
      disabled={!isAvailable}
    >
      {/* Item Image with Fallback */}
      <View style={styles.imageContainer}>
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
          </View>
        )}
        {!isAvailable && (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>Unavailable</Text>
          </View>
        )}
      </View>

      {/* Item Info */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, !isAvailable && styles.textDisabled]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        <Text style={styles.categoryBadge}>{item.category || 'Special'}</Text>

        {item.description ? (
          <Text
            style={[styles.description, !isAvailable && styles.textDisabled]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}

        <View style={styles.footerRow}>
          <Text style={[styles.price, !isAvailable && styles.textDisabled]}>
            ₹{item.price}
          </Text>

          {isAvailable ? (
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
              onPress={e => {
                // Prevent parent card onPress navigation
                e.stopPropagation();
                onAddToCart(item);
              }}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          ) : (
            <View style={styles.disabledAddButton}>
              <Text style={styles.disabledAddText}>Sold Out</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md,
    ...shadow.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardUnavailable: {
    opacity: 0.6,
    backgroundColor: '#FAFAFA',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackEmoji: {
    fontSize: 34,
  },
  soldOutBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 2,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 4,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  textDisabled: {
    color: colors.disabledText,
  },
  addButton: {
    backgroundColor: colors.primaryUltraLight,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
  },
  addButtonPressed: {
    backgroundColor: colors.primaryLight,
  },
  addButtonText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  disabledAddButton: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  disabledAddText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
