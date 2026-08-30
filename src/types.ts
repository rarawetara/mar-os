// Domain model for the «im Mär» calendar/planner app.
// Mirrors the data shape described in the design handoff README.

export type ItemType = 'task' | 'meeting';

export type MeetingKind =
  | 'meeting' | 'call' | 'submission' | 'presentation'
  | 'show' | 'review' | 'deadline' | 'other';

export type RepeatFreq = 'none' | 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly';

export interface Repeat {
  freq: RepeatFreq;
  until: string | null; // yyyy-mm-dd
}

export interface TimeEntry {
  start: number; // epoch ms
  end: number;   // epoch ms
}

export interface Item {
  id: string;
  title: string;
  type: ItemType;
  meetingKind: MeetingKind | null;
  projectId: string | null;
  date: string | null;     // yyyy-mm-dd, null = unscheduled ("board")
  start: number | null;    // minutes from midnight, null = untimed
  duration: number;        // minutes
  deadline: string | null; // ISO datetime-local string
  plannedMin: number | null;
  done: boolean;
  comment: string;
  colorOverride: string | null;
  timeEntries: TimeEntry[];
  activeTimerStart: number | null;
  repeat: Repeat | null;
  doneDates: string[]; // for repeating items
  skipDates: string[]; // for repeating items
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  color: string; // paper-1..6
  tags: string[];
  date: string | null;
  pinned: boolean;
  updatedAt: number;
}

export type FieldType = 'text' | 'note' | 'number' | 'date' | 'checkbox' | 'select' | 'tags' | 'rating' | 'url';

export interface CollectionField {
  id: string;
  name: string;
  type: FieldType;
  options?: string[];
}

export interface CollectionItem {
  id: string;
  values: Record<string, unknown>;
}

export interface Collection {
  id: string;
  name: string;
  icon: string;
  fields: CollectionField[];
  items: CollectionItem[];
}

export type ViewMode = 'day2' | 'week' | 'month';
export type LoadMode = 'all' | 'meetings';
export type Theme = 'light' | 'dark';
export type Lang = 'ru' | 'en';

export interface AppData {
  projects: Project[];
  items: Item[];
  notes: Note[];
  collections: Collection[];
  projectFilter: Record<string, boolean>; // false = hidden; '_none' key for "no project"
  view: ViewMode;
  anchor: string; // yyyy-mm-dd
  loadMode: LoadMode;
  theme: Theme;
  lang: Lang;
}

export interface DeadlineInfo {
  text: string;
  tone: 'over' | 'soon' | 'ok';
}
