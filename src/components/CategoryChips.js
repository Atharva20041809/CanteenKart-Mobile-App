/**
 * CategoryChips Component
 * Horizontal scrolling list of category filter chips.
 */

import React from 'react';
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

const CATEGORIES = ['All', 'Snacks', 'Meals', 'Drinks', 'Desserts'];

export default function CategoryChips({ selectedCategory, onSelectCategory }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(category => {
        const isSelected = selectedCategory === category;
        return (
          <Pressable
            key={category}
            style={[
              styles.chip,
              isSelected ? styles.chipSelected : styles.chipUnselected,
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text
              style={[
                styles.chipText,
                isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.textWhite,
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
});
