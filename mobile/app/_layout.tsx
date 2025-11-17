import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider } from '@/providers/app-provider';
import { useSessionStore } from '@/stores/session-store';

import '../global.css';

function BootstrapGate({ children }: { children: React.ReactNode }) {
  const status = useSessionStore((state) => state.status);
  const hasBootstrapped = useSessionStore((state) => state.hasBootstrapped);

  if (!hasBootstrapped || status === 'checking') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <BootstrapGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack>
        </BootstrapGate>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AppProvider>
  );
}
