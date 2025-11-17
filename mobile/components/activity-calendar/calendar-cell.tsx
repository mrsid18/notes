import clsx from 'clsx';
import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import type { CalendarDayCell } from './types';
import { getCellIntensityClasses } from './utils';

interface CalendarCellProps {
  day: CalendarDayCell;
  maxCount: number;
  onPress?: (date: string) => void;
}

export const CalendarCell = memo(({ day, maxCount, onPress }: CalendarCellProps) => {
  if (!day.isCurrentMonth) {
    return (
      <View className="h-10 w-full items-center justify-center rounded-xl">
        <Text className="text-[11px] font-medium text-muted-foreground/40">{day.label}</Text>
      </View>
    );
  }

  const intensityClasses = getCellIntensityClasses(day, maxCount);
  const isInteractive = Boolean(onPress && day.count > 0);
  const accessibilityLabel = day.count
    ? `${day.count} memo${day.count === 1 ? '' : 's'} on ${day.date}`
    : `No memos on ${day.date}`;

  const content = (
    <View
      className={clsx(
        'h-10 w-full items-center justify-center rounded-xl border',
        intensityClasses.container,
        day.isToday && 'border-primary/60',
        day.isWeekend && 'opacity-90',
      )}
    >
      <Text className={clsx('text-[11px] font-semibold', intensityClasses.text)}>{day.label}</Text>
    </View>
  );

  if (!isInteractive) {
    return content;
  }

  return (
    <TouchableOpacity
      className="w-full"
      onPress={() => onPress?.(day.date)}
      accessibilityRole="button"
      accessibilityState={{ selected: day.isSelected }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
});

CalendarCell.displayName = 'CalendarCell';
