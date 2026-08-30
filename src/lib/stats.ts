import type { AppData } from '../types';
import { addDays, parseDate, DOW_FULL_ACC } from './date';
import { isDoneOn, occursOn, visible } from './domain';

export interface WeekStats {
  closedPct: number;
  streak: number;
  bestDowName: string | null;
  totalCount: number;
  doneCount: number;
  dowBars: { value: number; isBest: boolean }[];
}

/** Rolling 7-day window ending today, used for the rail's "week in numbers" card. */
export function computeWeekStats(data: AppData): WeekStats {
  const end = new Date();
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  let total = 0, done = 0;
  const dowAgg = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun
  let streak = 0;
  let streakBroken = false;

  // walk from most recent day backwards for the streak
  for (let i = dates.length - 1; i >= 0; i--) {
    const date = dates[i];
    const items = data.items.filter((it) => visible(data, it) && occursOn(it, date));
    const n = items.length;
    const nDone = items.filter((it) => isDoneOn(it, date)).length;
    total += n; done += nDone;
    if (n > 0) {
      const dow = parseDate(date).getDay();
      const mondayIdx = dow === 0 ? 6 : dow - 1;
      dowAgg[mondayIdx] += n;
    }
    if (!streakBroken) {
      if (n > 0 && nDone === n) streak++;
      else if (n > 0) streakBroken = true;
    }
  }

  const dowMax = Math.max(1, ...dowAgg);
  const bestDowI = dowAgg.indexOf(Math.max(...dowAgg));
  const bestDowName = dowAgg[bestDowI] > 0 ? DOW_FULL_ACC[bestDowI] : null;

  return {
    closedPct: total > 0 ? Math.round((done / total) * 100) : 0,
    streak,
    bestDowName,
    totalCount: total,
    doneCount: done,
    dowBars: dowAgg.map((v, i) => ({ value: Math.max(6, Math.round((v / dowMax) * 100)), isBest: i === bestDowI && v > 0 })),
  };
}

// re-export for callers that only need addDays alongside stats
export { addDays };
