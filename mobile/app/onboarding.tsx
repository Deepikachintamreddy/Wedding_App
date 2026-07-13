import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useWeddingStore } from '@/lib/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

const THEMES = [
  { emoji: '✨', name: 'Elegant Navy & Gold', desc: 'Regal, premium, and sophisticated' },
  { emoji: '🌿', name: 'Modern Minimalist', desc: 'Clean, sleek, monochrome' },
  { emoji: '🪵', name: 'Rustic Chic', desc: 'Warm wood tones, wild florals' },
  { emoji: '🌊', name: 'Coastal Romance', desc: 'Soft pastel tones, sandy beach' },
  { emoji: '🕯️', name: 'Vintage Glamour', desc: 'Art deco, candlelit, historic' },
  { emoji: '🎨', name: 'Creative DIY', desc: 'Colorful, hand-crafted details' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const store = useWeddingStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    partnerA: '',
    partnerB: '',
    weddingDate: '2027-07-15',
    location: 'Malibu, CA',
    budget: 50000,
    theme: 'Elegant Navy & Gold',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (store.user && store.user.name && !formData.partnerA) {
      const userName = store.user.name;
      setFormData((prev) => ({ ...prev, partnerA: userName }));
    }
  }, [store.user?.name]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep === 1 && (!formData.partnerA || !formData.partnerB)) {
      Alert.alert('Error', 'Please fill in both names');
      return;
    }
    if (currentStep === 2 && (!formData.weddingDate || !formData.location)) {
      Alert.alert('Error', 'Please enter a valid date and location');
      return;
    }

    if (currentStep === 4) {
      setIsGenerating(true);
      
      // Simulate generating checklist and budget allocations
      setTimeout(async () => {
        const user = {
          name: `${formData.partnerA} & ${formData.partnerB}`,
          role: 'couple',
          weddingDate: formData.weddingDate,
          location: formData.location,
          budget: Number(formData.budget),
          theme: formData.theme,
          onboardingComplete: true,
          aiCredits: 15,
        };

        try {
          await store.updateUser(user);
          await store.loadAllData(); // Fetches the newly initialized tasks, budget, vendors etc. from live server
        } catch (err) {
          console.error('[Onboarding] Failed to update user profile on backend:', err);
        }

        setIsGenerating(false);
        router.replace('/(tabs)');
      }, 2000);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      <BackgroundSlideshow />
      <Text style={styles.brand}>VND</Text>
      
      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View 
            key={step} 
            style={[
              styles.progressDot, 
              currentStep === step && styles.progressDotActive,
              currentStep > step && styles.progressDotDone
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {isGenerating ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#c9a96e" />
            <Text style={styles.loaderText}>Generating your personalized wedding workspace...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {currentStep === 1 && (
              <View>
                <Text style={styles.title}>Let's start with names</Text>
                <Text style={styles.subtitle}>Who is getting married?</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Your Full Name</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Sarah Jenkins"
                    placeholderTextColor="#5a5470"
                    value={formData.partnerA}
                    onChangeText={(t) => handleInputChange('partnerA', t)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Your Partner's Name</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="David Smith"
                    placeholderTextColor="#5a5470"
                    value={formData.partnerB}
                    onChangeText={(t) => handleInputChange('partnerB', t)}
                  />
                </View>
              </View>
            )}

            {currentStep === 2 && (
              <View>
                <Text style={styles.title}>Date & Location</Text>
                <Text style={styles.subtitle}>Where and when is the ceremony?</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Wedding Date (YYYY-MM-DD)</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="2027-07-15"
                    placeholderTextColor="#5a5470"
                    value={formData.weddingDate}
                    onChangeText={(t) => handleInputChange('weddingDate', t)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Wedding Location</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Malibu, CA"
                    placeholderTextColor="#5a5470"
                    value={formData.location}
                    onChangeText={(t) => handleInputChange('location', t)}
                  />
                </View>
              </View>
            )}

            {currentStep === 3 && (
              <View>
                <Text style={styles.title}>Set Your Budget</Text>
                <Text style={styles.subtitle}>Select or enter your total target budget ($)</Text>
                
                <View style={styles.budgetPresets}>
                  {[25000, 50000, 75000, 100000, 150000].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[styles.budgetBtn, formData.budget === preset && styles.activeBudgetBtn]}
                      onPress={() => handleInputChange('budget', preset)}
                    >
                      <Text style={[styles.budgetBtnText, formData.budget === preset && styles.activeBudgetBtnText]}>
                        ${preset.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={[styles.inputGroup, { marginTop: 20 }]}>
                  <Text style={styles.label}>Or enter custom budget ($)</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="e.g. 65000"
                    placeholderTextColor="#5a5470"
                    keyboardType="number-pad"
                    value={formData.budget > 0 ? String(formData.budget) : ''}
                    onChangeText={(t) => {
                      const numericValue = parseInt(t.replace(/[^0-9]/g, ''), 10) || 0;
                      handleInputChange('budget', numericValue);
                    }}
                  />
                </View>
              </View>
            )}

            {currentStep === 4 && (
              <View>
                <Text style={styles.title}>Select Design Aesthetic</Text>
                <Text style={styles.subtitle}>This sets your customized theme rules</Text>
                
                <View style={styles.themeGrid}>
                  {THEMES.map((theme) => (
                    <TouchableOpacity
                      key={theme.name}
                      style={[styles.themeCard, formData.theme === theme.name && styles.activeThemeCard]}
                      onPress={() => handleInputChange('theme', theme.name)}
                    >
                      <Text style={styles.themeEmoji}>{theme.emoji}</Text>
                      <Text style={styles.themeName}>{theme.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Navigation Button Controls */}
            <View style={styles.navRow}>
              {currentStep > 1 ? (
                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.backBtn} 
                  onPress={async () => {
                    await store.resetStore();
                    router.replace('/auth');
                  }}
                >
                  <Text style={styles.backBtnText}>Exit</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextBtnText}>
                  {currentStep === 4 ? 'Finish' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 80,
  },
  brand: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    color: '#c9a96e',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(201, 169, 110, 0.2)',
  },
  progressDotActive: {
    backgroundColor: '#c9a96e',
    width: 24,
  },
  progressDotDone: {
    backgroundColor: '#a0937d',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(26, 26, 46, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    borderRadius: 24,
    padding: 30,
  },
  title: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    color: '#f5f0e8',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0937d',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
    gap: 6,
  },
  label: {
    color: '#a0937d',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#f5f0e8',
    fontSize: 16,
  },
  budgetPresets: {
    gap: 12,
  },
  budgetBtn: {
    backgroundColor: '#0d0d1a',
    borderWidth: 1.5,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeBudgetBtn: {
    borderColor: '#c9a96e',
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
  },
  budgetBtnText: {
    color: '#a0937d',
    fontSize: 16,
    fontWeight: '600',
  },
  activeBudgetBtnText: {
    color: '#c9a96e',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '47%',
    backgroundColor: '#0d0d1a',
    borderWidth: 1.5,
    borderColor: 'rgba(201, 169, 110, 0.15)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  activeThemeCard: {
    borderColor: '#c9a96e',
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
  },
  themeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  themeName: {
    color: '#f5f0e8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 169, 110, 0.3)',
    borderRadius: 12,
  },
  backBtnText: {
    color: '#a0937d',
    fontWeight: '600',
  },
  nextBtn: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    backgroundColor: '#c9a96e',
    borderRadius: 12,
  },
  nextBtnText: {
    color: '#0d0d1a',
    fontWeight: '700',
  },
  loaderBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 20,
  },
  loaderText: {
    color: '#a0937d',
    textAlign: 'center',
  },
});
