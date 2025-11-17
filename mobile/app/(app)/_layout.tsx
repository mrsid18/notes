import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#f7f7fb',
            width: 280,
          },
          drawerActiveTintColor: '#3f37c9',
          drawerInactiveTintColor: '#64748b',
          drawerItemStyle: {
            borderRadius: 12,
          },
        }}
      >
        <Drawer.Screen
          name="notes"
          options={{
            title: 'Notes',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: 'Profile',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} className="px-0" />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
