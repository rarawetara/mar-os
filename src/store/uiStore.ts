import { create } from 'zustand';

export type Overlay = 'settings' | 'card' | 'project' | 'notes' | 'library' | null;

interface UIState {
  overlay: Overlay;
  editingItemId: string | null;   // item open in the task card modal, or 'new'
  quickAddDate: string | null;    // prefilled date for the quick-add popover
  quickAddStart: number | null;   // prefilled start minute for the quick-add popover
  activeProjectId: string | null; // project shown in the drawer
  activeCollectionId: string | null;
  draggingItemId: string | null;

  openQuickAdd: (date?: string | null, start?: number | null) => void;
  openCard: (itemId: string | 'new') => void;
  openSettings: () => void;
  openProject: (id: string) => void;
  openNotes: () => void;
  openLibrary: () => void;
  close: () => void;
  setDragging: (id: string | null) => void;
  setActiveCollection: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  overlay: null,
  editingItemId: null,
  quickAddDate: null,
  quickAddStart: null,
  activeProjectId: null,
  activeCollectionId: null,
  draggingItemId: null,

  openQuickAdd: (date = null, start = null) => set({ overlay: 'card', editingItemId: 'new', quickAddDate: date, quickAddStart: start }),
  openCard: (itemId) => set({ overlay: 'card', editingItemId: itemId }),
  openSettings: () => set({ overlay: 'settings' }),
  openProject: (id) => set({ overlay: 'project', activeProjectId: id }),
  openNotes: () => set({ overlay: 'notes' }),
  openLibrary: () => set({ overlay: 'library' }),
  close: () => set({ overlay: null, editingItemId: null }),
  setDragging: (id) => set({ draggingItemId: id }),
  setActiveCollection: (id) => set({ activeCollectionId: id }),
}));
