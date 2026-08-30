import { create } from 'zustand';
import type { AppData, Collection, CollectionItem, Item, Note, Project, ViewMode } from '../types';
import { addDays, parseDate, fmtDate, today } from '../lib/date';
import { isRepeating, newItem, uid, PALETTE, PROJECT_ICONS } from '../lib/domain';
import { seed } from './seed';

const STORAGE_KEY = 'im-mar-v1';

function load(): AppData {
  const base = seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.items && saved.projects) return { ...base, ...saved };
    }
  } catch { /* ignore corrupt storage */ }
  return base;
}

function persist(data: AppData) {
  const { projects, items, notes, collections, projectFilter, view, anchor, loadMode, theme, lang } = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, items, notes, collections, projectFilter, view, anchor, loadMode, theme, lang }));
  } catch { /* storage full/unavailable — non-fatal */ }
}

interface DataActions {
  addUnscheduled: (title: string) => void;
  addItem: (patch: Partial<Item>) => Item;
  updateItem: (id: string, patch: Partial<Item>) => void;
  moveItem: (id: string, patch: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  toggleDone: (it: Item, date: string) => void;
  toggleTimer: (id: string) => void;

  addProject: (name: string) => Project;
  renameProject: (id: string, name: string) => void;
  recolorProject: (id: string, color: string) => void;
  deleteProject: (id: string) => void;
  toggleProjectFilter: (id: string | '_none') => void;

  addNote: () => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  addCollection: () => Collection;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  addCollectionField: (collectionId: string, name: string, type: Collection['fields'][number]['type']) => void;
  addCollectionRow: (collectionId: string) => void;
  updateCollectionCell: (collectionId: string, itemId: string, fieldId: string, value: unknown) => void;
  deleteCollectionRow: (collectionId: string, itemId: string) => void;

  setView: (v: ViewMode) => void;
  step: (dir: 1 | -1) => void;
  goToday: () => void;
  setAnchor: (date: string) => void;
  setLoadMode: (m: AppData['loadMode']) => void;
  toggleTheme: () => void;
  toggleLang: () => void;
}

export const useDataStore = create<AppData & DataActions>((set, get) => ({
  ...load(),

  addUnscheduled: (title) => {
    const t = title.trim();
    if (!t) return;
    set((s) => ({ items: s.items.concat([newItem({ title: t })]) }));
    persist(get());
  },
  addItem: (patch) => {
    const it = newItem(patch);
    set((s) => ({ items: s.items.concat([it]) }));
    persist(get());
    return it;
  },
  updateItem: (id, patch) => {
    set((s) => ({ items: s.items.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
    persist(get());
  },
  moveItem: (id, patch) => {
    set((s) => ({ items: s.items.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
    persist(get());
  },
  deleteItem: (id) => {
    set((s) => ({ items: s.items.filter((o) => o.id !== id) }));
    persist(get());
  },
  toggleDone: (it, date) => {
    if (isRepeating(it)) {
      set((s) => ({
        items: s.items.map((o) => {
          if (o.id !== it.id) return o;
          const set2 = new Set(o.doneDates || []);
          if (set2.has(date)) set2.delete(date); else set2.add(date);
          return { ...o, doneDates: Array.from(set2) };
        }),
      }));
    } else {
      set((s) => ({ items: s.items.map((o) => (o.id === it.id ? { ...o, done: !o.done } : o)) }));
    }
    persist(get());
  },
  toggleTimer: (id) => {
    set((s) => ({
      items: s.items.map((o) => {
        const n = { ...o };
        if (o.activeTimerStart) {
          n.timeEntries = (o.timeEntries || []).concat([{ start: o.activeTimerStart, end: Date.now() }]);
          n.activeTimerStart = null;
        }
        if (o.id === id && !o.activeTimerStart) n.activeTimerStart = Date.now();
        return n;
      }),
    }));
    persist(get());
  },

  addProject: (name) => {
    const s = get();
    const p: Project = { id: uid(), name: name.trim(), color: PALETTE[s.projects.length % PALETTE.length], icon: PROJECT_ICONS[s.projects.length % PROJECT_ICONS.length] };
    set({ projects: s.projects.concat([p]) });
    persist(get());
    return p;
  },
  renameProject: (id, name) => {
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, name } : p)) }));
    persist(get());
  },
  recolorProject: (id, color) => {
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, color } : p)) }));
    persist(get());
  },
  deleteProject: (id) => {
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      items: s.items.map((it) => (it.projectId === id ? { ...it, projectId: null } : it)),
    }));
    persist(get());
  },
  toggleProjectFilter: (id) => {
    set((s) => ({ projectFilter: { ...s.projectFilter, [id]: s.projectFilter[id] === false ? true : false } }));
    persist(get());
  },

  addNote: () => {
    const s = get();
    const papers = ['paper-1', 'paper-2', 'paper-3', 'paper-4', 'paper-5', 'paper-6'];
    const n: Note = { id: uid(), title: '', body: '', color: papers[Math.floor(Math.random() * papers.length)], tags: [], date: null, pinned: false, updatedAt: Date.now() };
    set({ notes: s.notes.concat([n]) });
    persist(get());
    return n;
  },
  updateNote: (id, patch) => {
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)) }));
    persist(get());
  },
  deleteNote: (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    persist(get());
  },

  addCollection: () => {
    const s = get();
    const c: Collection = { id: uid(), name: 'Новая коллекция', icon: '🗂️', fields: [{ id: 'f_' + uid(), name: 'Название', type: 'text' }], items: [] };
    set({ collections: s.collections.concat([c]) });
    persist(get());
    return c;
  },
  renameCollection: (id, name) => {
    set((s) => ({ collections: s.collections.map((c) => (c.id === id ? { ...c, name } : c)) }));
    persist(get());
  },
  deleteCollection: (id) => {
    set((s) => ({ collections: s.collections.filter((c) => c.id !== id) }));
    persist(get());
  },
  addCollectionField: (collectionId, name, type) => {
    set((s) => ({
      collections: s.collections.map((c) => (c.id !== collectionId ? c : { ...c, fields: c.fields.concat([{ id: 'f_' + uid(), name, type }]) })),
    }));
    persist(get());
  },
  addCollectionRow: (collectionId) => {
    set((s) => ({
      collections: s.collections.map((c) => (c.id !== collectionId ? c : { ...c, items: c.items.concat([{ id: uid(), values: {} } as CollectionItem]) })),
    }));
    persist(get());
  },
  updateCollectionCell: (collectionId, itemId, fieldId, value) => {
    set((s) => ({
      collections: s.collections.map((c) => (c.id !== collectionId ? c : {
        ...c,
        items: c.items.map((it) => (it.id !== itemId ? it : { ...it, values: { ...it.values, [fieldId]: value } })),
      })),
    }));
    persist(get());
  },
  deleteCollectionRow: (collectionId, itemId) => {
    set((s) => ({
      collections: s.collections.map((c) => (c.id !== collectionId ? c : { ...c, items: c.items.filter((it) => it.id !== itemId) })),
    }));
    persist(get());
  },

  setView: (v) => { set({ view: v }); persist(get()); },
  step: (dir) => {
    const s = get();
    if (s.view === 'day2') set({ anchor: addDays(s.anchor, dir * 2) });
    else if (s.view === 'week') set({ anchor: addDays(s.anchor, dir * 7) });
    else { const d = parseDate(s.anchor); d.setMonth(d.getMonth() + dir); set({ anchor: fmtDate(d) }); }
    persist(get());
  },
  goToday: () => { set({ anchor: today() }); persist(get()); },
  setAnchor: (date) => { set({ anchor: date }); persist(get()); },
  setLoadMode: (m) => { set({ loadMode: m }); persist(get()); },
  toggleTheme: () => { set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })); persist(get()); },
  toggleLang: () => { set((s) => ({ lang: s.lang === 'ru' ? 'en' : 'ru' })); persist(get()); },
}));
