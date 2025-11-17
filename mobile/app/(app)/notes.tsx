import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { memoService } from '@/services/memo-service';
import { useSessionStore } from '@/stores/session-store';
import type { Memo } from '@/types/api';

export default function NotesScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const accessToken = useSessionStore((state) => state.accessToken);
  const status = useSessionStore((state) => state.status);

  const [isCreating, setIsCreating] = useState(false);
  const [newMemoContent, setNewMemoContent] = useState('');
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [memoPendingDeletion, setMemoPendingDeletion] = useState<Memo | null>(null);

  // Fetch memos - only if we have a token
  const {
    data: memosData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['memos'],
    queryFn: () => memoService.list({ pageSize: 100 }),
    enabled: !!accessToken && status === 'authenticated',
  });

  // Create memo mutation
  const createMutation = useMutation({
    mutationFn: (content: string) =>
      memoService.create({
        content,
        visibility: 'PRIVATE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos'] });
      setNewMemoContent('');
      setIsCreating(false);
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to create memo: ${error.message}`);
    },
  });

  // Update memo mutation
  const updateMutation = useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) =>
      memoService.update(name, {
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos'] });
      setEditingMemoId(null);
      setEditContent('');
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to update memo: ${error.message}`);
    },
  });

  // Delete memo mutation
  const deleteMutation = useMutation({
    mutationFn: (name: string) => memoService.remove(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos'] });
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to delete memo: ${error.message}`);
    },
  });

  const handleCreateMemo = () => {
    if (!newMemoContent.trim()) {
      Alert.alert('Error', 'Memo content cannot be empty');
      return;
    }
    createMutation.mutate(newMemoContent);
  };

  const handleUpdateMemo = (name: string) => {
    if (!editContent.trim()) {
      Alert.alert('Error', 'Memo content cannot be empty');
      return;
    }
    updateMutation.mutate({ name, content: editContent });
  };

  const handleDeletePress = (memo: Memo) => {
    setMemoPendingDeletion(memo);
  };

  const handleConfirmDeleteMemo = () => {
    if (!memoPendingDeletion) {
      return;
    }
    deleteMutation.mutate(memoPendingDeletion.name, {
      onSuccess: () => {
        setMemoPendingDeletion(null);
      },
    });
  };

  const handleCancelDeleteMemo = () => {
    if (deleteMutation.isPending) {
      return;
    }
    setMemoPendingDeletion(null);
  };

  const handleEditPress = (memo: Memo) => {
    setEditingMemoId(memo.name);
    setEditContent(memo.content);
  };

  const handleCancelEdit = () => {
    setEditingMemoId(null);
    setEditContent('');
  };

  const renderMemoItem = ({ item }: { item: Memo }) => {
    const isEditing = editingMemoId === item.name;

    return (
      <View className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        {isEditing ? (
          <View>
            <TextInput
              className="min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground"
              value={editContent}
              onChangeText={setEditContent}
              multiline
              placeholder="Edit memo content..."
              placeholderTextColor="#94a3b8"
            />
            <View className="mt-3 flex-row gap-2">
              <Pressable
                className="flex-1 rounded-lg bg-primary py-2"
                onPress={() => handleUpdateMemo(item.name)}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-center text-sm font-semibold text-primary-foreground">
                    Save
                  </Text>
                )}
              </Pressable>
              <Pressable
                className="flex-1 rounded-lg border border-border bg-card py-2"
                onPress={handleCancelEdit}
                disabled={updateMutation.isPending}
              >
                <Text className="text-center text-sm font-semibold text-foreground">Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View>
            <Text className="text-base leading-6 text-foreground">{item.content}</Text>
            {item.createTime && (
              <Text className="mt-2 text-xs text-muted-foreground">
                {new Date(item.createTime).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
            <View className="mt-3 flex-row gap-2">
              <Pressable
                className="flex-1 flex-row items-center justify-center gap-1 rounded-lg border border-border bg-background py-2"
                onPress={() => handleEditPress(item)}
              >
                <Ionicons name="pencil" size={16} color="#64748b" />
                <Text className="text-sm font-medium text-muted-foreground">Edit</Text>
              </Pressable>
              <Pressable
                className="flex-1 flex-row items-center justify-center gap-1 rounded-lg border border-destructive/20 bg-destructive/10 py-2"
                onPress={() => handleDeletePress(item)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    <Text className="text-sm font-medium text-destructive">Delete</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  };

  // No access token - show setup screen
  if (!accessToken || status === 'unauthenticated') {
    return (
      <View className="flex-1 bg-background">
        <View className="border-b border-border bg-card px-6 pb-4 pt-12">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              className="mr-4"
            >
              <Ionicons name="menu" size={24} color="#64748b" />
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Notes</Text>
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-orange-100">
            <Ionicons name="key-outline" size={48} color="#f97316" />
          </View>
          <Text className="mt-6 text-center text-2xl font-bold text-foreground">
            Access Token Required
          </Text>
          <Text className="mt-3 text-center text-base text-muted-foreground">
            You need to add your Memos access token to view and manage your notes.
          </Text>
          <Text className="mt-4 text-center text-sm text-muted-foreground">
            Go to your Memos web interface → Settings → Access Tokens to create one.
          </Text>
          <Pressable
            className="mt-8 rounded-xl bg-primary px-8 py-4"
            onPress={() => navigation.navigate('profile' as never)}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text className="text-base font-semibold text-primary-foreground">
                Add Access Token
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-base text-muted-foreground">Loading notes...</Text>
      </View>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const isAuthError =
      errorMessage.toLowerCase().includes('401') ||
      errorMessage.toLowerCase().includes('unauthorized') ||
      errorMessage.toLowerCase().includes('invalid token');

    return (
      <View className="flex-1 bg-background">
        <View className="border-b border-border bg-card px-6 pb-4 pt-12">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              className="mr-4"
            >
              <Ionicons name="menu" size={24} color="#64748b" />
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Notes</Text>
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name={isAuthError ? 'key-outline' : 'alert-circle-outline'}
            size={64}
            color={isAuthError ? '#f97316' : '#ef4444'}
          />
          <Text className="mt-4 text-center text-lg font-semibold text-foreground">
            {isAuthError ? 'Invalid Access Token' : 'Failed to Load Notes'}
          </Text>
          <Text className="mt-2 text-center text-base text-muted-foreground">
            {isAuthError
              ? 'Your access token is invalid or has expired. Please update it in your profile.'
              : errorMessage}
          </Text>
          {isAuthError ? (
            <Pressable
              className="mt-6 rounded-lg bg-primary px-6 py-3"
              onPress={() => navigation.navigate('profile' as never)}
            >
              <Text className="text-base font-semibold text-primary-foreground">Go to Profile</Text>
            </Pressable>
          ) : (
            <Pressable className="mt-6 rounded-lg bg-primary px-6 py-3" onPress={() => refetch()}>
              <Text className="text-base font-semibold text-primary-foreground">Try Again</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  const memos = memosData?.memos || [];
  const isDeleteModalVisible = Boolean(memoPendingDeletion);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border bg-card px-6 py-4">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="mr-4"
          >
            <Ionicons name="menu" size={24} color="#64748b" />
          </Pressable>
          <Text className="text-3xl font-bold text-foreground">Notes</Text>
        </View>
      </View>

      {/* Create Memo Section */}
      {isCreating && (
        <View className="border-b border-border bg-card px-6 py-4">
          <TextInput
            className="min-h-[100px] rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground"
            value={newMemoContent}
            onChangeText={setNewMemoContent}
            multiline
            placeholder="Write your note..."
            placeholderTextColor="#94a3b8"
            autoFocus
          />
          <View className="mt-3 flex-row gap-2">
            <Pressable
              className="flex-1 rounded-lg bg-primary py-3"
              onPress={handleCreateMemo}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-center text-base font-semibold text-primary-foreground">
                  Create Note
                </Text>
              )}
            </Pressable>
            <Pressable
              className="flex-1 rounded-lg border border-border bg-card py-3"
              onPress={() => {
                setIsCreating(false);
                setNewMemoContent('');
              }}
              disabled={createMutation.isPending}
            >
              <Text className="text-center text-base font-semibold text-foreground">Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Memos List */}
      {memos.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="document-text-outline" size={64} color="#94a3b8" />
          <Text className="mt-4 text-center text-lg font-semibold text-foreground">
            No notes yet
          </Text>
          <Text className="mt-2 text-center text-base text-muted-foreground">
            Create your first note to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={memos}
          renderItem={renderMemoItem}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      )}

      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        loading={deleteMutation.isPending}
        onCancel={handleCancelDeleteMemo}
        onConfirm={handleConfirmDeleteMemo}
      />

      {!isCreating && (
        <Pressable
          className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
          accessibilityLabel="Create new note"
          onPress={() => setIsCreating(true)}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}
