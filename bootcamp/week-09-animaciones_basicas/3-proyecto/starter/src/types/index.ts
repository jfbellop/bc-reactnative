// src/types/index.ts
// Dominio: Máquinas Expendedoras (VendCorp) · Semana 09 — Animaciones

export type MachineStatus = 'operativa' | 'stock_bajo' | 'agotada';

export type Zone = 'Torre A' | 'Torre B' | 'Torre C' | 'Planta';

export interface Machine {
  id: string;
  /** Código visible: VM-001 */
  code: string;
  name: string;
  zone: Zone;
  location: string;
  /** Unidades que quedan de la carga */
  stock: number;
  /** Capacidad máxima de la máquina */
  capacity: number;
  /** Precio por producto en COP */
  price: number;
  lastRefill: string;
}

/** Resumen que se muestra animado en el encabezado del inventario. */
export interface InventorySummary {
  machines: number;
  outOfStock: number;
  lowStock: number;
  /** Carga promedio de la flota: 0–1 (alimenta la ProgressBar) */
  averageFill: number;
}

/** Datos que necesita la pantalla de detalle (incluye métricas derivadas). */
export interface MachineMetrics {
  fill: number;
  status: MachineStatus;
  unitsMissing: number;
  dailyUse: number;
  daysToEmpty: number;
}