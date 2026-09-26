// src/utils/machine.ts
// Utilidades del dominio — lógica pura (sin React ni almacenamiento).

import { COLORS } from '../theme';
import type { Item, MachineStatus } from '../types';

interface StatusMeta {
  label: string;
  color: string;
}

export const MACHINE_STATUS: Record<MachineStatus, StatusMeta> = {
  operativa: { label: 'Operativa', color: COLORS.success },
  stock_bajo: { label: 'Stock bajo', color: COLORS.warning },
  agotada: { label: 'Agotada', color: COLORS.error },
};

/**
 * El estado NO viene de la API: se deriva del stock cargado.
 * Regla del negocio: 0 unidades → agotada, ≤ 5 → stock bajo, resto → operativa.
 */
export function getMachineStatus(stock: number): MachineStatus {
  if (stock <= 0) return 'agotada';
  if (stock <= 5) return 'stock_bajo';
  return 'operativa';
}

/** Formatea pesos colombianos sin depender de Intl: 2500 → "$2.500,00" */
export function formatCop(value: number): string {
  const [entera, decimales] = value.toFixed(2).split('.');
  return `$${entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimales}`;
}

/** "VM-014 · Snacks Torre C" → "14" · si no hay código, la inicial. */
export function getMachineCode(name: string): string {
  const match = /([A-Z]{2})-(\d+)/i.exec(name);
  if (match) return match[2];
  return name.charAt(0).toUpperCase();
}

// ─────────────────────────────────────────────────────────────
// Orden y filtro de la lista — se aplican las preferencias MMKV
// ─────────────────────────────────────────────────────────────

export type SortOrder = 'asc' | 'desc';

export interface ListPreferences {
  sortOrder: SortOrder;
  /** Mostrar solo máquinas que necesitan recarga (stock bajo o agotadas) */
  lowStockOnly: boolean;
  /** 0 = mostrar todas */
  itemsPerPage: number;
}

export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 0] as const;

/**
 * Aplica filtro por stock, orden y límite de la lista.
 * Es una función pura: mismas entradas → mismas salidas (se prueba en Node).
 */
export function sortAndFilterMachines(
  machines: Item[],
  { sortOrder, lowStockOnly, itemsPerPage }: ListPreferences
): Item[] {
  const filtered = lowStockOnly
    ? machines.filter((machine) => getMachineStatus(machine.stock) !== 'operativa')
    : machines;

  const sorted = [...filtered].sort((a, b) =>
    sortOrder === 'asc'
      ? a.name.localeCompare(b.name, 'es')
      : b.name.localeCompare(a.name, 'es')
  );

  return itemsPerPage > 0 ? sorted.slice(0, itemsPerPage) : sorted;
}