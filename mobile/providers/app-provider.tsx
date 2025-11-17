import { ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { queryClient } from '@/lib/query-client';
import { useSessionStore } from '@/stores/session-store';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const bootstrap = useSessionStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap().catch((error) => {
      console.error('Failed to bootstrap session store', error);
    });
  }, [bootstrap]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
