import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useWeddingStore } from '@/lib/store';
import { usePathname } from 'expo-router';
import { formatCurrency, getCategoryColor, getCategoryIcon, calculateBudgetHealth } from '@/lib/utils';
import { FontAwesome } from '@expo/vector-icons';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

export default function BudgetScreen() {
  const store = useWeddingStore();
  const pathname = usePathname();
  const isFocused = pathname.includes('/budget');
  const { budget, addBudgetPayment, updateBudgetPayment, deleteBudgetPayment } = store;

  const [modalOpen, setModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    vendorName: '',
    category: 'Venue',
    amount: '',
    date: '2027-06-15',
    status: 'Upcoming',
    method: 'Credit Card',
  });

  const categories = budget.categories || [];
  const payments = budget.payments || [];
  const totalBudget = budget.total || 0;

  const totalSpent = categories.reduce((sum, c) => sum + (c.actual || 0), 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const health = calculateBudgetHealth(totalSpent, totalBudget);

  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalUpcoming = payments.filter(p => p.status === 'Upcoming').reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleInputChange = (field: string, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogPayment = () => {
    if (!paymentForm.vendorName || !paymentForm.amount) {
      Alert.alert('Error', 'Please fill in payee and amount');
      return;
    }
    addBudgetPayment({
      vendorName: paymentForm.vendorName,
      category: paymentForm.category,
      amount: Number(paymentForm.amount) || 0,
      date: paymentForm.date,
      status: paymentForm.status,
      method: paymentForm.method,
    });
    setPaymentForm({
      vendorName: '',
      category: 'Venue',
      amount: '',
      date: '2027-06-15',
      status: 'Upcoming',
      method: 'Credit Card',
    });
    setModalOpen(false);
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Paid' ? 'Upcoming' : 'Paid';
    updateBudgetPayment(id, { status: nextStatus });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Payment', 'Are you sure you want to remove this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBudgetPayment(id) }
    ]);
  };

  return (
    <View style={[styles.container, { display: isFocused ? 'flex' : 'none' }]}>
      <BackgroundSlideshow />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budget Tracker</Text>
          <Text style={styles.headerSubtitle}>Monitor your spending, limits, and payments.</Text>
        </View>

        {/* Budget Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Overview</Text>
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{formatCurrency(totalBudget)}</Text>
              <Text style={styles.metricLabel}>Total Budget</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#f59e0b' }]}>{formatCurrency(totalSpent)}</Text>
              <Text style={styles.metricLabel}>Allocated</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#4ade80' }]}>{formatCurrency(remainingBudget)}</Text>
              <Text style={styles.metricLabel}>Remaining</Text>
            </View>
          </View>

          {/* Progress Slider Bar */}
          <View style={styles.progressBox}>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${Math.min(100, (totalSpent / (totalBudget || 1)) * 100)}%`,
                    backgroundColor: health === 'over' ? '#ef4444' : health === 'watch' ? '#f59e0b' : '#c9a96e'
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Cash Flow */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Cash Flow Status</Text>
          <View style={styles.cashFlowRow}>
            <View style={[styles.cashFlowItem, { borderRightWidth: 1, borderRightColor: 'rgba(201, 169, 110, 0.1)' }]}>
              <Text style={styles.cashFlowNum}>{formatCurrency(totalPaid)}</Text>
              <Text style={styles.cashFlowLabel}>✓ Total Paid</Text>
            </View>
            <View style={styles.cashFlowItem}>
              <Text style={styles.cashFlowNum}>{formatCurrency(totalUpcoming)}</Text>
              <Text style={styles.cashFlowLabel}>⏰ Outstanding</Text>
            </View>
          </View>
        </View>

        {/* Categories Bar Splits */}
        <Text style={styles.sectionHeader}>Category Details</Text>
        <View style={styles.categoriesList}>
          {categories.map((cat) => {
            const catSpentPct = Math.round((cat.actual / (cat.estimated || 1)) * 100);
            return (
              <View key={cat.name} style={styles.catCard}>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>
                    {getCategoryIcon(cat.name)} {cat.name}
                  </Text>
                  <Text style={styles.catPrice}>
                    {formatCurrency(cat.actual)} / {formatCurrency(cat.estimated)}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${Math.min(100, catSpentPct)}%`,
                        backgroundColor: getCategoryColor(cat.name)
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Payments Section */}
        <Text style={styles.sectionHeader}>Transactions Log</Text>
        <View style={styles.paymentsList}>
          {payments.length > 0 ? (
            payments.map((p) => (
              <View key={p.id} style={styles.payCard}>
                <TouchableOpacity 
                  style={[styles.statusIcon, p.status === 'Paid' ? styles.statusPaid : styles.statusUpcoming]}
                  onPress={() => handleStatusToggle(p.id, p.status)}
                >
                  <FontAwesome 
                    name={p.status === 'Paid' ? 'check' : 'clock-o'} 
                    size={14} 
                    color={p.status === 'Paid' ? '#4ade80' : '#f59e0b'} 
                  />
                </TouchableOpacity>

                <View style={styles.payText}>
                  <Text style={styles.payName}>{p.vendorName}</Text>
                  <Text style={styles.payMeta}>{p.category} • {p.method}</Text>
                </View>

                <Text style={[styles.payAmount, p.status === 'Paid' ? { color: '#4ade80' } : { color: '#f59e0b' }]}>
                  {formatCurrency(p.amount)}
                </Text>

                <TouchableOpacity onPress={() => handleDelete(p.id)} style={styles.deleteBtn}>
                  <FontAwesome name="trash" size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No payments logged.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add payment button */}
      <TouchableOpacity onPress={() => setModalOpen(true)} style={styles.fab}>
        <FontAwesome name="plus" size={24} color="#0d0d1a" />
      </TouchableOpacity>

      {/* Add Payment Modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Wedding Payment</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Payee / Vendor Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Olivia Vance"
                placeholderTextColor="#5a5470"
                value={paymentForm.vendorName}
                onChangeText={(t) => handleInputChange('vendorName', t)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={paymentForm.category}
                onChangeText={(t) => handleInputChange('category', t)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="2000"
                placeholderTextColor="#5a5470"
                value={paymentForm.amount}
                onChangeText={(t) => handleInputChange('amount', t)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Payment</Text>
              <TextInput
                style={styles.input}
                value={paymentForm.date}
                onChangeText={(t) => handleInputChange('date', t)}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleLogPayment}>
                <Text style={styles.createBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
    gap: 20,
  },
  card: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: '#c9a96e',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f0e8',
  },
  metricLabel: {
    fontSize: 11,
    color: '#a0937d',
    marginTop: 4,
  },
  progressBox: {
    width: '100%',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cashFlowRow: {
    flexDirection: 'row',
  },
  cashFlowItem: {
    flex: 1,
    alignItems: 'center',
  },
  cashFlowNum: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f0e8',
  },
  cashFlowLabel: {
    fontSize: 11,
    color: '#a0937d',
    marginTop: 4,
  },
  sectionHeader: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    color: '#c9a96e',
    marginTop: 10,
  },
  categoriesList: {
    gap: 12,
  },
  catCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.2)',
  },
  catInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catName: {
    color: '#f5f0e8',
    fontWeight: '600',
    fontSize: 14,
  },
  catPrice: {
    color: '#a0937d',
    fontSize: 12,
  },
  paymentsList: {
    gap: 10,
  },
  payCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.2)',
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  statusPaid: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: '#4ade80',
  },
  statusUpcoming: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
  },
  payText: {
    flex: 1,
  },
  payName: {
    color: '#f5f0e8',
    fontWeight: '600',
    fontSize: 14,
  },
  payMeta: {
    color: '#6b6157',
    fontSize: 11,
    marginTop: 2,
  },
  payAmount: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 10,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#a0937d',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#c9a96e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    gap: 16,
  },
  modalTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    color: '#c9a96e',
    textAlign: 'center',
    marginBottom: 8,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    color: '#a0937d',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: '#f5f0e8',
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 169, 110, 0.3)',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#a0937d',
    fontWeight: '600',
  },
  createBtn: {
    flex: 1,
    backgroundColor: '#c9a96e',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  createBtnText: {
    color: '#0d0d1a',
    fontWeight: '700',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    color: '#c9a96e',
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#a0937d',
    marginTop: 4,
  },
});
