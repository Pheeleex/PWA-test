import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlobalProvider, useAuth, useApi } from '@/context';
import LoadingOverlay from '@/components/LoadingOverlay';

// Configure notification handling behaviour
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isInitialized, isOnboardingComplete, isAuthenticated, isLoading: authLoading } = useAuth();
  const apiContext = useApi();
  const apiLoading = apiContext?.isLoading || false;
  const segments = useSegments();
  const router = useRouter();

  const isGlobalLoading = authLoading || apiLoading;

  useEffect(() => {
    if (!isInitialized) return;

    const rootSegment = segments[0] as string;
    const isReportPath = rootSegment === "(drawer)" && segments[1] === "report";
    const publicScreens = ["onboarding", "login", "forgot-password", "activation"];
    const isPublic = publicScreens.includes(rootSegment) || isReportPath;

    if (isOnboardingComplete && rootSegment === "onboarding") {
      router.replace("/login");
    } else if (isAuthenticated && !isPublic) {
      if (rootSegment === "login") {
        router.replace("/(drawer)/map");
      }
    } else if (!isAuthenticated && !isPublic) {
      router.replace("/login");
    }
  }, [isInitialized, isOnboardingComplete, isAuthenticated, segments]);

  if (!isInitialized) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />; // Simple splash or empty color
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="activation" />
        <Stack.Screen name="(drawer)" />
      </Stack>
      <StatusBar style="auto" />
      <LoadingOverlay visible={isGlobalLoading} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GlobalProvider>
       <RootLayoutNav />
    </GlobalProvider>
  );
}
