// src/types/index.ts
// Dominio: Máquinas Expendedoras (VendCorp)

/** Familia de productos que carga la máquina */
export type MachineCategory =
  | 'Snacks'
  | 'Bebidas'
  | 'Café'
  | 'Mixta'
  | 'Saludable';

/** Estado operativo de la máquina */
export type MachineStatus =
  | 'Operativa'
  | 'Stock bajo'
  | 'Agotada'
  | 'En mantenimiento';

/** Modelo principal que viaja entre la API y las pantallas. */
export interface Item {
  id: string | number;
  /** Código visible de la máquina. Ej: VM-001 */
  code: string;
  /** Nombre corto para la lista. Ej: "Snacks Recepción" */
  name: string;
  /** Ubicación física. Ej: "Torre A · Piso 1" */
  location: string;
  category: MachineCategory;
  status: MachineStatus;
  /** Tarifa por producto en pesos colombianos */
  price: number;
  /** Unidades cargadas actualmente */
  stock: number;
  /** Capacidad máxima de la máquina */
  capacity: number;
  /** Notas de reposición o mantenimiento */
  description?: string;
}

/** Lo que se envía en el POST para registrar una máquina nueva. */
export interface CreateItemPayload {
  name: string;
  location: string;
  category: MachineCategory;
  status: MachineStatus;
  price: number;
  stock: number;
  description?: string;
}

// Opciones para los selectores de la pantalla de creación.
export const MACHINE_CATEGORIES: readonly MachineCategory[] = [
  'Snacks',
  'Bebidas',
  'Café',
  'Mixta',
  'Saludable',
];

export const MACHINE_STATUSES: readonly MachineStatus[] = [
  'Operativa',
  'Stock bajo',
  'Agotada',
  'En mantenimiento',
];