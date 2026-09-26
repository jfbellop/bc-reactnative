// src/utils/machine.ts
// Lógica pura del dominio (sin React ni animaciones) — se prueba con Node.

import type { InventorySummary, Machine, MachineMetrics, MachineStatus } from '../types';

/** Regla del negocio: 0 → agotada · ≤ 5 → stock bajo · resto → operativa. */
export function getMachineStatus(stock: number): MachineStatus {
  if (stock <= 0) return 'agotada';
  if (stock <= 5) return 'stock_bajo';
  return 'operativa';
}

/** Nivel de carga 0–1: es el valor que animan las ProgressBar. */
export function getFill(machine: Machine): number {
  if (machine.capacity <= 0) return 0;
  return Math.max(0, Math.min(1, machine.stock / machine.capacity));
}

/** Carga promedio de toda la flota (0–1) para la barra del encabezado. */
export function getAverageFill(machines: Machine[]): number {
  if (machines.length === 0) return 0;
  const total = machines.reduce((acc, machine) => acc + getFill(machine), 0);
  return total / machines.length;
}

export function buildSummary(machines: Machine[]): InventorySummary {
  let outOfStock = 0;
  let lowStock = 0;

  machines.forEach((machine) => {
    const status = getMachineStatus(machine.stock);
    if (status === 'agotada') outOfStock += 1;
    else if (status === 'stock_bajo') lowStock += 1;
  });

  return {
    machines: machines.length,
    outOfStock,
    lowStock,
    averageFill: getAverageFill(machines),
  };
}

/** Ordena por urgencia: agotadas → stock bajo → operativas (y por código). */
export function sortByUrgency(machines: Machine[]): Machine[] {
  const weight: Record<MachineStatus, number> = { agotada: 0, stock_bajo: 1, operativa: 2 };
  return [...machines].sort((a, b) => {
    const diff = weight[getMachineStatus(a.stock)] - weight[getMachineStatus(b.stock)];
    return diff !== 0 ? diff : a.code.localeCompare(b.code);
  });
}

/** Métricas derivadas que alimentan la pantalla de detalle. */
export function getMetrics(machine: Machine, dailyUse = 6): MachineMetrics {
  const unitsMissing = Math.max(0, machine.capacity - machine.stock);
  return {
    fill: getFill(machine),
    status: getMachineStatus(machine.stock),
    unitsMissing,
    dailyUse,
    daysToEmpty: dailyUse > 0 ? Math.floor(machine.stock / dailyUse) : 0,
  };
}

/** Formatea pesos colombianos sin depender de Intl: 2500 → "$2.500,00" */
export function formatCop(value: number): string {
  const [entera, decimales] = value.toFixed(2).split('.');
  return `$${entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimales}`;
}

/** Texto de estado para los badges. */
export const STATUS_LABEL: Record<MachineStatus, string> = {
  operativa: 'Operativa',
  stock_bajo: 'Stock bajo',
  agotada: 'Agotada',
};

/** Color por estado (se comparte entre badge y barra de progreso). */
export const STATUS_COLOR: Record<MachineStatus, string> = {
  operativa: '#22c55e',
  stock_bajo: '#facc15',
  agotada: '#ef4444',
};