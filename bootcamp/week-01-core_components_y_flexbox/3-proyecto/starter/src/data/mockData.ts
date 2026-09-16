// ============================================================
// MOCK DATA — src/data/mockData.ts
// ============================================================
// Dominio: Máquinas Expendedoras
// ============================================================

import { VendingMachine } from '../types';

export const MOCK_ITEMS: VendingMachine[] = [
  {
    id: '1',
    name: 'Expendedora Snacks — Edificio A',
    subtitle: 'Torre A, Piso 3',
    imageUri: 'https://picsum.photos/seed/vending1/300/200',
    category: 'Snacks',
    location: 'Torre A, Piso 3, junto a cafetería',
    status: 'Operativa',
    capacity: 60,
    currentStock: 52,
    dailyRevenue: 185000,
  },
  {
    id: '2',
    name: 'Expendedora Bebidas — Lobby',
    subtitle: 'Lobby Principal',
    imageUri: 'https://picsum.photos/seed/vending2/300/200',
    category: 'Bebidas',
    location: 'Lobby Principal, Recepción',
    status: 'Stock Bajo',
    capacity: 80,
    currentStock: 14,
    dailyRevenue: 220000,
  },
  {
    id: '3',
    name: 'Café Express — Sala de Juntas',
    subtitle: 'Piso 5',
    imageUri: 'https://picsum.photos/seed/vending3/300/200',
    category: 'Café',
    location: 'Piso 5, Zona de Salas de Juntas',
    status: 'Fuera de Servicio',
    capacity: 40,
    currentStock: 0,
    dailyRevenue: 0,
  },
  {
    id: '4',
    name: 'Opciones Saludables — Gimnasio',
    subtitle: 'Piso 1',
    imageUri: 'https://picsum.photos/seed/vending4/300/200',
    category: 'Saludable',
    location: 'Piso 1, Gimnasio Corporativo',
    status: 'Operativa',
    capacity: 45,
    currentStock: 38,
    dailyRevenue: 96000,
  },
];