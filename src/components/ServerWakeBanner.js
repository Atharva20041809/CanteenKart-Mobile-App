/**
 * ServerWakeBanner Component
 * Informs the user when the backend is waking up from Render's free-tier cold sleep.
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

export default function ServerWakeBanner({ status, error, onRetry }) {
  if (status === 'awake') {
    return (
      <View style={[styles.container, styles.awakeContainer]}>
        <Text style={styles.awakeIcon}>●</Text>
        <Text style={styles.awakeText}>Server connected</Text>
      </View>
    );
  }

  if (status === 'checking') {
    return (
      <View style={[styles.container, styles.checkingContainer]}>
        <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
        <View style={styles.textWrapper}>
          <Text style={styles.checkingTitle}>Connecting to server...</Text>
          <Text style={styles.checkingSubtext}>
            Waking up the server, this can take up to a minute on free tier.
          </Text>
        </View>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <View style={styles.textWrapper}>
          <Text style={styles.errorTitle}>Server unreachable</Text>
          <Text style={styles.errorSubtext}>
            {error || 'Could not connect to the backend server. Please verify your internet connection.'}
          </Text>
        </View>
        {onRetry && (
          <Pressable style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkingContainer: {
    backgroundColor: colors.primaryUltraLight,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  spinner: {
    marginRight: spacing.md,
  },
  textWrapper: {
    flex: 1,
  },
  checkingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  checkingSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  awakeContainer: {
    backgroundColor: colors.statusReadyBg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    borderRadius: borderRadius.full,
  },
  awakeIcon: {
    color: colors.statusReady,
    fontSize: 10,
    marginRight: 6,
  },
  awakeText: {
    color: colors.statusReady,
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'space-between',
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 2,
  },
  errorSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  retryButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  retryButtonText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
});
