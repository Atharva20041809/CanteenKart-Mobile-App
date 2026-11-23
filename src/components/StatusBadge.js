/**
 * StatusBadge Component
 * Displays order status with color-coded background and readable label.
 * Status values: 'New' | 'Preparing' | 'Ready' | 'Served'
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

export default function StatusBadge({ status }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'New':
        return {
          bg: colors.statusNewBg,
          text: colors.statusNew,
          icon: '🔵',
        };
      case 'Preparing':
        return {
          bg: colors.statusPreparingBg,
          text: colors.statusPreparing,
          icon: '⏳',
        };
      case 'Ready':
        return {
          bg: colors.statusReadyBg,
          text: colors.statusReady,
          icon: '✅',
        };
      case 'Served':
        return {
          bg: colors.statusServedBg,
          text: colors.statusServed,
          icon: '🍽️',
        };
      default:
        return {
          bg: colors.borderLight,
          text: colors.textSecondary,
          icon: '•',
        };
    }
  };

  const statusConfig = getStatusStyles();

  return (
    <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
      <Text style={styles.badgeIcon}>{statusConfig.icon}</Text>
      <Text style={[styles.badgeText, { color: statusConfig.text }]}>
        {status || 'Unknown'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
