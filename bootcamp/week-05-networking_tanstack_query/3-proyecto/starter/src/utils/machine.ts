// src/utils/machine.ts
// Helpers de presentación del dominio: color/icono por estado y formato de pesos.

import { COLORS } from '../theme';
import type { MachineCategory, MachineStatus } from '../types';

/** Color del badge según el estado de la máquina. */
export const STATUS_COLORS: Record<MachineStatus, string> = {
  Operativa: COLORS.success,
  'Stock bajo': COLORS.warning,
  Agotada: COLORS.error,
  'En mantenimiento': COLORS.accent,
};

/** Icono que identifica la categoría en la tarjeta. */
export const CATEGORY_ICONS: Record<MachineCategory, string> = {
  Snacks: '🍫',
  Bebidas: '🥤',
  'Café': '☕',
  Mixta: '🍱',
  Saludable: '🥗',
};

/**
 * Formatea la tarifa en pesos colombianos sin depender de Intl
 * (Hermes no siempre lo expone): 2500 → "$2.500"
 */
export function formatCop(value: number): string {
  const entero = Math.round(value);
  return `$${String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/** Porcentaje de carga de la máquina (0–100). */
export function fillPercent(stock: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((stock / capacity) * 100)));
}