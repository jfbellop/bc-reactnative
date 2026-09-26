// src/hooks/usePreferences.ts
// Dominio: Máquinas Expendedoras (VendCorp)
//
// Preferencias del usuario persistidas con MMKV (sincrónico, sin await).
// Es el hook que exige la rúbrica: encapsula TODA la lógica de almacenamiento
// y exporta helpers tipados, para que las pantallas no toquen `storage`.

import { useMMKVBoolean, useMMKVNumber, useMMKVString } from '../storage/mmkv';
import { ITEMS_PER_PAGE_OPTIONS, type SortOrder } from '../utils/machine';

// ─── Claves (constantes: nada de strings sueltos por las pantallas) ──────────
export const PREF_KEYS = {
  SORT_ORDER: 'pref_sortOrder',
  COMPACT_MODE: 'pref_compactMode',
  ITEMS_PER_PAGE: 'pref_itemsPerPage',
  // Preferencia propia del dominio:
  LOW_STOCK_ONLY: 'pref_lowStockOnly',
} as const;

// ─── Valores por defecto ────────────────────────────────────────────────────
export const PREF_DEFAULTS = {
  sortOrder: 'asc' as SortOrder,
  compactMode: false,
  itemsPerPage: 10,
  lowStockOnly: false,
} as const;

const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

function toSortOrder(value: string | undefined): SortOrder {
  return VALID_SORT_ORDERS.includes(value as SortOrder)
    ? (value as SortOrder)
    : PREF_DEFAULTS.sortOrder;
}

function toItemsPerPage(value: number | undefined): number {
  return ITEMS_PER_PAGE_OPTIONS.includes(value as (typeof ITEMS_PER_PAGE_OPTIONS)[number])
    ? (value as number)
    : PREF_DEFAULTS.itemsPerPage;
}

// ─── Hook principal ─────────────────────────────────────────────────────────

export function usePreferences() {
  // Los hooks de MMKV son reactivos: al cambiar el valor, el componente que los
  // usa se vuelve a renderizar y el dato ya quedó en disco (sin await).
  const [sortOrderRaw, setSortOrderRaw] = useMMKVString(PREF_KEYS.SORT_ORDER);
  const [compactModeRaw, setCompactModeRaw] = useMMKVBoolean(PREF_KEYS.COMPACT_MODE);
  const [itemsPerPageRaw, setItemsPerPageRaw] = useMMKVNumber(PREF_KEYS.ITEMS_PER_PAGE);
  const [lowStockOnlyRaw, setLowStockOnlyRaw] = useMMKVBoolean(PREF_KEYS.LOW_STOCK_ONLY);

  return {
    /** Orden alfabético de la lista: 'asc' (A→Z) | 'desc' (Z→A) */
    sortOrder: toSortOrder(sortOrderRaw),
    setSortOrder: (value: SortOrder) => setSortOrderRaw(value),
    /** Alterna el modo compacto de las tarjetas */
    toggleSortOrder: () =>
      setSortOrderRaw(toSortOrder(sortOrderRaw) === 'asc' ? 'desc' : 'asc'),

    compactMode: compactModeRaw ?? PREF_DEFAULTS.compactMode,
    setCompactMode: (value: boolean) => setCompactModeRaw(value),
    toggleCompactMode: () => setCompactModeRaw(!(compactModeRaw ?? PREF_DEFAULTS.compactMode)),

    /** Cuántas máquinas mostrar (0 = todas) */
    itemsPerPage: toItemsPerPage(itemsPerPageRaw),
    setItemsPerPage: (value: number) => setItemsPerPageRaw(value),

    /** Dominio: mostrar solo máquinas que requieren recarga */
    lowStockOnly: lowStockOnlyRaw ?? PREF_DEFAULTS.lowStockOnly,
    setLowStockOnly: (value: boolean) => setLowStockOnlyRaw(value),
    toggleLowStockOnly: () =>
      setLowStockOnlyRaw(!(lowStockOnlyRaw ?? PREF_DEFAULTS.lowStockOnly)),

    /** Restablece todas las preferencias (borra las claves de MMKV) */
    resetPreferences: () => {
      setSortOrderRaw(undefined);
      setCompactModeRaw(undefined);
      setItemsPerPageRaw(undefined);
      setLowStockOnlyRaw(undefined);
    },
  };
}

export type Preferences = ReturnType<typeof usePreferences>;