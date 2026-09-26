// data/machinesSeed.ts
// Dominio: Máquinas Expendedoras (VendCorp)
//
// Inventario semilla del dominio, listo para demo/defensa del proyecto.
// Estos datos vive en memoria: el adaptador local los expone como si fueran
// una API REST (ver services/localApi.ts).

import type { Item } from '../types';

export const MACHINES_SEED: Item[] = [
  {
    id: 1,
    name: 'VM-001 · Snacks Recepción',
    description: 'Torre A — Piso 1, junto a recepción',
    price: 2500,
    stock: 42,
  },
  {
    id: 2,
    name: 'VM-002 · Bebidas Frías Cafetería',
    description: 'Torre A — Piso 2, cafetería principal',
    price: 3200,
    stock: 18,
  },
  {
    id: 3,
    name: 'VM-003 · Café Express',
    description: 'Torre A — Piso 3, zona de descanso',
    price: 1800,
    stock: 4,
  },
  {
    id: 4,
    name: 'VM-004 · Snacks Sala de Juntas',
    description: 'Torre B — Piso 4, pasillo de salas',
    price: 2500,
    stock: 0,
  },
  {
    id: 5,
    name: 'VM-005 · Mixta Laboratorio',
    description: 'Torre B — Piso 6, laboratorio de calidad',
    price: 2800,
    stock: 27,
  },
  {
    id: 6,
    name: 'VM-006 · Bebidas Calientes',
    description: 'Torre C — Piso 1, lobby lateral',
    price: 2000,
    stock: 33,
  },
  {
    id: 7,
    name: 'VM-007 · Snacks Data Center',
    description: 'Torre C — Piso 2, antesala del data center',
    price: 2600,
    stock: 5,
  },
  {
    id: 8,
    name: 'VM-008 · Sándwiches y Jugos',
    description: 'Torre C — Piso 3, junto a la cafetería',
    price: 4500,
    stock: 12,
  },
  {
    id: 9,
    name: 'VM-009 · Dulces Visitantes',
    description: 'Torre D — Lobby principal',
    price: 1500,
    stock: 56,
  },
  {
    id: 10,
    name: 'VM-010 · Café y Snacks',
    description: 'Torre D — Piso 5, sala de espera',
    price: 2200,
    stock: 3,
  },
  {
    id: 11,
    name: 'VM-011 · Bebidas Gimnasio',
    description: 'Sede Norte — Gimnasio, vestieres',
    price: 3500,
    stock: 24,
  },
  {
    id: 12,
    name: 'VM-012 · Mixta Planta',
    description: 'Planta de producción — Comedor',
    price: 2700,
    stock: 0,
  },
];