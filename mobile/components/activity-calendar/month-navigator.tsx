import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Text, TouchableOpacity, View } from 'react-native';

interface MonthNavigatorProps {
  month: string;
  onMonthChange: (month: string) => void;
}

export function MonthNavigator({ month, onMonthChange }: MonthNavigatorProps) {
  const handlePrev = () => {
    onMonthChange(dayjs(month).subtract(1, 'month').format('YYYY-MM'));
  };

  const handleNext = () => {
    onMonthChange(dayjs(month).add(1, 'month').format('YYYY-MM'));
  };

  const formattedLabel = dayjs(month).isValid()
    ? dayjs(month).format('MMMM YYYY')
    : dayjs().format('MMMM YYYY');

  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-sm font-semibold text-muted-foreground">{formattedLabel}</Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={handlePrev}
          className="h-9 w-9 items-center justify-center rounded-full border border-border bg-background"
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          className="h-9 w-9 items-center justify-center rounded-full border border-border bg-background"
          accessibilityRole="button"
          accessibilityLabel="Next month"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
