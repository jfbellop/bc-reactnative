// src/hooks/useItems.ts
// Dominio: Máquinas Expendedoras (VendCorp)
// TanStack Query + CACHÉ OFFLINE con AsyncStorage.
//
// Estrategia (offline-first básico):
//   1. Se pide la lista al backend (adaptador local o remoto).
//   2. Si responde → se guarda en AsyncStorage y se devuelve { source: 'network' }.
//   3. Si falla  → se lee la caché de disco y se devuelve { source: 'cache' }.
//   4. Si tampoco hay caché → se propaga el error (HomeScreen muestra el estado de error).

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { machinesApi } from '../services/api';
import type {
  CreateItemPayload,
  Item,
  MachinesWithSource,
  UpdateItemPayload,
} from '../types';

// ─── Claves ─────────────────────────────────────────────────────────────────
export const ITEMS_QUERY_KEY = ['machines'] as const;
const CACHE_KEY = '@vendcorp/machines-cache';
const CACHE_META_KEY = '@vendcorp/machines-cache-meta';

interface CacheMeta {
  cachedAt: number;
}

export async function readMachinesCache(): Promise<MachinesWithSource | null> {
  const [rawItems, rawMeta] = await Promise.all([
    AsyncStorage.getItem(CACHE_KEY),
    AsyncStorage.getItem(CACHE_META_KEY),
  ]);
  if (!rawItems) return null;

  try {
    const items = JSON.parse(rawItems) as Item[];
    const meta = rawMeta ? (JSON.parse(rawMeta) as CacheMeta) : null;
    return { items, source: 'cache', cachedAt: meta?.cachedAt };
  } catch {
    // Caché corrupta: mejor descartarla que romper la app.
    await Promise.all([
      AsyncStorage.removeItem(CACHE_KEY),
      AsyncStorage.removeItem(CACHE_META_KEY),
    ]);
    return null;
  }
}

export async function writeMachinesCache(items: Item[]): Promise<void> {
  const meta: CacheMeta = { cachedAt: Date.now() };
  await Promise.all([
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(items)),
    AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(meta)),
  ]);
}

/** Borra la caché offline (botón "Borrar datos locales" en Ajustes). */
export async function clearMachinesCache(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(CACHE_KEY),
    AsyncStorage.removeItem(CACHE_META_KEY),
  ]);
}

// ─── useItems — lista con caché offline ─────────────────────────────────────

export function useItems() {
  return useQuery<MachinesWithSource>({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: async (): Promise<MachinesWithSource> => {
      try {
        const items = await machinesApi.list();
        // Red exitosa → refrescar la caché de disco.
        await writeMachinesCache(items);
        return { items, source: 'network' };
      } catch (error) {
        // Sin red → intentar la caché.
        const cached = await readMachinesCache();
        if (cached) return cached;
        throw error instanceof Error
          ? error
          : new Error('Sin red y sin caché disponible');
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── useItemById ────────────────────────────────────────────────────────────

export function useItemById(id: number | undefined) {
  return useQuery({
    queryKey: [...ITEMS_QUERY_KEY, id],
    queryFn: () => machinesApi.getById(id as number),
    enabled: id !== undefined && Number.isFinite(id),
  });
}

// ─── useCreateItem ──────────────────────────────────────────────────────────

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemPayload) => machinesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
  });
}

// ─── useUpdateItem ──────────────────────────────────────────────────────────

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateItemPayload) => machinesApi.update(payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      queryClient.setQueryData<Item>([...ITEMS_QUERY_KEY, updated.id], updated);
    },
  });
}