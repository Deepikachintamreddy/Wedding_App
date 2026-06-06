import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, Link, usePathname } from 'expo-router';
import { useWeddingStore } from '@/lib/store';
import { daysUntil, formatCurrency, calculateProgress } from '@/lib/utils';
import { FontAwesome } from '@expo/vector-icons';

import Countdown from '@/components/Countdown';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

export default function DashboardScreen() {
  const router = useRouter();
  const store = useWeddingStore();
  const pathname = usePathname();
  const isFocused = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/' || pathname === '';
  const { user, tasks, budget, guests, timeline, loading } = store;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth');
      } else if (!user.onboardingComplete) {
        router.replace('/onboarding');
      }
    }
  }, [user, loading]);



  if (loading || !user) {
    return (
      <View style={[styles.flexCenter, { display: isFocused ? 'flex' : 'none' }]}>
        <ActivityIndicator size="large" color="#c9a96e" />
      </View>
    );
  }

  const daysRemaining = daysUntil(user.weddingDate);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = calculateProgress(completedTasks, totalTasks);
  const nextTask = tasks.find(t => !t.completed);

  const totalBudget = budget.total || 0;
  const totalSpent = budget.categories?.reduce((sum, c) => sum + (c.actual || 0), 0) || 0;
  const remainingBudget = Math.max(0, totalBudget - totalSpent);

  const totalGuests = guests.length;
  const attendingGuests = guests.filter(g => g.status === 'Attending').length;

  if (user.role === 'vendor') {
    const category = user.vendorCategory || 'Planner';
    const rate = user.budget || 3500;
    const clientChatId = user.vendorCategory === 'Photography' ? 'couple_v3' : 'couple_v1';

    return (
      <View style={{ flex: 1, backgroundColor: 'transparent', display: isFocused ? 'flex' : 'none' }}>
        <BackgroundSlideshow />
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Vendor Header */}
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Hello, {user.name}!</Text>
            <Text style={styles.subtitle}>Vendor Portal • {category} Workspace</Text>
          </View>
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.settingsBtn}>
              <FontAwesome name="gear" size={24} color="#c9a96e" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Vendor Stats Grid */}
        <View style={styles.grid}>
          {/* Active Bookings */}
          <View style={styles.card}>
            <FontAwesome name="handshake-o" size={24} color="#c9a96e" style={styles.cardIcon} />
            <Text style={styles.cardNum}>1</Text>
            <Text style={styles.cardLabel}>Booked Client</Text>
          </View>

          {/* Pending Inquiries */}
          <View style={styles.card}>
            <FontAwesome name="envelope-o" size={24} color="#c9a96e" style={styles.cardIcon} />
            <Text style={styles.cardNum}>3</Text>
            <Text style={styles.cardLabel}>Inquiries</Text>
          </View>

          {/* Rate/Price */}
          <View style={styles.card}>
            <FontAwesome name="usd" size={24} color="#c9a96e" style={styles.cardIcon} />
            <Text style={[styles.cardNum, { fontSize: 18 }]}>${rate.toLocaleString()}</Text>
            <Text style={styles.cardLabel}>Starting Rate</Text>
          </View>

          {/* Reviews */}
          <View style={styles.card}>
            <FontAwesome name="star" size={24} color="#c9a96e" style={styles.cardIcon} />
            <Text style={styles.cardNum}>4.9</Text>
            <Text style={styles.cardLabel}>32 Reviews</Text>
          </View>
        </View>

        {/* Action Hub based on Category */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {category === 'Planner' ? '📋 Coordination Hub' :
             category === 'Venue' ? '🏛️ Venue Management' :
             category === 'Photography' ? '📸 Media & Shoot Planner' :
             category === 'Videography' ? '🎥 Media & Videography Hub' :
             category === 'Catering' ? '🍽️ Cuisine & Tastings' :
             category === 'Music' ? '🎵 Music & Playlists' :
             category === 'Florals' ? '💐 Floral Design Suite' :
             category === 'Attire' ? '👗 Design & Sizing Hub' :
             category === 'Hair & Makeup' ? '💄 Glamour & Makeup Suite' : '🎂 Bakery & Cakes Suite'}
          </Text>
          
          <Text style={[styles.taskTitle, { marginBottom: 12, fontSize: 13, color: '#a0937d' }]}>
            Tailored tools for your {category.toLowerCase()} business:
          </Text>

          <View style={{ gap: 10 }}>
            {category === 'Planner' && (
              <>
                <TouchableOpacity style={styles.vendorActionRow} onPress={() => Alert.alert('Timeline Sync', 'Day-of coordination timeline synced successfully!')}>
                  <FontAwesome name="clock-o" size={16} color="#c9a96e" />
                  <Text style={styles.vendorActionText}>Review Client Day-of Timeline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vendorActionRow} onPress={() => Alert.alert('Checklist Sync', 'Assigned couples checklist sync complete.')}>
                  <FontAwesome name="check-square-o" size={16} color="#c9a96e" />
                  <Text style={styles.vendorActionText}>Check Assigned Tasks & Milestones</Text>
                </TouchableOpacity>
              </>
            )}

            {category === 'Venue' && (
              <>
                <TouchableOpacity style={styles.vendorActionRow} onPress={() => Alert.alert('Layout Planner', 'Opening interactive 3D table floor-planner...')}>
                  <FontAwesome name="th" size={16} color="#c9a96e" />
                  <Text style={styles.vendorActionText}>View Table Floor Plans & Layouts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vendorActionRow} onPress={() => Alert.alert('Safety Guidelines', 'Malibu municipal sound & curfew regulations loaded.')}>
                  <FontAwesome name="shield" size={16} color="#c9a96e" />
                  <Text style={styles.vendorActionText}>Check Venue Capacities & Permits</Text>
                </TouchableOpacity>
              </>
            )}

            {category === 'Photography' && (
              <>
                <TouchableOpacity style={styles.vendorActionRow} onPress={() => Alert.alert('Shoot Calendar', 'Golden Hour Studios shoot schedule synced.')}>
                  <FontAwesome name="calendar" size={16} color="#c9a96e" />
                  <Text style={styles.vendorActionText}>Manage Client Shoot Calendar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vendorActionRow} onPress={() => Alert.alert('Gallery Link', 'Copied secure client photo gallery upload link.')}>
                  <FontAwesome name="cloud-upload" size={16} color="#c9a96e" />
                  <Text style={styles.vendorActionText}>Upload Finished Client Photo Gallery</Text>
                </TouchableOpacity>
              </>
            )}

            {category === 'Catering' && (
              <>
                <TouchableOpacity style={styles.vendorActionRow} onPress={() => Alert.alert('Menu Customizer', 'Menu plating checklist updated.')}>
                  <FontAwesome name="cutlery" size={16} color="#c9a96e" />
                  <Text style={styles.vendorActionText}>Manage Plating Menu & Tasting Logs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vendorActionRow} onPress={() => Alert.alert('Dietary Notes', 'Alerting kitchen staff of vegetarian/seafood counts.')}>
                  <FontAwesome name="info-circle" size={16} color="#c9a96e" />
                  <Text style={styles.vendorActionText}>Check Client Dietary Restrictions</Text>
                </TouchableOpacity>
              </>
            )}

            {!['Planner', 'Venue', 'Photography', 'Catering'].includes(category) && (
              <>
                <TouchableOpacity style={styles.vendorActionRow} onPress={() => Alert.alert('Booking Inquiries', 'Booking inquiry list updated.')}>
                  <FontAwesome name="calendar-check-o" size={16} color="#c9a96e" />
                  <Text style={styles.vendorActionText}>Manage Client Bookings & Schedules</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vendorActionRow} onPress={() => Alert.alert('Contract Upload', 'Contract template generated.')}>
                  <FontAwesome name="file-text-o" size={16} color="#c9a96e" />
                  <Text style={styles.vendorActionText}>Upload Service Agreement / Contract</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Assigned Booked Couples */}
        <Text style={styles.sectionHeader}>Assigned Couples</Text>
        <View style={styles.sectionCard}>
          <View style={styles.taskBox}>
            <View style={styles.taskText}>
              <Text style={styles.taskTitle}>Sarah & David</Text>
              <Text style={styles.taskDate}>Wedding Date: July 15, 2027 • Malibu, CA</Text>
              <Text style={[styles.taskDate, { color: '#c9a96e', marginTop: 4 }]}>Theme: Elegant Navy & Gold</Text>
            </View>
            <Link href={{ pathname: '/(tabs)/chat', params: { defaultChatId: clientChatId } }} asChild>
              <TouchableOpacity style={styles.chatClientBtn}>
                <FontAwesome name="comment" size={16} color="#0d0d1a" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        </ScrollView>
      </View>
    );
  }

  // Else, Couple Dashboard (keeps original code)
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', display: isFocused ? 'flex' : 'none' }}>
      <BackgroundSlideshow />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerRow}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user.name.split('&')[0].trim()}!</Text>
          <Text style={styles.subtitle}>Let's plan your dream wedding day.</Text>
        </View>
        <Link href="/settings" asChild>
          <TouchableOpacity style={styles.settingsBtn}>
            <FontAwesome name="gear" size={24} color="#c9a96e" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Live Countdown Widget */}
      <Countdown targetDate={user.weddingDate} />

      {/* Grid Overview Cards */}
      <View style={styles.grid}>
        {/* Timeline Events */}
        <View style={styles.card}>
          <FontAwesome name="clock-o" size={24} color="#c9a96e" style={styles.cardIcon} />
          <Text style={styles.cardNum}>{timeline.length}</Text>
          <Text style={styles.cardLabel}>Events Slotted</Text>
        </View>

        {/* Checklist */}
        <View style={styles.card}>
          <FontAwesome name="check-circle" size={24} color="#c9a96e" style={styles.cardIcon} />
          <Text style={styles.cardNum}>{progressPercent}%</Text>
          <Text style={styles.cardLabel}>Completed</Text>
        </View>

        {/* Budget */}
        <View style={styles.card}>
          <FontAwesome name="usd" size={24} color="#c9a96e" style={styles.cardIcon} />
          <Text style={[styles.cardNum, { fontSize: 18 }]}>{formatCurrency(remainingBudget)}</Text>
          <Text style={styles.cardLabel}>Remaining</Text>
        </View>

        {/* Guests */}
        <View style={styles.card}>
          <FontAwesome name="users" size={24} color="#c9a96e" style={styles.cardIcon} />
          <Text style={styles.cardNum}>{attendingGuests}/{totalGuests}</Text>
          <Text style={styles.cardLabel}>Attending</Text>
        </View>
      </View>

      {/* Next Task Card */}
      {nextTask && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          <View style={styles.taskBox}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => store.updateTask(nextTask.id, { completed: true })}
            >
              <FontAwesome name="square-o" size={20} color="#a0937d" />
            </TouchableOpacity>
            <View style={styles.taskText}>
              <Text style={styles.taskTitle}>{nextTask.title}</Text>
              <Text style={styles.taskDate}>Due: {nextTask.dueDate}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Shortcuts */}
      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <Link href="/(tabs)/chat" asChild>
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome name="comment" size={20} color="#0d0d1a" />
            <Text style={styles.actionBtnText}>Ask AI</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/(tabs)/checklist" asChild>
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome name="plus" size={20} color="#0d0d1a" />
            <Text style={styles.actionBtnText}>Add Task</Text>
          </TouchableOpacity>
        </Link>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  flexCenter: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 10 : 45,
  },
  header: {
    flex: 1,
  },
  settingsBtn: {
    padding: 10,
    marginLeft: 10,
  },
  greeting: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    color: '#c9a96e',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#a0937d',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardNum: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '700',
    color: '#f5f0e8',
  },
  cardLabel: {
    fontSize: 12,
    color: '#a0937d',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: '#c9a96e',
    marginBottom: 12,
  },
  taskBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  taskText: {
    flex: 1,
  },
  taskTitle: {
    color: '#f5f0e8',
    fontSize: 15,
    fontWeight: '600',
  },
  taskDate: {
    color: '#6b6157',
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    color: '#c9a96e',
    marginTop: 10,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#c9a96e',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    color: '#0d0d1a',
    fontWeight: '700',
  },
  vendorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  vendorActionText: {
    color: '#f5f0e8',
    fontSize: 14,
    fontWeight: '600',
  },
  chatClientBtn: {
    backgroundColor: '#c9a96e',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
