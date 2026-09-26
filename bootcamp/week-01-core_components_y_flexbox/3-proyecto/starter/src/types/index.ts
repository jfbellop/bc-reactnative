// ============================================================
// TYPES — src/types/index.ts
// ============================================================
// Dominio: Máquinas Expendedoras
// ============================================================

import type { ImageSourcePropType } from 'react-native';

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
  /**
   * Admite las dos formas de <Image>:
   *   · require('../../assets/vm-001.jpg')  → número de módulo (foto local)
   *   · { uri: 'https://…' }               → imagen remota
   */
  imageUri: ImageSourcePropType;
  subtitle: string; // usado como ubicación corta de la máquina
  category: MachineCategory;
  location: string;
  status: MachineStatus;
  capacity: number;
  currentStock: number;
  dailyRevenue: number;
}