import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import BudgetWarningBanner from '../components/BudgetWarningBanner';
import CategoryBadge from '../components/CategoryBadge';
import api from '../api/client';

const MonthlySummaryScreen = ({ navigation }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const fetchSummary = useCallback(async () => {
    try {
      setError('');
      const res = await api.get(`/api/summary?month=${currentMonthStr}`);
      if (res.data.success) {
        setSummary(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load summary.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentMonthStr]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSummary();
    });
    return unsubscribe;
  }, [navigation, fetchSummary]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Calculating monthly metrics...</Text>
      </View>
    );
  }

  const totalSpent = summary?.totalSpent || 0;
  const budget = summary?.monthlyBudget || 0;
  const percentage = summary?.budgetPercentage || 0;
  const remaining = summary?.remaining || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2563eb']}
          tintColor="#2563eb"
        />
      }
    >
      {/* Budget Warning Banner (FR-7: warned at 80% and 100%) */}
      <BudgetWarningBanner
        summary={summary}
        onSetBudgetPress={() => navigation.navigate('Budget')}
      />

      {/* Main Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.monthLabel}>
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <Text style={styles.totalSpentAmount}>${totalSpent.toFixed(2)}</Text>
        <Text style={styles.totalSpentLabel}>Total Spent This Month</Text>

        <View style={styles.divider} />

        <View style={styles.budgetRow}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetValue}>${budget.toFixed(2)}</Text>
            <Text style={styles.budgetSub}>Monthly Budget</Text>
          </View>
          <View style={styles.budgetDivider} />
          <View style={styles.budgetItem}>
            <Text
              style={[
                styles.budgetValue,
                percentage >= 100 ? styles.dangerText : styles.successText,
              ]}
            >
              ${remaining.toFixed(2)}
            </Text>
            <Text style={styles.budgetSub}>Remaining</Text>
          </View>
        </View>

        {/* Progress Bar */}
        {budget > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, percentage)}%`,
                    backgroundColor:
                      percentage >= 100 ? '#ef4444' : percentage >= 80 ? '#f59e0b' : '#2563eb',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{percentage}% of budget used</Text>
          </View>
        )}
      </View>

      {/* Category Breakdown (FR-4) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
      </View>

      <View style={styles.categoriesCard}>
        {summary?.byCategory && summary.byCategory.filter((c) => c.total > 0).length > 0 ? (
          summary.byCategory
            .filter((c) => c.total > 0)
            .map((catItem, idx) => (
              <View key={catItem.category} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <CategoryBadge category={catItem.category} />
                  <Text style={styles.categoryCount}>({catItem.count} items)</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryTotal}>${catItem.total.toFixed(2)}</Text>
                  <Text style={styles.categoryPercentage}>{catItem.percentage}%</Text>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.emptyCategories}>
            <Text style={styles.emptyText}>No expenses logged this month yet.</Text>
          </View>
        )}
      </View>

      {/* Manage Budget Button */}
      <TouchableOpacity
        style={styles.manageBudgetButton}
        onPress={() => navigation.navigate('Budget')}
      >
        <Text style={styles.manageBudgetText}>⚙️ Manage Monthly Budget</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalSpentAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 6,
  },
  totalSpentLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    width: '100%',
    marginVertical: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  budgetSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  budgetDivider: {
    width: 1,
    backgroundColor: '#f1f5f9',
  },
  dangerText: {
    color: '#ef4444',
  },
  successText: {
    color: '#10b981',
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  categoriesCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  categoryPercentage: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  emptyCategories: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  manageBudgetButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  manageBudgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});

export default MonthlySummaryScreen;
