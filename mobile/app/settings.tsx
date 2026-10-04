import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWeddingStore } from '@/lib/store';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

interface SubscriptionPlan {
  id: 'free' | 'pro' | 'pass';
  name: string;
  price: string;
  emoji: string;
  badge?: string;
  features: string[];
  credits: number;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'VND Free',
    price: '$0/mo',
    emoji: '🌱',
    features: ['15 AI Concierge credits', 'Basic checklist builder', 'Budget calculator'],
    credits: 15
  },
  {
    id: 'pro',
    name: 'Concierge Pro',
    price: '$14.99/mo',
    emoji: '✨',
    badge: 'Popular',
    features: ['100 AI credits/month', 'Guest exports', 'Advanced budgets', 'Vendor catalog'],
    credits: 100
  },
  {
    id: 'pass',
    name: 'Full Event Pass',
    price: '$99 one-time',
    emoji: '👑',
    badge: 'Best Value',
    features: ['Unlimited AI Concierge', 'Coordinated by OVAimagination', 'Priority custom checklist', 'Lifetime archive'],
    credits: 9999
  }
];

export default function SettingsScreen() {
  const router = useRouter();
  const store = useWeddingStore();
  const { user, resetStore, updateUser } = store;

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    weddingDate: user?.weddingDate || '',
    location: user?.location || '',
    budget: user?.budget || 50000,
    theme: user?.theme || '',
  });

  const [activePlanId, setActivePlanId] = useState<'free' | 'pro' | 'pass'>(
    user?.eventPassActive ? 'pass' : (user?.aiCredits && user.aiCredits > 15 ? 'pro' : 'free')
  );

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.location.trim()) {
      Alert.alert('Error', 'Please fill in names and location');
      return;
    }
    await updateUser(formData);
    setIsEditMode(false);
    Alert.alert('Success', '🏆 Preferences successfully saved!');
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setActivePlanId(plan.id);
    const isPass = plan.id === 'pass';
    
    await updateUser({
      eventPassActive: isPass,
      aiCredits: plan.credits
    });

    Alert.alert(
      'Plan Activated',
      `🎉 You have successfully switched to the "${plan.name}" plan!`
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Data',
      'Are you sure you want to clear all customized modifications? This will log you out.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Database', 
          style: 'destructive',
          onPress: async () => {
            await resetStore();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    await resetStore();
    router.replace('/auth');
  };

  const getInitials = (name: string) => {
    if (!name) return 'E';
    const parts = name.split('&');
    if (parts.length > 1) {
      const a = parts[0].trim()[0] || '';
      const b = parts[1].trim()[0] || '';
      return `${a}&${b}`.toUpperCase();
    }
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      return ((words[0][0] || '') + (words[1][0] || '')).toUpperCase();
    }
    return (name[0] || 'E').toUpperCase();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <BackgroundSlideshow />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Luxury Monogram Header */}
      <View style={styles.headerContainer}>
        <View style={styles.avatarGlow}>
          <View style={styles.avatarBorder}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.name || '')}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.profileName} numberOfLines={1}>{user?.name}</Text>
        <Text style={styles.profileRole}>
          {user?.role === 'vendor' ? `✨ Professional ${user.vendorCategory}` : '💍 Couple Profile'}
        </Text>
      </View>

      {/* Main Details Panel */}
      {isEditMode ? (
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Edit Profile Info</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Names / Brand Name</Text>
            <TextInput 
              style={styles.input}
              value={formData.name}
              placeholder="e.g. Sarah & David"
              placeholderTextColor="#5a5470"
              onChangeText={(t) => handleInputChange('name', t)}
            />
          </View>

          {user?.role === 'vendor' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Website / Portfolio Link</Text>
                <TextInput 
                  style={styles.input}
                  value={formData.theme}
                  placeholder="e.g. https://myportfolio.com"
                  placeholderTextColor="#5a5470"
                  onChangeText={(t) => handleInputChange('theme', t)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Starting Package Rate ($)</Text>
                <TextInput 
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(formData.budget)}
                  placeholderTextColor="#5a5470"
                  onChangeText={(t) => handleInputChange('budget', Number(t) || 0)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Business Location</Text>
                <TextInput 
                  style={styles.input}
                  value={formData.location}
                  placeholder="Malibu, CA"
                  placeholderTextColor="#5a5470"
                  onChangeText={(t) => handleInputChange('location', t)}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Wedding Date (YYYY-MM-DD)</Text>
                <TextInput 
                  style={styles.input}
                  value={formData.weddingDate}
                  placeholder="2027-07-15"
                  placeholderTextColor="#5a5470"
                  onChangeText={(t) => handleInputChange('weddingDate', t)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Wedding Location</Text>
                <TextInput 
                  style={styles.input}
                  value={formData.location}
                  placeholder="Malibu, CA"
                  placeholderTextColor="#5a5470"
                  onChangeText={(t) => handleInputChange('location', t)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Declared Budget ($)</Text>
                <TextInput 
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(formData.budget)}
                  placeholderTextColor="#5a5470"
                  onChangeText={(t) => handleInputChange('budget', Number(t) || 0)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Theme Aesthetic</Text>
                <TextInput 
                  style={styles.input}
                  value={formData.theme}
                  placeholder="Modern Minimalist"
                  placeholderTextColor="#5a5470"
                  onChangeText={(t) => handleInputChange('theme', t)}
                />
              </View>
            </>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditMode(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveProfileBtn} onPress={handleSave}>
              <Text style={styles.saveProfileBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.detailsCard}>
          <View style={styles.detailsCardHeader}>
            <Text style={styles.cardHeader}>Profile Information</Text>
            <TouchableOpacity style={styles.miniEditBtn} onPress={() => setIsEditMode(true)}>
              <FontAwesome name="pencil" size={14} color="#c9a96e" />
              <Text style={styles.miniEditBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLabelCol}>
              <FontAwesome name="envelope-o" size={14} color="#c9a96e" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Email Address</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>{user?.email}</Text>
          </View>

          {user?.role === 'vendor' ? (
            <>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <FontAwesome name="tags" size={14} color="#c9a96e" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Business Category</Text>
                </View>
                <Text style={styles.detailValue}>{user?.vendorCategory || 'General Partner'}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <FontAwesome name="globe" size={14} color="#c9a96e" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Website Link</Text>
                </View>
                <Text style={styles.detailValue} numberOfLines={1}>{user?.theme || 'Not Provided'}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <FontAwesome name="usd" size={14} color="#c9a96e" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Starting Rate</Text>
                </View>
                <Text style={styles.detailValue}>${user?.budget?.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <FontAwesome name="map-marker" size={14} color="#c9a96e" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Business Location</Text>
                </View>
                <Text style={styles.detailValue}>{user?.location || 'Not Set'}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <FontAwesome name="calendar" size={14} color="#c9a96e" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Wedding Date</Text>
                </View>
                <Text style={styles.detailValue}>{user?.weddingDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <FontAwesome name="map-marker" size={14} color="#c9a96e" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Location</Text>
                </View>
                <Text style={styles.detailValue}>{user?.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <FontAwesome name="usd" size={14} color="#c9a96e" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Target Budget</Text>
                </View>
                <Text style={styles.detailValue}>${user?.budget?.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelCol}>
                  <FontAwesome name="paint-brush" size={14} color="#c9a96e" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Theme Aesthetic</Text>
                </View>
                <Text style={styles.detailValue}>{user?.theme}</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Subscription Banner */}
      <View style={styles.membershipCard}>
        <View style={styles.membershipHeader}>
          <Text style={styles.membershipTitle}>MEMBERSHIP TIER</Text>
          <View style={[styles.membershipBadge, activePlanId === 'pass' ? styles.passBadgeBg : (activePlanId === 'pro' ? styles.proBadgeBg : styles.freeBadgeBg)]}>
            <Text style={styles.membershipBadgeText}>
              {activePlanId === 'pass' ? '♛ FULL EVENT PASS' : (activePlanId === 'pro' ? '✦ CONCIERGE PRO' : '🌱 VND FREE')}
            </Text>
          </View>
        </View>
        <Text style={styles.membershipDesc}>
          {activePlanId === 'pass' ? 'Unlimited access to all AI coordination services, customized planners, and direct messaging features coordinated by OVAimagination Events.' :
           activePlanId === 'pro' ? '100 AI credits per month, advanced budgeting, custom checklists, and CSV exporting.' :
           'Basic access with 15 AI credits. Upgrade to unlock full access.'}
        </Text>
      </View>

      {/* Available Upgrades */}
      {SUBSCRIPTION_PLANS.some(plan => plan.id !== activePlanId) && (
        <>
          <Text style={styles.sectionHeader}>Available Upgrades</Text>
          <View style={styles.upgradesList}>
            {SUBSCRIPTION_PLANS.filter(plan => plan.id !== activePlanId).map((plan) => (
              <TouchableOpacity 
                key={plan.id} 
                style={styles.upgradeItem} 
                onPress={() => handleSelectPlan(plan)}
                activeOpacity={0.8}
              >
                <View style={styles.upgradeHeader}>
                  <Text style={styles.upgradeEmojiName}>
                    {plan.emoji} {plan.name}
                  </Text>
                  <Text style={styles.upgradePrice}>{plan.price}</Text>
                </View>
                <Text style={styles.upgradeFeatures}>
                  {plan.features.join(' • ')}
                </Text>
                <View style={styles.upgradeAction}>
                  <Text style={styles.upgradeActionText}>Upgrade Tier</Text>
                  <FontAwesome name="angle-right" size={14} color="#c9a96e" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Clean Account Settings List */}
      <Text style={styles.sectionHeader}>Account & Database Settings</Text>
      <View style={styles.settingsList}>
        <TouchableOpacity style={styles.settingsListItem} onPress={handleLogout} activeOpacity={0.7}>
          <View style={styles.settingsListLeft}>
            <FontAwesome name="sign-out" size={16} color="#a0937d" style={styles.settingsListIcon} />
            <Text style={styles.settingsListText}>Log Out Profile</Text>
          </View>
          <FontAwesome name="angle-right" size={16} color="#a0937d" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsListItem} onPress={handleReset} activeOpacity={0.7}>
          <View style={styles.settingsListLeft}>
            <FontAwesome name="trash-o" size={16} color="#ef4444" style={styles.settingsListIcon} />
            <Text style={[styles.settingsListText, { color: '#ef4444' }]}>Reset Local Databases</Text>
          </View>
          <FontAwesome name="angle-right" size={16} color="#ef4444" />
        </TouchableOpacity>
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
    padding: 24,
    gap: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  avatarGlow: {
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 16,
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#c9a96e',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16162a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '700',
    color: '#c9a96e',
    letterSpacing: 0.5,
  },
  profileName: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f0e8',
    textAlign: 'center',
  },
  profileRole: {
    fontSize: 12,
    color: '#c9a96e',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  detailsCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  detailsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.12)',
    paddingBottom: 10,
    marginBottom: 4,
  },
  cardHeader: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: '#c9a96e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  miniEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 10,
  },
  miniEditBtnText: {
    color: '#c9a96e',
    fontSize: 11,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    width: 16,
  },
  detailLabel: {
    color: '#a0937d',
    fontSize: 13,
  },
  detailValue: {
    color: '#f5f0e8',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '55%',
  },
  membershipCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1.5,
    borderColor: '#c9a96e',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#a0937d',
    letterSpacing: 0.5,
  },
  membershipBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  passBadgeBg: {
    backgroundColor: '#c9a96e',
  },
  proBadgeBg: {
    backgroundColor: '#6366f1',
  },
  freeBadgeBg: {
    backgroundColor: '#334155',
  },
  membershipBadgeText: {
    color: '#0d0d1a',
    fontSize: 9,
    fontWeight: '800',
  },
  membershipDesc: {
    color: '#a0937d',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: '#c9a96e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
  },
  upgradesList: {
    gap: 12,
  },
  upgradeItem: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  upgradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upgradeEmojiName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f5f0e8',
  },
  upgradePrice: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '700',
    color: '#c9a96e',
  },
  upgradeFeatures: {
    color: '#a0937d',
    fontSize: 11,
  },
  upgradeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  upgradeActionText: {
    color: '#c9a96e',
    fontSize: 11,
    fontWeight: '700',
  },
  settingsList: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.06)',
  },
  settingsListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsListIcon: {
    width: 20,
    textAlign: 'center',
  },
  settingsListText: {
    color: '#f5f0e8',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
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
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#f5f0e8',
    fontSize: 15,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#a0937d',
    fontWeight: '600',
    fontSize: 14,
  },
  saveProfileBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#c9a96e',
    alignItems: 'center',
  },
  saveProfileBtnText: {
    color: '#0d0d1a',
    fontWeight: '700',
    fontSize: 14,
  },
});
