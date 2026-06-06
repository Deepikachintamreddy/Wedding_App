import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, TextInput, Modal, Alert } from 'react-native';
import { useWeddingStore } from '@/lib/store';
import { usePathname } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

export default function VendorsScreen() {
  const store = useWeddingStore();
  const pathname = usePathname();
  const isFocused = pathname.includes('/vendors');
  const { vendors, addVendor, updateVendor, deleteVendor } = store;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'Venue',
    location: '',
    costRange: '$$$',
    contractPrice: '',
    contactName: '',
    email: '',
    phone: '',
    notes: '',
  });

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStatusChange = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Booked' ? 'Shortlisted' : 'Booked';
    updateVendor(id, { status: nextStatus });
  };

  const handleAddVendor = () => {
    if (!newVendor.name || !newVendor.location) {
      Alert.alert('Error', 'Please enter name and location');
      return;
    }
    addVendor({
      ...newVendor,
      contractPrice: Number(newVendor.contractPrice) || 0,
      rating: 5.0,
      reviewsCount: 1,
      notes: newVendor.notes || '',
    });
    setNewVendor({
      name: '',
      category: 'Venue',
      location: '',
      costRange: '$$$',
      contractPrice: '',
      contactName: '',
      email: '',
      phone: '',
      notes: '',
    });
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Vendor', 'Are you sure you want to remove this vendor?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteVendor(id) }
    ]);
  };

  return (
    <View style={[styles.container, { display: isFocused ? 'flex' : 'none' }]}>
      <BackgroundSlideshow />
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wedding Vendors</Text>
        <Text style={styles.headerSubtitle}>Manage your vendor team and communication.</Text>
      </View>

      {/* Category Scroll Filter */}
      <View style={styles.categoriesBox}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {[
            { id: 'all', label: 'All' },
            { id: 'Planner', label: '📋 Planners' },
            { id: 'Venue', label: '🏛️ Venues' },
            { id: 'Photography', label: '📸 Photo' },
            { id: 'Videography', label: '🎥 Video' },
            { id: 'Catering', label: '🍽️ Food' },
            { id: 'Music', label: '🎵 Music' },
            { id: 'Florals', label: '💐 Florals' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, activeCategory === cat.id && styles.activeCatChip]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[styles.catChipText, activeCategory === cat.id && styles.activeCatChipText]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="🔍 Search vendor registry..."
          placeholderTextColor="#5a5470"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Vendors list */}
      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.vendorCard}>
            <View style={styles.vendorText}>
              <View style={styles.badgeRow}>
                <Text style={styles.badgeText}>🏷️ {item.category}</Text>
                <Text style={styles.ratingText}>⭐ {(item.rating ?? 0).toFixed(1)}</Text>
              </View>
              <Text style={styles.vendorName}>{item.name}</Text>
              <Text style={styles.vendorLoc}>📍 {item.location} • Cost: {item.costRange}</Text>
              {item.status === 'Booked' && item.contractPrice && (
                <Text style={styles.priceLogged}>💵 Contract price: ${item.contractPrice.toLocaleString()}</Text>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.statusIcon, item.status === 'Booked' ? styles.statusBooked : styles.statusShortlist]}
                onPress={() => handleStatusChange(item.id, item.status)}
              >
                <FontAwesome 
                  name={item.status === 'Booked' ? 'handshake-o' : 'heart-o'} 
                  size={16} 
                  color={item.status === 'Booked' ? '#4ade80' : '#c9a96e'} 
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <FontAwesome name="trash" size={14} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No vendors found.</Text>
          </View>
        }
      />

      {/* Floating Add Vendor button */}
      <TouchableOpacity onPress={() => setModalOpen(true)} style={styles.fab}>
        <FontAwesome name="plus" size={24} color="#0d0d1a" />
      </TouchableOpacity>

      {/* Add Vendor Modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Vendor</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Vendor Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Bellissima Bridal"
                placeholderTextColor="#5a5470"
                value={newVendor.name}
                onChangeText={(t) => setNewVendor(prev => ({ ...prev, name: t }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={newVendor.category}
                onChangeText={(t) => setNewVendor(prev => ({ ...prev, category: t }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Pasadena, CA"
                placeholderTextColor="#5a5470"
                value={newVendor.location}
                onChangeText={(t) => setNewVendor(prev => ({ ...prev, location: t }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contract Price ($) (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="3000"
                placeholderTextColor="#5a5470"
                keyboardType="number-pad"
                value={newVendor.contractPrice}
                onChangeText={(t) => setNewVendor(prev => ({ ...prev, contractPrice: t }))}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleAddVendor}>
                <Text style={styles.createBtnText}>Add</Text>
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
  categoriesBox: {
    paddingVertical: 14,
    backgroundColor: 'rgba(13, 13, 26, 0.45)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.15)',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(26, 26, 46, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(201, 169, 110, 0.2)',
  },
  activeCatChip: {
    backgroundColor: '#c9a96e',
    borderColor: '#c9a96e',
  },
  catChipText: {
    color: '#a0937d',
    fontWeight: '600',
    fontSize: 13,
  },
  activeCatChipText: {
    color: '#0d0d1a',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#f5f0e8',
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  vendorCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
  },
  vendorText: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    color: '#c9a96e',
    fontWeight: '700',
  },
  ratingText: {
    fontSize: 10,
    color: '#f59e0b',
    fontWeight: '700',
  },
  vendorName: {
    color: '#f5f0e8',
    fontSize: 15,
    fontWeight: '600',
  },
  vendorLoc: {
    color: '#6b6157',
    fontSize: 11,
    marginTop: 2,
  },
  priceLogged: {
    color: '#4ade80',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBooked: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: '#4ade80',
  },
  statusShortlist: {
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
    borderColor: '#c9a96e',
  },
  deleteBtn: {
    padding: 6,
    marginRight: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingHorizontal: 20,
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
