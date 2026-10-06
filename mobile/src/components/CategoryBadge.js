import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CATEGORY_COLORS = {
  Food: { bg: '#ffedd5', text: '#c2410c' },
  Transport: { bg: '#dbeafe', text: '#1d4ed8' },
  Rent: { bg: '#f3e8ff', text: '#7e22ce' },
  Bills: { bg: '#fee2e2', text: '#b91c1c' },
  Shopping: { bg: '#fce7f3', text: '#be185d' },
  Health: { bg: '#d1fae5', text: '#047857' },
  Entertainment: { bg: '#fef9c3', text: '#a16207' },
  Other: { bg: '#f3f4f6', text: '#4b5563' },
};

const CategoryBadge = ({ category }) => {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>{category}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default CategoryBadge;
