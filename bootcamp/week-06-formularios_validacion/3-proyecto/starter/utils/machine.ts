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

/**
 * Extrae el código de la máquina del nombre para mostrarlo en el avatar.
 * "VM-014 · Snacks Torre C" → "14" · si no hay código, la inicial del nombre.
 */
export function getMachineCode(name: string): string {
  const match = /([A-Z]{2})-(\d+)/i.exec(name);
  if (match) return match[2];
  return name.charAt(0).toUpperCase();
}