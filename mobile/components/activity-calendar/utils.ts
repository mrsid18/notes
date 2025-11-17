import type { CalendarDayCell } from './types';

interface IntensityClasses {
  container: string;
  text: string;
}

export const getCellIntensityClasses = (day: CalendarDayCell, maxCount: number): IntensityClasses => {
  if (!day.isCurrentMonth || day.count === 0 || maxCount <= 0) {
    return {
      container: 'border-border/30 bg-background',
      text: 'text-muted-foreground',
    };
  }

  const ratio = day.count / maxCount;

  if (ratio > 0.75) {
    return {
      container: 'border-primary bg-primary/90',
      text: 'text-primary-foreground',
    };
  }

  if (ratio > 0.5) {
    return {
      container: 'border-primary/80 bg-primary/70',
      text: 'text-primary-foreground',
    };
  }

  if (ratio > 0.25) {
    return {
      container: 'border-primary/60 bg-primary/50',
      text: 'text-primary-foreground',
    };
  }

  return {
    container: 'border-primary/40 bg-primary/30',
    text: 'text-primary-foreground',
  };
};
