// src/data/machines.ts
// Dominio: Máquinas Expendedoras (VendCorp) — inventario base de la semana 09.
// Los mismos 12 equipos de las semanas 06–08, con stock y capacidad para poder
// calcular el nivel de carga que animan las ProgressBar.

import type { Machine } from '../types';

export const MACHINES_SEED: Machine[] = [
  { id: '1',  code: 'VM-001', name: 'Snacks Recepción',        zone: 'Torre A', location: 'Piso 1, junto a recepción',     stock: 42, capacity: 60, price: 2500, lastRefill: '2026-09-18' },
  { id: '2',  code: 'VM-002', name: 'Bebidas Frías Cafetería', zone: 'Torre A', location: 'Piso 2, cafetería principal',    stock: 18, capacity: 48, price: 3200, lastRefill: '2026-09-20' },
  { id: '3',  code: 'VM-003', name: 'Café Express',            zone: 'Torre A', location: 'Piso 3, zona de descanso',       stock: 4,  capacity: 40, price: 1800, lastRefill: '2026-09-12' },
  { id: '4',  code: 'VM-004', name: 'Snacks Sala de Juntas',   zone: 'Torre B', location: 'Piso 4, pasillo de salas',       stock: 0,  capacity: 55, price: 2500, lastRefill: '2026-09-10' },
  { id: '5',  code: 'VM-005', name: 'Mixta Laboratorio',       zone: 'Torre B', location: 'Piso 6, laboratorio de calidad', stock: 27, capacity: 50, price: 2800, lastRefill: '2026-09-19' },
  { id: '6',  code: 'VM-006', name: 'Bebidas Calientes',       zone: 'Torre C', location: 'Piso 1, lobby lateral',          stock: 33, capacity: 40, price: 2000, lastRefill: '2026-09-21' },
  { id: '7',  code: 'VM-007', name: 'Snacks Data Center',      zone: 'Torre C', location: 'Piso 2, antesala data center',   stock: 5,  capacity: 45, price: 2600, lastRefill: '2026-09-15' },
  { id: '8',  code: 'VM-008', name: 'Sándwiches y Jugos',      zone: 'Torre C', location: 'Piso 3, junto a la cafetería',   stock: 12, capacity: 36, price: 4500, lastRefill: '2026-09-22' },
  { id: '9',  code: 'VM-009', name: 'Dulces Visitantes',       zone: 'Torre B', location: 'Lobby principal',                stock: 56, capacity: 70, price: 1500, lastRefill: '2026-09-23' },
  { id: '10', code: 'VM-010', name: 'Café y Snacks',           zone: 'Planta',  location: 'Piso 5, sala de espera',         stock: 3,  capacity: 44, price: 2200, lastRefill: '2026-09-11' },
  { id: '11', code: 'VM-011', name: 'Bebidas Gimnasio',        zone: 'Planta',  location: 'Sede Norte, gimnasio',           stock: 24, capacity: 48, price: 3500, lastRefill: '2026-09-20' },
  { id: '12', code: 'VM-012', name: 'Mixta Comedor',           zone: 'Planta',  location: 'Comedor de producción',          stock: 0,  capacity: 60, price: 2700, lastRefill: '2026-09-09' },
];

/** Datos de la máquina que se registra desde el botón "+ Registrar máquina". */
export function createNextMachine(index: number): Machine {
  const zone: Machine['zone'] = (['Torre A', 'Torre B', 'Torre C', 'Planta'] as const)[index % 4];
  const serial = String(MACHINES_SEED.length + index + 1).padStart(3, '0');

  return {
    id: `nueva-${serial}`,
    code: `VM-${serial}`,
    name: `Máquina nueva ${serial}`,
    zone,
    location: `${zone} — pendiente de ubicación`,
    stock: 0,
    capacity: 40,
    price: 2000,
    lastRefill: 'Sin recarga',
  };
}