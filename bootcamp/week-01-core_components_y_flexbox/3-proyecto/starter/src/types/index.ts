// ============================================================
// TYPES — src/types/index.ts
// ============================================================
// Dominio: Máquinas Expendedoras
// ============================================================

export type MachineCategory =
  | 'Snacks'
  | 'Bebidas'
  | 'Café'
  | 'Mixta'
  | 'Saludable';

export type MachineStatus =
  | 'Operativa'
  | 'Stock Bajo'
  | 'Mantenimiento'
  | 'Fuera de Servicio';

export interface VendingMachine {
  id: string;
  name: string;
  imageUri: string;
  subtitle: string; // usado como ubicación corta de la máquina
  category: MachineCategory;
  location: string;
  status: MachineStatus;
  capacity: number;
  currentStock: number;
  dailyRevenue: number;
}