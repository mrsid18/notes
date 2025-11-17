import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

type DeleteConfirmationModalProps = {
  visible: boolean;
  loading?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmationModal({
  visible,
  loading = false,
  title = 'Delete note?',
  description = 'This action cannot be undone. Are you sure you want to remove this note?',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
          <View className="items-center">
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text className="mt-4 text-center text-xl font-semibold text-foreground">{title}</Text>
            <Text className="mt-2 text-center text-sm text-muted-foreground">{description}</Text>
          </View>
          <View className="mt-6 flex-row gap-3">
            <Pressable
              className="flex-1 rounded-lg border border-border bg-card py-3"
              onPress={onCancel}
              disabled={loading}
            >
              <Text className="text-center text-base font-semibold text-foreground">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-lg bg-destructive/90 py-3"
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-center text-base font-semibold text-primary-foreground">
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
