import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const BudgetWarningBanner = ({ summary, onSetBudgetPress }) => {
  if (!summary || !summary.monthlyBudget || summary.monthlyBudget <= 0) {
    return (
      <View style={[styles.container, styles.infoContainer]}>
        <Text style={styles.infoTitle}>No Monthly Budget Set</Text>
        <Text style={styles.infoText}>Set a budget to track spending limits and receive alerts.</Text>
        <TouchableOpacity style={styles.button} onPress={onSetBudgetPress}>
          <Text style={styles.buttonText}>Set Budget</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { budgetPercentage, totalSpent, monthlyBudget } = summary;

  if (budgetPercentage >= 100) {
    const overspent = (totalSpent - monthlyBudget).toFixed(2);
    return (
      <View style={[styles.container, styles.dangerContainer]}>
        <Text style={styles.dangerTitle}>⚠️ Budget Exceeded ({budgetPercentage}%)</Text>
        <Text style={styles.dangerText}>
          You've spent ${totalSpent.toFixed(2)} of your ${monthlyBudget.toFixed(2)} limit (${overspent} over).
        </Text>
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={onSetBudgetPress}>
          <Text style={styles.buttonText}>Adjust Budget</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (budgetPercentage >= 80) {
    const remaining = (monthlyBudget - totalSpent).toFixed(2);
    return (
      <View style={[styles.container, styles.warningContainer]}>
        <Text style={styles.warningTitle}>⚠️ Budget Warning: {budgetPercentage}% Spent</Text>
        <Text style={styles.warningText}>
          You have reached 80% of your budget. Only ${remaining} left this month.
        </Text>
        <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={onSetBudgetPress}>
          <Text style={styles.buttonText}>Adjust Budget</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 14,
    borderRadius: 12,
  },
  infoContainer: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
  },
  infoText: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 2,
    marginBottom: 8,
  },
  warningContainer: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  warningText: {
    fontSize: 12,
    color: '#b45309',
    marginTop: 2,
    marginBottom: 8,
  },
  dangerContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991b1b',
  },
  dangerText: {
    fontSize: 12,
    color: '#b91c1c',
    marginTop: 2,
    marginBottom: 8,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  warningButton: {
    backgroundColor: '#d97706',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BudgetWarningBanner;
