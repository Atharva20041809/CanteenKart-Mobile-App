/**
 * QuantitySelector Component
 * Minus and plus buttons to increase or decrease quantities.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  size = 'medium', // 'small' | 'medium' | 'large'
}) {
  const isMin = quantity <= min;

  const sizeStyles = {
    small: {
      buttonSize: 28,
      fontSize: 14,
      numWidth: 26,
    },
    medium: {
      buttonSize: 36,
      fontSize: 18,
      numWidth: 36,
    },
    large: {
      buttonSize: 44,
      fontSize: 22,
      numWidth: 44,
    },
  }[size] || {
    buttonSize: 36,
    fontSize: 18,
    numWidth: 36,
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          { width: sizeStyles.buttonSize, height: sizeStyles.buttonSize },
          isMin && styles.disabledButton,
        ]}
        onPress={onDecrease}
        disabled={isMin}
      >
        <Text
          style={[
            styles.buttonText,
            { fontSize: sizeStyles.fontSize },
            isMin && styles.disabledButtonText,
          ]}
        >
          −
        </Text>
      </Pressable>

      <View style={[styles.numberContainer, { minWidth: sizeStyles.numWidth }]}>
        <Text style={[styles.quantityText, { fontSize: sizeStyles.fontSize }]}>
          {quantity}
        </Text>
      </View>

      <Pressable
        style={[
          styles.button,
          styles.plusButton,
          { width: sizeStyles.buttonSize, height: sizeStyles.buttonSize },
        ]}
        onPress={onIncrease}
      >
        <Text style={[styles.buttonText, styles.plusButtonText, { fontSize: sizeStyles.fontSize }]}>
          ＋
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.md,
    padding: 3,
  },
  button: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  plusButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  plusButtonText: {
    color: colors.textWhite,
  },
  disabledButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    opacity: 0.3,
  },
  disabledButtonText: {
    color: colors.disabledText,
  },
  numberContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  quantityText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
