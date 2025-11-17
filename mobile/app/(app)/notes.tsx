import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
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

import { ActivityCalendar, MonthNavigator } from '@/components/activity-calendar';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SearchBar } from '@/components/search-bar';
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
  const [visibleMonth, setVisibleMonth] = useState(dayjs().format('YYYY-MM'));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPreset, setFilterPreset] = useState<'all' | 'pinned'>('all');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [activePopover, setActivePopover] = useState<'filters' | 'sort' | null>(null);

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

  const handleMonthChange = (month: string) => {
    setVisibleMonth(month);
  };

  const handleSelectCalendarDate = (date: string) => {
    setSelectedCalendarDate((prev) => (prev === date ? null : date));
  };

  const handleEditPress = (memo: Memo) => {
    setEditingMemoId(memo.name);
    setEditContent(memo.content);
  };

  const handleCancelEdit = () => {
    setEditingMemoId(null);
    setEditContent('');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleToggleCalendarVisibility = () => {
    setIsCalendarVisible((prev) => !prev);
  };

  const togglePopover = (type: 'filters' | 'sort') => {
    setActivePopover((prev) => (prev === type ? null : type));
  };

  const handleFilterPresetChange = (preset: 'all' | 'pinned') => {
    setFilterPreset(preset);
    setActivePopover(null);
  };

  const handleSortDirectionChange = (direction: 'desc' | 'asc') => {
    setSortDirection(direction);
    setActivePopover(null);
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
  const normalizedSearchQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);
  const activityStats = useMemo(() => {
    return memos.reduce<Record<string, number>>((acc, memo) => {
      const source = memo.displayTime ?? memo.createTime;
      if (!source) {
        return acc;
      }
      const key = dayjs(source).format('YYYY-MM-DD');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [memos]);

  const memosToRender = useMemo(() => {
    let result = memos;

    if (selectedCalendarDate) {
      result = result.filter((memo) => {
        const source = memo.displayTime ?? memo.createTime;
        if (!source) {
          return false;
        }
        return dayjs(source).format('YYYY-MM-DD') === selectedCalendarDate;
      });
    }

    if (filterPreset === 'pinned') {
      result = result.filter((memo) => memo.pinned);
    }

    if (normalizedSearchQuery.length > 0) {
      result = result.filter((memo) => {
        const content = memo.content.toLowerCase();
        const tags = memo.tags?.join(' ').toLowerCase() ?? '';
        return content.includes(normalizedSearchQuery) || tags.includes(normalizedSearchQuery);
      });
    }

    const sorted = [...result].sort((a, b) => {
      const aTime = dayjs(a.displayTime ?? a.createTime ?? 0).valueOf();
      const bTime = dayjs(b.displayTime ?? b.createTime ?? 0).valueOf();
      return sortDirection === 'desc' ? bTime - aTime : aTime - bTime;
    });

    return sorted;
  }, [memos, selectedCalendarDate, filterPreset, normalizedSearchQuery, sortDirection]);

  const hasSearchQuery = normalizedSearchQuery.length > 0;
  const isFilteringByDate = Boolean(selectedCalendarDate);
  const isPinnedFilterActive = filterPreset === 'pinned';
  const emptyStateCopy = useMemo(() => {
    if (isFilteringByDate && hasSearchQuery) {
      return {
        title: 'No notes match this date and search',
        description: 'Try clearing one of the filters or adjust your keywords.',
      };
    }

    if (isFilteringByDate) {
      return {
        title: 'No notes for this date',
        description: 'Pick another day or clear the date filter to see all notes.',
      };
    }

    if (hasSearchQuery) {
      return {
        title: 'No notes match your search',
        description: 'Try different keywords or clear the search field.',
      };
    }

    if (isPinnedFilterActive) {
      return {
        title: 'No pinned notes yet',
        description: 'Pin a memo to keep it handy here.',
      };
    }

    return {
      title: 'No notes yet',
      description: 'Create your first note to get started',
    };
  }, [hasSearchQuery, isFilteringByDate, isPinnedFilterActive]);

  const isDeleteModalVisible = Boolean(memoPendingDeletion);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="relative z-30 border-b border-border bg-card px-6 pb-4 pt-12">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 flex-row items-center gap-3">
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              className="mr-1"
              accessibilityLabel="Open navigation menu"
              hitSlop={8}
            >
              <Ionicons name="menu" size={24} color="#64748b" />
            </Pressable>
            <View className="flex-1">
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClear={handleClearSearch}
                placeholder="Search notes..."
              />
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              className={clsx(
                'h-10 w-10 items-center justify-center rounded-full border bg-background',
                isCalendarVisible ? 'border-primary/40 bg-primary/5' : 'border-border'
              )}
              onPress={handleToggleCalendarVisibility}
              accessibilityLabel={isCalendarVisible ? 'Hide calendar' : 'Show calendar'}
              hitSlop={8}
            >
              <Ionicons
                name={isCalendarVisible ? 'calendar-outline' : 'eye-off-outline'}
                size={18}
                color={isCalendarVisible ? '#0ea5e9' : '#64748b'}
              />
            </Pressable>
            <View className="relative">
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-full border border-border bg-background"
                onPress={() => togglePopover('filters')}
                accessibilityLabel="Toggle filters"
                hitSlop={8}
              >
                <Ionicons name="funnel-outline" size={18} color="#64748b" />
              </Pressable>
              {activePopover === 'filters' && (
                <View
                  className="absolute right-0 top-12 z-40 w-48 rounded-2xl border border-border bg-card p-3 shadow-xl"
                  style={{ elevation: 6 }}
                >
                  <Text className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Filters</Text>
                  <Pressable
                    onPress={() => handleFilterPresetChange('all')}
                    className={clsx(
                      'mb-2 flex-row items-center justify-between rounded-xl border px-3 py-2',
                      filterPreset === 'all'
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border/40 bg-background'
                    )}
                  >
                    <Text className="text-sm text-foreground">All notes</Text>
                    {filterPreset === 'all' && <Ionicons name="checkmark" size={16} color="#22c55e" />}
                  </Pressable>
                  <Pressable
                    onPress={() => handleFilterPresetChange('pinned')}
                    className={clsx(
                      'flex-row items-center justify-between rounded-xl border px-3 py-2',
                      filterPreset === 'pinned'
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border/40 bg-background'
                    )}
                  >
                    <Text className="text-sm text-foreground">Pinned only</Text>
                    {filterPreset === 'pinned' && <Ionicons name="checkmark" size={16} color="#22c55e" />}
                  </Pressable>
                </View>
              )}
            </View>
            <View className="relative">
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-full border border-border bg-background"
                onPress={() => togglePopover('sort')}
                accessibilityLabel="Toggle sort options"
                hitSlop={8}
              >
                <Ionicons name="swap-vertical" size={18} color="#64748b" />
              </Pressable>
              {activePopover === 'sort' && (
                <View
                  className="absolute right-0 top-12 z-40 w-48 rounded-2xl border border-border bg-card p-3 shadow-xl"
                  style={{ elevation: 6 }}
                >
                  <Text className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Sort</Text>
                  <Pressable
                    onPress={() => handleSortDirectionChange('desc')}
                    className={clsx(
                      'mb-2 flex-row items-center justify-between rounded-xl border px-3 py-2',
                      sortDirection === 'desc'
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border/40 bg-background'
                    )}
                  >
                    <Text className="text-sm text-foreground">Newest first</Text>
                    {sortDirection === 'desc' && <Ionicons name="checkmark" size={16} color="#22c55e" />}
                  </Pressable>
                  <Pressable
                    onPress={() => handleSortDirectionChange('asc')}
                    className={clsx(
                      'flex-row items-center justify-between rounded-xl border px-3 py-2',
                      sortDirection === 'asc'
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border/40 bg-background'
                    )}
                  >
                    <Text className="text-sm text-foreground">Oldest first</Text>
                    {sortDirection === 'asc' && <Ionicons name="checkmark" size={16} color="#22c55e" />}
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {isCalendarVisible && (
        <View className="border-b border-border bg-card px-6 pb-6 pt-4">
          <MonthNavigator month={visibleMonth} onMonthChange={handleMonthChange} />
          <ActivityCalendar
            month={visibleMonth}
            selectedDate={selectedCalendarDate ?? undefined}
            data={activityStats}
            onSelectDate={handleSelectCalendarDate}
          />
        </View>
      )}

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

      {(selectedCalendarDate || isPinnedFilterActive) && (
        <View className="border-b border-border bg-card px-6 py-3">
          <View className="flex-row flex-wrap gap-2">
            {selectedCalendarDate && (
              <Pressable
                onPress={() => setSelectedCalendarDate(null)}
                className="flex-row items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5"
                accessibilityLabel="Clear date filter"
              >
                <Text className="text-xs font-medium text-foreground">
                  {dayjs(selectedCalendarDate).format('MMM D, YYYY')}
                </Text>
                <Ionicons name="close" size={14} color="#64748b" />
              </Pressable>
            )}
            {isPinnedFilterActive && (
              <Pressable
                onPress={() => handleFilterPresetChange('all')}
                className="flex-row items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5"
                accessibilityLabel="Clear pinned filter"
              >
                <Text className="text-xs font-medium text-foreground">Pinned only</Text>
                <Ionicons name="close" size={14} color="#64748b" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Memos List */}
      {memosToRender.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="document-text-outline" size={64} color="#94a3b8" />
          <Text className="mt-4 text-center text-lg font-semibold text-foreground">
            {emptyStateCopy.title}
          </Text>
          <Text className="mt-2 text-center text-base text-muted-foreground">
            {emptyStateCopy.description}
          </Text>
        </View>
      ) : (
        <FlatList
          data={memosToRender}
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
