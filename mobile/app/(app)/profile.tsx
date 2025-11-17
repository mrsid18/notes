import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSessionStore } from '@/stores/session-store';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const accessToken = useSessionStore((state) => state.accessToken);
  const status = useSessionStore((state) => state.status);
  const setAccessToken = useSessionStore((state) => state.setAccessToken);
  const clearAccessToken = useSessionStore((state) => state.clearAccessToken);
  const validateToken = useSessionStore((state) => state.validateToken);

  const [isEditingToken, setIsEditingToken] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSaveToken = async () => {
    const trimmedToken = tokenInput.trim();

    if (!trimmedToken) {
      Alert.alert('Error', 'Please enter an access token');
      return;
    }

    setIsValidating(true);
    try {
      await setAccessToken(trimmedToken);
      setIsEditingToken(false);
      setTokenInput('');
      Alert.alert('Success', 'Access token saved successfully!');
    } catch (error) {
      Alert.alert(
        'Invalid Token',
        error instanceof Error
          ? error.message
          : 'Failed to validate access token. Please check and try again.'
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearToken = () => {
    Alert.alert(
      'Clear Access Token',
      'Are you sure you want to remove your access token? You will need to add a new one to continue using the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAccessToken();
            Alert.alert('Cleared', 'Access token has been removed.');
          },
        },
      ]
    );
  };

  const handleTestToken = async () => {
    setIsValidating(true);
    try {
      const isValid = await validateToken();
      if (isValid) {
        Alert.alert('Success', 'Access token is valid!');
      } else {
        Alert.alert('Invalid', 'Access token is invalid or expired.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate token. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleAbout = () => {
    Alert.alert(
      'About',
      'Memos Mobile App\nVersion 1.0.0\n\nA lightweight note-taking app.\n\nUses JWT access tokens for authentication.'
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'How to Get Access Token',
      '1. Open Memos web interface\n2. Go to Settings → Access Tokens\n3. Click "Create" to generate a new token\n4. Choose expiration (7/30/90/365 days or never)\n5. Copy the token and paste it here\n\nThe token will be stored securely on your device.'
    );
  };

  const maskedToken = accessToken
    ? `${accessToken.substring(0, 8)}...${accessToken.substring(accessToken.length - 8)}`
    : null;

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border bg-card px-6 py-4">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="mr-4"
          >
            <Ionicons name="menu" size={24} color="#64748b" />
          </Pressable>
          <Text className="text-3xl font-bold text-foreground">Profile</Text>
        </View>
      </View>

      {/* Authentication Status */}
      {accessToken && status === 'authenticated' ? (
        <View className="items-center border-b border-border bg-card px-6 pb-6 pt-8">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          </View>
          <Text className="mt-4 text-2xl font-bold text-foreground">Authenticated</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Your access token is valid and active
          </Text>
        </View>
      ) : (
        <View className="items-center border-b border-border bg-card px-6 pb-6 pt-8">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Ionicons name="key-outline" size={48} color="#64748b" />
          </View>
          <Text className="mt-4 text-2xl font-bold text-foreground">No Access Token</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Add your access token to start using the app
          </Text>
        </View>
      )}

      {/* Access Token Management */}
      <View className="mt-6 px-6">
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Access Token
        </Text>

        {isEditingToken ? (
          <View className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <Text className="mb-2 text-sm text-muted-foreground">
              Paste your JWT access token below:
            </Text>
            <TextInput
              className="min-h-[100px] rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground"
              value={tokenInput}
              onChangeText={setTokenInput}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              placeholderTextColor="#94a3b8"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <View className="mt-4 flex-row gap-2">
              <Pressable
                className="flex-1 rounded-lg bg-primary py-3"
                onPress={handleSaveToken}
                disabled={isValidating}
              >
                {isValidating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-center text-sm font-semibold text-primary-foreground">
                    Save Token
                  </Text>
                )}
              </Pressable>
              <Pressable
                className="flex-1 rounded-lg border border-border bg-background py-3"
                onPress={() => {
                  setIsEditingToken(false);
                  setTokenInput('');
                }}
                disabled={isValidating}
              >
                <Text className="text-center text-sm font-semibold text-foreground">Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : accessToken ? (
          <View className="rounded-2xl border border-border bg-card shadow-sm">
            <View className="border-b border-border px-4 py-4">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground">Active Token</Text>
                  <Text className="mt-1 font-mono text-sm text-foreground">{maskedToken}</Text>
                </View>
              </View>
            </View>

            <Pressable
              className="flex-row items-center px-4 py-3"
              onPress={handleTestToken}
              disabled={isValidating}
            >
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Ionicons name="checkmark-done-outline" size={20} color="#3b82f6" />
              </View>
              <Text className="flex-1 text-base font-medium text-foreground">Validate Token</Text>
              {isValidating ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              )}
            </Pressable>

            <Pressable
              className="border-t border-border px-4 py-3"
              onPress={() => {
                setIsEditingToken(true);
                setTokenInput('');
              }}
            >
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <Ionicons name="refresh-outline" size={20} color="#f97316" />
                </View>
                <Text className="flex-1 text-base font-medium text-foreground">Update Token</Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>
            </Pressable>

            <Pressable className="border-t border-border px-4 py-3" onPress={handleClearToken}>
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </View>
                <Text className="flex-1 text-base font-medium text-destructive">Clear Token</Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>
            </Pressable>
          </View>
        ) : (
          <Pressable
            className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6"
            onPress={() => setIsEditingToken(true)}
          >
            <View className="items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Ionicons name="add" size={32} color="#3f37c9" />
              </View>
              <Text className="mt-4 text-lg font-semibold text-foreground">Add Access Token</Text>
              <Text className="mt-2 text-center text-sm text-muted-foreground">
                Tap to add your JWT access token from Memos settings
              </Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* Help & Info */}
      <View className="mt-6 px-6">
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Help & Information
        </Text>
        <View className="rounded-2xl border border-border bg-card shadow-sm">
          <Pressable
            className="flex-row items-center border-b border-border px-4 py-4"
            onPress={handleHelp}
          >
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Ionicons name="help-circle-outline" size={20} color="#64748b" />
            </View>
            <Text className="flex-1 text-base font-medium text-foreground">How to Get Token</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </Pressable>

          <Pressable className="flex-row items-center px-4 py-4" onPress={handleAbout}>
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Ionicons name="information-circle-outline" size={20} color="#64748b" />
            </View>
            <Text className="flex-1 text-base font-medium text-foreground">About</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </Pressable>
        </View>
      </View>

      {/* Status Info */}
      {status !== 'authenticated' && (
        <View className="mt-6 px-6">
          <View className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <View className="flex-row items-start">
              <Ionicons name="warning-outline" size={20} color="#f97316" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-orange-900">Token Required</Text>
                <Text className="mt-1 text-sm text-orange-700">
                  You need to add a valid access token to view and manage your notes.
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Note about user details */}
      {status === 'authenticated' && (
        <View className="mt-6 px-6">
          <View className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-blue-900">
                  Token-Based Authentication
                </Text>
                <Text className="mt-1 text-sm text-blue-700">
                  This app uses JWT access tokens for secure API access. User details are managed
                  in the Memos web interface.
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
