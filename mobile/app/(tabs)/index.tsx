import { Text, View } from 'react-native';

import { useSessionStore } from '@/stores/session-store';

export default function HomeScreen() {
  const status = useSessionStore((state) => state.status);
  const user = useSessionStore((state) => state.user);

  return (
    <View className="flex-1 bg-background px-6 py-10">
      <Text className="text-3xl font-semibold text-foreground">Memos</Text>
      <Text className="mt-2 text-base text-muted-foreground">
        {user ? 'You are signed in and ready to sync memos.' : 'Sign in to start reading and writing memos.'}
      </Text>

      <View className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Text className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Session
        </Text>
        <Text className="mt-2 text-2xl font-semibold text-foreground">{status}</Text>
        {user ? (
          <Text className="mt-1 text-base text-foreground">
            {user.nickname ?? user.username}
          </Text>
        ) : (
          <Text className="mt-1 text-base text-muted-foreground">
            You are not authenticated yet.
          </Text>
        )}
      </View>
    </View>
  );
}
