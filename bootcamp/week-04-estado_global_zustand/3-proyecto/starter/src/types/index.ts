// src/types/index.ts
// Dominio: Máquinas Expendedoras

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

export interface Item {
  id: string;
  name: string;
  description: string;
  category: MachineCategory;
  location: string;
  status: MachineStatus;
  capacity: number;
  currentStock: number;
  dailyRevenue: number;
}