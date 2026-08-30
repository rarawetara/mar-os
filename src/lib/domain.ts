import type { AppData, DeadlineInfo, Item, Project } from '../types';
import { addDays, parseDate, pad2 } from './date';

export const HOUR_PX = 52;
export const HOUR_START = 6;
export const HOUR_END = 23;
export const WORK_START = 9;
export const WORK_END = 18;

export const PALETTE = ['#EC6FA1', '#F191B7', '#F6B3CD', '#FAD5E3', '#D8548A', '#C33F74', '#8B6FD9', '#4A90D9'];
export const PROJECT_ICONS = ['🌿', '🏠', '📖', '💗', '🗂️', '✏️', '🎧', '🍋'];
export const PAPER_IDS = ['paper-1', 'paper-2', 'paper-3', 'paper-4', 'paper-5', 'paper-6'];
export const FALLBACK_COLOR = '#8C8579';

export const MEETING_KINDS: { id: string; name: string }[] = [
  { id: 'meeting', name: 'встреча' },
  { id: 'call', name: 'звонок' },
  { id: 'submission', name: 'подача' },
  { id: 'presentation', name: 'презентация' },
  { id: 'show', name: 'показ' },
  { id: 'review', name: 'ревью' },
  { id: 'deadline', name: 'дедлайн' },
  { id: 'other', name: 'другое' },
];

export const REPEAT_OPTIONS: { id: Item['repeat'] extends null ? never : string; name: string }[] = [
  { id: 'none', name: 'не повторять' },
  { id: 'daily', name: 'каждый день' },
  { id: 'weekdays', name: 'по будням' },
  { id: 'weekly', name: 'каждую неделю' },
  { id: 'biweekly', name: 'раз в 2 недели' },
  { id: 'monthly', name: 'раз в месяц' },
] as any;

export function newItem(o: Partial<Item> = {}): Item {
  return {
    id: uid(), title: '', type: 'task', meetingKind: null, projectId: null,
    date: null, start: null, duration: 30, deadline: null, plannedMin: null,
    done: false, comment: '', colorOverride: null, timeEntries: [],
    activeTimerStart: null, repeat: null, doneDates: [], skipDates: [],
    ...o,
  };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function projectById(projects: Project[], id: string | null): Project | null {
  if (!id) return null;
  return projects.find((p) => p.id === id) || null;
}

export function colorOf(data: AppData, it: Item): string {
  if (it.colorOverride) return it.colorOverride;
  const p = projectById(data.projects, it.projectId);
  return p ? p.color : FALLBACK_COLOR;
}

export function visible(data: AppData, it: Item): boolean {
  const f = data.projectFilter;
  return it.projectId ? f[it.projectId] !== false : f._none !== false;
}

export function matchesRepeat(it: Item, date: string): boolean {
  const r = it.repeat;
  if (!r || r.freq === 'none' || !it.date) return false;
  if (date <= it.date) return false;
  if (r.until && date > r.until) return false;
  const a = parseDate(it.date), b = parseDate(date);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (r.freq === 'daily') return true;
  if (r.freq === 'weekdays') { const w = b.getDay(); return w >= 1 && w <= 5; }
  if (r.freq === 'weekly') return diff % 7 === 0;
  if (r.freq === 'biweekly') return diff % 14 === 0;
  if (r.freq === 'monthly') return b.getDate() === a.getDate();
  return false;
}

export function occursOn(it: Item, date: string): boolean {
  if ((it.skipDates || []).indexOf(date) >= 0) return false;
  return it.date === date || matchesRepeat(it, date);
}

export function isRepeating(it: Item): boolean {
  return !!(it.repeat && it.repeat.freq && it.repeat.freq !== 'none');
}

export function isDoneOn(it: Item, date: string): boolean {
  return isRepeating(it) ? (it.doneDates || []).indexOf(date) >= 0 : !!it.done;
}

export function loggedMin(it: Item): number {
  let total = 0;
  (it.timeEntries || []).forEach((e) => { total += (e.end - e.start) / 60000; });
  if (it.activeTimerStart) total += (Date.now() - it.activeTimerStart) / 60000;
  return total;
}

export function fmtMin(m: number): string {
  m = Math.round(m);
  const h = Math.floor(m / 60), mm = m % 60;
  return h > 0 ? `${h}ч ${pad2(mm)}м` : `${mm}м`;
}

export function deadlineInfo(it: Item): DeadlineInfo | null {
  if (!it.deadline) return null;
  const diff = new Date(it.deadline).getTime() - Date.now();
  if (diff < 0) return { text: 'просрочено', tone: 'over' };
  const mins = diff / 60000;
  const text = mins < 60 ? `через ${Math.round(mins)} мин`
    : mins < 24 * 60 ? `через ${Math.round(mins / 60)} ч`
    : `через ${Math.round(mins / 60 / 24)} дн`;
  return { text, tone: mins < 180 ? 'soon' : 'ok' };
}

export function periodDates(view: AppData['view'], anchor: string): string[] {
  if (view === 'day2') return [anchor, addDays(anchor, 1)];
  if (view === 'week') {
    const d = parseDate(anchor), dow = d.getDay(), off = dow === 0 ? -6 : 1 - dow;
    const start = addDays(anchor, off);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }
  return [anchor];
}

export function dayLoad(data: AppData, date: string): number {
  let arr = data.items.filter((it) => visible(data, it) && occursOn(it, date));
  if (data.loadMode === 'meetings') arr = arr.filter((it) => it.type === 'meeting');
  return arr.length;
}

export function notesOn(data: AppData, date: string) {
  return data.notes.filter((n) => n.date === date);
}

export function kindGlyph(k: string | null): string {
  const map: Record<string, string> = {
    meeting: '◆', call: '☎', submission: '↥', presentation: '▤',
    show: '◈', review: '✓', deadline: '⏰', other: '•',
  };
  return (k && map[k]) || '◆';
}

export function plural(n: number, one: string, few: string, many: string): string {
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return few;
  return many;
}
