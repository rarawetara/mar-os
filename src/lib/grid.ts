import { HOUR_END, HOUR_PX, HOUR_START } from './domain';

export const blockTop = (start: number) => ((start - HOUR_START * 60) / 60) * HOUR_PX;
export const blockHeight = (duration: number) => Math.max(16, (duration / 60) * HOUR_PX);

/** Convert a pointer Y offset (relative to the top of a day column) to a
 * 5-minute-snapped absolute minute-of-day, clamped to the visible hour range. */
export function minuteFromOffsetY(offsetY: number): number {
  const raw = HOUR_START * 60 + (offsetY / HOUR_PX) * 60;
  const snapped = Math.round(raw / 5) * 5;
  return Math.max(HOUR_START * 60, Math.min(HOUR_END * 60 - 5, snapped));
}

export function hourLabels(): { minute: number; label: string }[] {
  const out: { minute: number; label: string }[] = [];
  for (let h = HOUR_START; h < HOUR_END; h++) {
    out.push({ minute: h * 60, label: `${String(h).padStart(2, '0')}:00` });
  }
  return out;
}

export const gridHeightPx = () => (HOUR_END - HOUR_START) * HOUR_PX;
