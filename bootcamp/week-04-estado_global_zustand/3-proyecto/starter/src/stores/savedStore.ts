// src/stores/savedStore.ts
// Store Zustand: máquinas expendedoras marcadas como "favoritas/guardadas".

import { create } from 'zustand';
import type { Item } from '../types';

interface SavedStore {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  isItemSaved: (id: string) => boolean;
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    const alreadySaved = get().items.some((i) => i.id === item.id);
    if (alreadySaved) return;
    set((state) => ({ items: [...state.items, item] }));
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  clearAll: () => {
    set({ items: [] });
  },

  isItemSaved: (id) => {
    return get().items.some((i) => i.id === id);
  },
}));