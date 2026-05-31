export type TimeUnit = 'days' | 'months' | 'years';

export interface ShelfLifeResult {
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
  elapsedPercentage: number;
  remainingPercentage: number;
  nsxDate: Date;
  hsdDate: Date;
  currentDate: Date;
}
