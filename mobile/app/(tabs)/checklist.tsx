import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Modal, Alert } from 'react-native';
import { useWeddingStore } from '@/lib/store';
import { usePathname } from 'expo-router';
import { formatDate, getCategoryColor, getCategoryIcon, calculateProgress } from '@/lib/utils';
import { FontAwesome } from '@expo/vector-icons';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

export default function ChecklistScreen() {
  const store = useWeddingStore();
  const pathname = usePathname();
  const isFocused = pathname.includes('/checklist');
  const { tasks, addTask, updateTask, deleteTask } = store;
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'month' | 'completed'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Planner');
  const [newDueDate, setNewDueDate] = useState('2027-06-15');

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'completed') return task.completed;
    if (task.completed && activeFilter !== 'all') return false;

    if (activeFilter === 'month') {
      const now = new Date();
      const taskDate = new Date(task.dueDate);
      const diffTime = taskDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleToggleTask = (id: string, currentVal: boolean) => {
    updateTask(id, { completed: !currentVal });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(id) }
    ]);
  };

  const handleAddTask = () => {
    if (!newTitle) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    addTask({
      title: newTitle,
      category: newCategory,
      dueDate: newDueDate,
      notes: '',
      assignedTo: 'Both',
      period: 'Upcoming',
    });
    setNewTitle('');
    setModalOpen(false);
  };

  return (
    <View style={[styles.container, { display: isFocused ? 'flex' : 'none' }]}>
      <BackgroundSlideshow />
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checklist</Text>
        <Text style={styles.headerSubtitle}>Track your wedding tasks and milestones.</Text>
      </View>

      {/* Progress Card */}
      <View style={styles.progressBox}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Checklist Completion</Text>
          <Text style={styles.progressVal}>
            {calculateProgress(tasks.filter(t => t.completed).length, tasks.length)}%
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${calculateProgress(tasks.filter(t => t.completed).length, tasks.length)}%` }
            ]} 
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['all', 'month', 'completed'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.tab, activeFilter === filter && styles.activeTab]}
            onPress={() => setActiveFilter(filter as any)}
          >
            <Text style={[styles.tabText, activeFilter === filter && styles.activeTabText]}>
              {filter === 'all' ? 'All' : filter === 'month' ? 'This Month' : 'Done'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Checklist stream */}
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.taskCard, item.completed && styles.completedCard]}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => handleToggleTask(item.id, item.completed)}
            >
              <FontAwesome 
                name={item.completed ? 'check-square' : 'square-o'} 
                size={22} 
                color={item.completed ? '#4ade80' : '#a0937d'} 
              />
            </TouchableOpacity>
            
            <View style={styles.taskText}>
              <Text style={[styles.taskTitle, item.completed && styles.lineThrough]}>
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                <View style={[styles.catBadge, { borderColor: getCategoryColor(item.category) }]}>
                  <Text style={[styles.catBadgeText, { color: getCategoryColor(item.category) }]}>
                    {getCategoryIcon(item.category)} {item.category}
                  </Text>
                </View>
                <Text style={styles.dueDate}>📅 {formatDate(item.dueDate)}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <FontAwesome name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks found.</Text>
          </View>
        }
      />

      {/* Floating Plus button */}
      <TouchableOpacity onPress={() => setModalOpen(true)} style={styles.fab}>
        <FontAwesome name="plus" size={24} color="#0d0d1a" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Task</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Task Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Fit groom suit"
                placeholderTextColor="#5a5470"
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={newCategory}
                onChangeText={setNewCategory}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={newDueDate}
                onChangeText={setNewDueDate}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleAddTask}>
                <Text style={styles.createBtnText}>Create</Text>
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
  progressBox: {
    padding: 20,
    backgroundColor: 'rgba(13, 13, 26, 0.45)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.15)',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#a0937d',
    fontWeight: '600',
  },
  progressVal: {
    color: '#c9a96e',
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#c9a96e',
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: 'rgba(26, 26, 46, 0.65)',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#c9a96e',
  },
  tabText: {
    color: '#a0937d',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#0d0d1a',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
  },
  completedCard: {
    borderLeftColor: '#4ade80',
    opacity: 0.75,
  },
  checkbox: {
    paddingRight: 12,
  },
  taskText: {
    flex: 1,
  },
  taskTitle: {
    color: '#f5f0e8',
    fontSize: 15,
    fontWeight: '600',
  },
  lineThrough: {
    textDecorationLine: 'line-through',
    color: '#6b6157',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  catBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dueDate: {
    fontSize: 11,
    color: '#6b6157',
  },
  deleteBtn: {
    padding: 8,
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
