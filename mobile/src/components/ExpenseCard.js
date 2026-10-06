import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import CategoryBadge from './CategoryBadge';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const formattedDate = new Date(expense.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const confirmDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete this $${expense.amount.toFixed(2)} expense?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(expense._id) },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <CategoryBadge category={expense.category} />
        <Text style={styles.amount}>${expense.amount.toFixed(2)}</Text>
      </View>

      <View style={styles.middleRow}>
        <Text style={styles.date}>{formattedDate}</Text>
        {expense.note ? (
          <Text style={styles.note} numberOfLines={2}>
            {expense.note}
          </Text>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(expense)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={confirmDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  middleRow: {
    marginTop: 8,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  note: {
    fontSize: 13,
    color: '#334155',
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  editText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default ExpenseCard;
