import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWeddingStore } from '@/lib/store';
import { api } from '@/lib/api';

const VENDOR_CATEGORIES = [
  { id: 'Wedding Planners & Coordinators', name: '📋 Planners & Coordinators' },
  { id: 'Venues', name: '🏛️ Venues' },
  { id: 'Caterers', name: '🍽️ Caterers' },
  { id: 'Photographers', name: '📸 Photographers' },
  { id: 'Videographers', name: '🎥 Videographers' },
  { id: 'Florists', name: '💐 Florists' },
  { id: 'DJs', name: '🎵 DJs' },
  { id: 'Live Bands & Musicians', name: '🎸 Live Bands & Musicians' },
  { id: 'Makeup Artists', name: '💄 Makeup Artists' },
  { id: 'Hairstylists', name: '💈 Hairstylists' },
  { id: 'Decor & Rental Companies', name: '✨ Decor & Rental Companies' },
  { id: 'Wedding Cake Bakers', name: '🎂 Wedding Cake Bakers' },
  { id: 'Bartending Services', name: '🍷 Bartending Services' },
  { id: 'Bridal Boutiques', name: '👗 Bridal Boutiques' },
  { id: 'Tuxedo & Suit Rentals', name: '🤵 Tuxedo & Suit Rentals' },
  { id: 'Transportation Services', name: '🚗 Transportation Services' },
  { id: 'Officiants', name: '⛪ Officiants' },
  { id: 'Content Creators', name: '📱 Content Creators' },
  { id: 'Stationery & Invitation Designers', name: '✉️ Stationery & Invitation Designers' },
  { id: 'Lighting & Production Companies', name: '💡 Lighting & Production Companies' },
  { id: 'More', name: '➕ More Option' },
];

interface BusinessDetails {
  name: string;
  rate: string;
  website: string;
  notes: string;
}

export default function AuthScreen() {
  const router = useRouter();
  const store = useWeddingStore();
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
  const [role, setRole] = useState<'couple' | 'vendor' | 'admin'>('couple');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Multiple business category state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Wedding Planners & Coordinators']);
  const [businessesDetails, setBusinessesDetails] = useState<Record<string, BusinessDetails>>({
    'Wedding Planners & Coordinators': { name: '', rate: '', website: '', notes: '' }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusinessDetailChange = (category: string, field: keyof BusinessDetails, value: string) => {
    setBusinessesDetails((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      let updated;
      if (prev.includes(catId)) {
        if (prev.length === 1) {
          Alert.alert('Warning', 'Venders must select at least one category.');
          return prev;
        }
        updated = prev.filter((id) => id !== catId);
      } else {
        updated = [...prev, catId];
      }

      // Initialize template details for new category
      setBusinessesDetails((prevDetails) => {
        const details = { ...prevDetails };
        updated.forEach((id) => {
          if (!details[id]) {
            details[id] = { name: '', rate: '', website: '', notes: '' };
          }
        });
        return details;
      });

      return updated;
    });
  };

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (activeTab === 'signup' && !formData.name) {
      Alert.alert('Error', 'Please fill in your name');
      return;
    }
    
    // Validate vendor inputs
    if (activeTab === 'signup' && role === 'vendor') {
      for (const catId of selectedCategories) {
        const details = businessesDetails[catId];
        if (!details || !details.name.trim()) {
          Alert.alert('Error', `Please enter the Business Name for your ${catId} business.`);
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const result = await api.login(formData.email, formData.password);
        await store.loadAllData(); // Reload all data from API
        setIsLoading(false);
        router.replace('/(tabs)');
      } else {
        const businessesArray = selectedCategories.map((catId) => ({
          category: catId,
          name: businessesDetails[catId]?.name || formData.name + ' ' + catId,
          rate: Number(businessesDetails[catId]?.rate) || 3500,
          website: businessesDetails[catId]?.website || '',
          notes: businessesDetails[catId]?.notes || '',
        }));

        const registerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: role,
          selectedCategories: selectedCategories,
          businesses: role === 'vendor' ? businessesArray : undefined,
        };

        const result = await api.register(registerData);
        await store.loadAllData(); // Reload all data from API
        setIsLoading(false);

        if (role === 'couple') {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Authentication Failed', err.message || 'An error occurred during authentication.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/wedding_table_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.brand}>VND</Text>
          <Text style={styles.tagline}>Elevate Your Wedding Planning</Text>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Log In</Text>
            </TouchableOpacity>
          </View>

          {/* Role Picker (only for Sign Up) */}
          {activeTab === 'signup' && (
            <View style={styles.roleContainer}>
              <Text style={styles.label}>I am planning as a:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[styles.roleBtn, role === 'couple' && styles.activeRoleBtn]}
                  onPress={() => setRole('couple')}
                >
                  <Text style={[styles.roleBtnText, role === 'couple' && styles.activeRoleBtnText]}>💍 Couple</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleBtn, role === 'vendor' && styles.activeRoleBtn]}
                  onPress={() => setRole('vendor')}
                >
                  <Text style={[styles.roleBtnText, role === 'vendor' && styles.activeRoleBtnText]}>🏛️ Vendor</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.form}>
            {activeTab === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Sarah Jenkins"
                  placeholderTextColor="#5a5470"
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                />
              </View>
            )}

            {activeTab === 'signup' && role === 'vendor' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Your Business Categories (Select multiple if applicable)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                  {VENDOR_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          isSelected && styles.activeCategoryChip
                        ]}
                        onPress={() => toggleCategory(cat.id)}
                      >
                        <Text style={[
                          styles.categoryChipText,
                          isSelected && styles.activeCategoryChipText
                        ]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Dynamic Form Sections for each selected vendor business category */}
            {activeTab === 'signup' && role === 'vendor' && selectedCategories.map((catId) => {
              const details = businessesDetails[catId] || { name: '', rate: '', website: '', notes: '' };
              return (
                <View key={catId} style={styles.businessDetailCard}>
                  <Text style={styles.businessDetailHeader}>💼 {catId} Details</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Business Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Dream Planners LLC"
                      placeholderTextColor="#5a5470"
                      value={details.name}
                      onChangeText={(text) => handleBusinessDetailChange(catId, 'name', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Starting Rate ($)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 3500"
                      placeholderTextColor="#5a5470"
                      keyboardType="numeric"
                      value={details.rate}
                      onChangeText={(text) => handleBusinessDetailChange(catId, 'rate', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Website URL</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. www.dreamplanners.com"
                      placeholderTextColor="#5a5470"
                      value={details.website}
                      onChangeText={(text) => handleBusinessDetailChange(catId, 'website', text)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Service Description & Notes</Text>
                    <TextInput
                      style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                      placeholder="e.g. Custom planning, full coordination, timeline design."
                      placeholderTextColor="#5a5470"
                      multiline
                      value={details.notes}
                      onChangeText={(text) => handleBusinessDetailChange(catId, 'notes', text)}
                    />
                  </View>
                </View>
              );
            })}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="sarah.david@love.com"
                placeholderTextColor="#5a5470"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#5a5470"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#0d0d1a" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {activeTab === 'signup' ? 'Get Started' : 'Log In'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 26, 0.65)',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 60,
  },
  brand: {
    fontFamily: 'SpaceMono',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#c9a96e',
    textAlign: 'center',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#a0937d',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: 'rgba(201, 169, 110, 0.15)',
  },
  tabText: {
    color: '#a0937d',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#c9a96e',
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  activeRoleBtn: {
    borderColor: '#c9a96e',
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
  },
  roleBtnText: {
    color: '#a0937d',
    fontWeight: '600',
  },
  activeRoleBtnText: {
    color: '#c9a96e',
  },
  form: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: '#a0937d',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#f5f0e8',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#c9a96e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#c9a96e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnText: {
    color: '#0d0d1a',
    fontSize: 16,
    fontWeight: '700',
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
  },
  activeCategoryChip: {
    backgroundColor: '#c9a96e',
    borderColor: '#c9a96e',
  },
  categoryChipText: {
    color: '#a0937d',
    fontSize: 13,
    fontWeight: '600',
  },
  activeCategoryChipText: {
    color: '#0d0d1a',
  },
  businessDetailCard: {
    backgroundColor: 'rgba(13, 13, 26, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  businessDetailHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c9a96e',
    fontFamily: 'SpaceMono',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 110, 0.15)',
    paddingBottom: 6,
    marginBottom: 4,
  },
});
