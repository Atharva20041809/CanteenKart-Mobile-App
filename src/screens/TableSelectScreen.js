/**
 * TableSelectScreen
 * The entry screen of CanteenKart.
 * Asks the customer which table they are seated at (1 to 10)
 * and initiates the background health check to wake up the Render backend.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { getHealth } from '../services/api';
import ServerWakeBanner from '../components/ServerWakeBanner';
import { colors, spacing, borderRadius, shadow } from '../theme';

const TABLES = Array.from({ length: 10 }, (_, i) => i + 1);

export default function TableSelectScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    tableNumber,
    setTableNumber,
    serverStatus,
    setServerStatus,
    serverError,
    setServerError,
  } = useApp();

  // Selected table within this screen before confirming
  const [selectedTable, setSelectedTable] = useState(tableNumber || null);

  // Background health check on mount to warm up Render server
  const checkServerHealth = async () => {
    setServerStatus('checking');
    setServerError(null);
    try {
      await getHealth();
      setServerStatus('awake');
    } catch (err) {
      setServerStatus('error');
      setServerError(err.message || 'Could not connect to server.');
    }
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

  const handleConfirmTable = () => {
    if (!selectedTable) return;
    setTableNumber(selectedTable);
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Brand */}
        <View style={styles.header}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandIcon}>☕</Text>
            <Text style={styles.brandTitle}>CanteenKart</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome to CanteenKart</Text>
          <Text style={styles.subtitleText}>Which table are you sitting at?</Text>
        </View>

        {/* Server Wake Banner for cold start */}
        <ServerWakeBanner
          status={serverStatus}
          error={serverError}
          onRetry={checkServerHealth}
        />

        {/* Table Selection Grid (1-10) */}
        <View style={styles.gridContainer}>
          {TABLES.map(num => {
            const isSelected = selectedTable === num;
            return (
              <Pressable
                key={num}
                style={({ pressed }) => [
                  styles.tableButton,
                  isSelected && styles.tableButtonSelected,
                  pressed && styles.tableButtonPressed,
                ]}
                onPress={() => setSelectedTable(num)}
              >
                <Text style={styles.tableEmoji}>{isSelected ? '📍' : '🪑'}</Text>
                <Text
                  style={[
                    styles.tableNumberText,
                    isSelected && styles.tableNumberTextSelected,
                  ]}
                >
                  Table {num}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Continue Button */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.continueButton,
              !selectedTable && styles.continueButtonDisabled,
            ]}
            onPress={handleConfirmTable}
            disabled={!selectedTable}
          >
            <Text style={styles.continueButtonText}>
              {selectedTable ? `Continue with Table ${selectedTable}` : 'Select a Table'}
            </Text>
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
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryUltraLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  brandIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  tableButton: {
    width: '47%',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
  tableButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryUltraLight,
    transform: [{ scale: 1.02 }],
  },
  tableButtonPressed: {
    opacity: 0.85,
  },
  tableEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  tableNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tableNumberTextSelected: {
    color: colors.primaryDark,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadow.card,
  },
  continueButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  continueButtonText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});
