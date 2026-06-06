import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Modal, Alert } from 'react-native';
import { useWeddingStore } from '@/lib/store';
import { usePathname } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

export default function GuestsScreen() {
  const store = useWeddingStore();
  const pathname = usePathname();
  const isFocused = pathname.includes('/guests');
  const { guests, addGuest, updateGuest, deleteGuest } = store;

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    group: "Bride's Family",
    status: 'Pending',
    notes: '',
    plusOnes: 0,
  });

  const totalCount = guests.length;
  const attendingCount = guests.filter((g) => g.status === 'Attending').length;
  const pendingCount = guests.filter((g) => g.status === 'Pending').length;

  const filteredGuests = guests.filter((guest) => {
    return guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           guest.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleStatusChange = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Attending' ? 'Declined' : (currentStatus === 'Declined' ? 'Pending' : 'Attending');
    updateGuest(id, { 
      status: nextStatus,
      rsvpReceived: nextStatus !== 'Pending',
      meal: nextStatus === 'Attending' ? 'Beef' : 'Pending'
    });
  };

  const handleAddGuest = () => {
    if (!newGuest.name) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    addGuest(newGuest);
    setNewGuest({
      name: '',
      email: '',
      phone: '',
      group: "Bride's Family",
      status: 'Pending',
      notes: '',
      plusOnes: 0,
    });
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Guest', 'Are you sure you want to remove this guest?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteGuest(id) }
    ]);
  };

  return (
    <View style={[styles.container, { display: isFocused ? 'flex' : 'none' }]}>
      <BackgroundSlideshow />
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Guest List</Text>
        <Text style={styles.headerSubtitle}>Manage RSVPs, meal choices, and details.</Text>
      </View>

      {/* RSVP Stats Grid */}
      <View style={styles.statsBox}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{totalCount}</Text>
          <Text style={styles.statLabel}>Invited</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#4ade80' }]}>{attendingCount}</Text>
          <Text style={styles.statLabel}>Attending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: '#f59e0b' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="🔍 Search guests by name..."
          placeholderTextColor="#5a5470"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Guests FlatList */}
      <FlatList
        data={filteredGuests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.guestCard}>
            <View style={styles.guestText}>
              <Text style={styles.guestName}>{item.name}</Text>
              <Text style={styles.guestMeta}>{item.group} • {item.email || 'No email'}</Text>
              {item.status === 'Attending' && (
                <Text style={styles.mealChoice}>🍴 Choice: {item.meal} • Table: {item.table || 'TBD'}</Text>
              )}
            </View>

            <View style={styles.rightSection}>
              <TouchableOpacity 
                style={[
                  styles.statusBadge,
                  item.status === 'Attending' ? styles.badgeAttending :
                  item.status === 'Pending' ? styles.badgePending : styles.badgeDeclined
                ]}
                onPress={() => handleStatusChange(item.id, item.status)}
              >
                <Text style={[
                  styles.statusText,
                  item.status === 'Attending' ? { color: '#4ade80' } :
                  item.status === 'Pending' ? { color: '#f59e0b' } : { color: '#ef4444' }
                ]}>
                  {item.status}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <FontAwesome name="trash" size={14} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No guests found.</Text>
          </View>
        }
      />

      {/* Floating Add Guest Button */}
      <TouchableOpacity onPress={() => setModalOpen(true)} style={styles.fab}>
        <FontAwesome name="plus" size={24} color="#0d0d1a" />
      </TouchableOpacity>

      {/* Add Guest Modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Guest Entry</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor="#5a5470"
                value={newGuest.name}
                onChangeText={(t) => setNewGuest(prev => ({ ...prev, name: t }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. john@doe.com"
                placeholderTextColor="#5a5470"
                value={newGuest.email}
                onChangeText={(t) => setNewGuest(prev => ({ ...prev, email: t }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Group</Text>
              <TextInput
                style={styles.input}
                value={newGuest.group}
                onChangeText={(t) => setNewGuest(prev => ({ ...prev, group: t }))}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleAddGuest}>
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
  statsBox: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(13, 13, 26, 0.45)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.15)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '700',
    color: '#f5f0e8',
  },
  statLabel: {
    fontSize: 11,
    color: '#a0937d',
    marginTop: 4,
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
  guestCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
  },
  guestText: {
    flex: 1,
  },
  guestName: {
    color: '#f5f0e8',
    fontSize: 15,
    fontWeight: '600',
  },
  guestMeta: {
    color: '#6b6157',
    fontSize: 11,
    marginTop: 2,
  },
  mealChoice: {
    color: '#c9a96e',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  badgeAttending: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  badgePending: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  badgeDeclined: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
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
