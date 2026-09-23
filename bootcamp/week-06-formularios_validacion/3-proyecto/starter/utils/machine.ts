// src/utils/machine.ts
// Utilidades del dominio: estado operativo y formato de moneda (COP).

import { COLORS } from '../theme';
import type { MachineStatus } from '../types';

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

/**
 * Formatea un número como pesos colombianos sin depender de Intl
 * (Hermes no siempre expone Intl.NumberFormat en Android):
 * 2500 → "$2.500,00"
 */
export function formatCop(value: number): string {
  const [entera, decimales] = value.toFixed(2).split('.');
  return `$${entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimales}`;
}
