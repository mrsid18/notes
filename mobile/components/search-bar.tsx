import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
}

export const SearchBar = memo(({ value, placeholder, onChangeText, onSubmit, onClear }: SearchBarProps) => {
  const handleClear = () => {
    onClear?.();
  };

  return (
    <View className="flex-row items-center rounded-2xl border border-border bg-background px-3 py-2">
      <Ionicons name="search-outline" size={18} color="#94a3b8" />
      <TextInput
        className="ml-2 flex-1 text-base text-foreground"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={10} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color="#94a3b8" />
        </Pressable>
      )}
    </View>
  );
});

SearchBar.displayName = 'SearchBar';
