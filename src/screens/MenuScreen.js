/**
 * MenuScreen
 * Displays searchable and categorized canteen items.
 * Allows adding items directly to the cart or viewing details.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  RefreshControl,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { getMenu } from '../services/api';
import MenuItemCard from '../components/MenuItemCard';
import CategoryChips from '../components/CategoryChips';
import LoadingView from '../components/LoadingView';
import ErrorView from '../components/ErrorView';
import { colors, spacing, borderRadius, shadow } from '../theme';

export default function MenuScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { tableNumber, addToCart } = useApp();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search query & category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch menu data from backend
  const fetchMenuItems = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getMenu();
      setItems(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load menu. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    fetchMenuItems(true);
  };

  // Filter items by category and search keyword
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All' ||
        (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

      // Search match (case-insensitive on name)
      const matchesSearch =
        !searchQuery.trim() ||
        (item.name && item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.trim().toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // Add item to cart with quick feedback
  const handleAddToCart = item => {
    addToCart(item, 1);
    Alert.alert('Added to Cart', `${item.name} has been added to your cart.`, [
      { text: 'OK' },
    ]);
  };

  // Navigate to item details
  const handleItemPress = item => {
    navigation.navigate('ItemDetail', { item });
  };

  // Return to table selection screen
  const handleChangeTable = () => {
    navigation.navigate('TableSelect');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cardBackground} />

      {/* Top Header with Table Indicator and Change Table button */}
      <View style={styles.header}>
        <View style={styles.tableInfoContainer}>
          <Text style={styles.tablePrefix}>Seated at</Text>
          <Text style={styles.tableTitle}>Table {tableNumber || '—'}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.changeTableButton,
            pressed && styles.changeTableButtonPressed,
          ]}
          onPress={handleChangeTable}
        >
          <Text style={styles.changeTableText}>Change Table</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search snacks, meals, drinks..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
              <Text style={styles.clearSearchText}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Chips Filter */}
      <View style={styles.chipsWrapper}>
        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      {/* Main Content Area */}
      {loading ? (
        <LoadingView message="Loading fresh menu items..." />
      ) : error ? (
        <ErrorView
          title="Could not load menu"
          message={error}
          onRetry={() => fetchMenuItems(false)}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item._id || String(Math.random())}
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              onPress={() => handleItemPress(item)}
              onAddToCart={handleAddToCart}
            />
          )}
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
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No dishes matching "${searchQuery}". Try a different keyword.`
                  : `No items available in category "${selectedCategory}".`}
              </Text>
              {searchQuery ? (
                <Pressable
                  style={styles.clearFilterButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  <Text style={styles.clearFilterText}>Reset Filters</Text>
                </Pressable>
              ) : null}
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
  tableInfoContainer: {
    justifyContent: 'center',
  },
  tablePrefix: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  changeTableButton: {
    backgroundColor: colors.primaryUltraLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  changeTableButtonPressed: {
    backgroundColor: colors.primaryLight,
  },
  changeTableText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  searchContainer: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: spacing.xs,
  },
  clearSearchText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  chipsWrapper: {
    backgroundColor: colors.cardBackground,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
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
  clearFilterButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  clearFilterText: {
    color: colors.textWhite,
    fontSize: 13,
    fontWeight: '600',
  },
});
