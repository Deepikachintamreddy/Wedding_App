import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { WeddingProvider } from '@/lib/store';
import { View } from 'react-native';
import FloatingChatBot from '@/components/FloatingChatBot';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <WeddingProvider>
      <RootLayoutNav />
    </WeddingProvider>
  );
}

function RootLayoutNav() {
  const segments = useSegments();
  const isAuthOrOnboarding = segments[0] === 'auth' || segments[0] === 'onboarding';

  const customTheme = {
    dark: true,
    colors: {
      primary: '#c9a96e',
      background: 'transparent',
      card: '#0d0d1a',
      text: '#f5f0e8',
      border: 'rgba(201, 169, 110, 0.15)',
      notification: '#ef4444',
    },
    fonts: DarkTheme.fonts,
  };

  return (
    <ThemeProvider value={customTheme}>
      <View style={{ flex: 1, backgroundColor: '#0d0d1a' }}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: 'transparent' }
          }}
        >
          <Stack.Screen name="auth" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ title: 'Settings', headerTintColor: '#c9a96e', headerStyle: { backgroundColor: '#0d0d1a' }, headerTitleStyle: { color: '#f5f0e8' } }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        {!isAuthOrOnboarding && <FloatingChatBot />}
      </View>
    </ThemeProvider>
  );
}

