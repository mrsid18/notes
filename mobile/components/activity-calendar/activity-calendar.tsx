import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { CalendarCell } from './calendar-cell';
import { useCalendarMatrix } from './useCalendarMatrix';

interface ActivityCalendarProps {
  month: string;
  selectedDate?: string;
  data: Record<string, number>;
  onSelectDate?: (date: string) => void;
}

const getLocalizedWeekdayLabels = () => {
  const start = dayjs().startOf('week');
  return Array.from({ length: 7 }, (_, index) => start.add(index, 'day').format('dd'));
};

export function ActivityCalendar({ month, selectedDate, data, onSelectDate }: ActivityCalendarProps) {
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const selectedDateFormatted = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : '';

  const weekDays = useMemo(() => getLocalizedWeekdayLabels(), []);

  const { weeks, weekDays: orderedWeekDays, maxCount } = useCalendarMatrix({
    month,
    data,
    weekDays,
    weekStartDayOffset: 0,
    today,
    selectedDate: selectedDateFormatted,
  });

  return (
    <View className="rounded-2xl border border-border bg-card px-4 py-4">
      <View className="mb-3 flex-row gap-[2px]">
        {orderedWeekDays.map((label, index) => (
          <View key={`${label}-${index}`} className="flex-1 items-center justify-center">
            <Text className="text-[11px] font-medium uppercase text-muted-foreground">{label.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      <View className="flex-col gap-2">
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} className="flex-row gap-2">
            {week.days.map((day) => (
              <View key={day.date} className="flex-1">
                <CalendarCell day={day} maxCount={maxCount} onPress={onSelectDate} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
