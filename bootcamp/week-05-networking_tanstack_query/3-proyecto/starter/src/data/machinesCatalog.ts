// src/data/machinesCatalog.ts
// Dominio: Máquinas Expendedoras (VendCorp)
//
// Catálogo de las máquinas que se muestran en la app.
// La API de práctica (JSONPlaceholder) no tiene datos de nuestro dominio,
// así que trae los 15 registros y aquí les inyectamos el contenido real
// en español (ver src/hooks/useItems.ts).

import type { Item } from '../types';

export const MACHINE_CATALOG: Item[] = [
  {
    id: 1,
    code: 'VM-001',
    name: 'Snacks Recepción',
    location: 'Torre A · Piso 1',
    category: 'Snacks',
    status: 'Operativa',
    price: 2500,
    stock: 42,
    capacity: 60,
    description:
      'Máquina de 6 bandejas con snacks salados y dulces. Reposición los lunes y jueves a las 7:00 a.m.',
  },
  {
    id: 2,
    code: 'VM-002',
    name: 'Bebidas Frías Cafetería',
    location: 'Torre A · Piso 2',
    category: 'Bebidas',
    status: 'Operativa',
    price: 3200,
    stock: 18,
    capacity: 48,
    description:
      'Refrigerada a 4 °C. Aguas, gaseosas y jugos personales. Revisión de temperatura diaria a las 6:30 a.m.',
  },
  {
    id: 3,
    code: 'VM-003',
    name: 'Café Express',
    location: 'Torre A · Piso 3',
    category: 'Café',
    status: 'Stock bajo',
    price: 1800,
    stock: 4,
    capacity: 40,
    description:
      'Café molido y cápsulas. Consumo alto en la mañana: programar reposición antes de las 9:00 a.m.',
  },
  {
    id: 4,
    code: 'VM-004',
    name: 'Snacks Sala de Juntas',
    location: 'Torre B · Piso 4',
    category: 'Snacks',
    status: 'Agotada',
    price: 2500,
    stock: 0,
    capacity: 55,
    description:
      'Se agotó el viernes tras la jornada de capacitaciones. Reposición urgente solicitada al proveedor.',
  },
  {
    id: 5,
    code: 'VM-005',
    name: 'Mixta Laboratorio',
    location: 'Torre B · Piso 6',
    category: 'Mixta',
    status: 'Operativa',
    price: 2800,
    stock: 27,
    capacity: 50,
    description:
      'Combina snacks y bebidas. Personal de laboratorio usa tarjeta corporativa para el pago.',
  },
  {
    id: 6,
    code: 'VM-006',
    name: 'Bebidas Calientes',
    location: 'Torre C · Piso 1',
    category: 'Bebidas',
    status: 'En mantenimiento',
    price: 2000,
    stock: 12,
    capacity: 40,
    description:
      'Resistencia de calentamiento en revisión. Ticket #4472 abierto con el proveedor, visita el miércoles.',
  },
  {
    id: 7,
    code: 'VM-007',
    name: 'Snacks Data Center',
    location: 'Torre C · Piso 2',
    category: 'Snacks',
    status: 'Stock bajo',
    price: 2600,
    stock: 5,
    capacity: 45,
    description:
      'Zona de acceso restringido: la reposición requiere acompañamiento del jefe de infraestructura.',
  },
  {
    id: 8,
    code: 'VM-008',
    name: 'Sándwiches y Jugos',
    location: 'Torre C · Piso 3',
    category: 'Saludable',
    status: 'Operativa',
    price: 4500,
    stock: 12,
    capacity: 36,
    description:
      'Productos frescos con vencimiento corto (3 días). Revisar fechas antes de cada reposición.',
  },
  {
    id: 9,
    code: 'VM-009',
    name: 'Dulces Visitantes',
    location: 'Torre A · Lobby',
    category: 'Snacks',
    status: 'Operativa',
    price: 1500,
    stock: 56,
    capacity: 70,
    description:
      'Máquina de mayor rotación con visitantes. Se recauda en efectivo, revisión de monedero cada 15 días.',
  },
  {
    id: 10,
    code: 'VM-010',
    name: 'Café y Snacks',
    location: 'Torre B · Piso 5',
    category: 'Café',
    status: 'Agotada',
    price: 2200,
    stock: 0,
    capacity: 44,
    description:
      'Sin producto desde el martes. El proveedor confirmó despacho para el jueves en la mañana.',
  },
  {
    id: 11,
    code: 'VM-011',
    name: 'Bebidas Gimnasio',
    location: 'Sede Norte · Gimnasio',
    category: 'Bebidas',
    status: 'Operativa',
    price: 3500,
    stock: 24,
    capacity: 48,
    description:
      'Bebidas isotónicas y energizantes. Pico de consumo entre 6:00 p.m. y 8:00 p.m.',
  },
  {
    id: 12,
    code: 'VM-012',
    name: 'Mixta Comedor',
    location: 'Planta · Comedor',
    category: 'Mixta',
    status: 'En mantenimiento',
    price: 2700,
    stock: 8,
    capacity: 60,
    description:
      'Lector de tarjeta sin respuesta. Se habilita el pago por app mientras llega el repuesto.',
  },
  {
    id: 13,
    code: 'VM-013',
    name: 'Snacks Biblioteca',
    location: 'Sede Norte · Biblioteca',
    category: 'Snacks',
    status: 'Operativa',
    price: 2400,
    stock: 33,
    capacity: 50,
    description:
      'Ambiente silencioso: el motor de despacho tiene atenuador de sonido instalado.',
  },
  {
    id: 14,
    code: 'VM-014',
    name: 'Café Recepción Sur',
    location: 'Sede Sur · Recepción',
    category: 'Café',
    status: 'Operativa',
    price: 1900,
    stock: 21,
    capacity: 40,
    description:
      'Café en vaso de 7 oz. Incluye servicio de agua caliente gratuita para el personal.',
  },
  {
    id: 15,
    code: 'VM-015',
    name: 'Saludable Parqueadero',
    location: 'Planta · Parqueadero',
    category: 'Saludable',
    status: 'Stock bajo',
    price: 4200,
    stock: 6,
    capacity: 30,
    description:
      'Fruta, granolas y barras de cereal. Reposición diaria antes de las 6:00 a.m.',
  },
];

// ============================================================
// Máquinas registradas en esta sesión
// JSONPlaceholder acepta el POST pero no guarda nada, así que
// conservamos en memoria lo creado para que aparezca en la lista.
// ============================================================

const sessionMachines: Item[] = [];

export function getSessionMachines(): Item[] {
  return sessionMachines;
}

export function addSessionMachine(machine: Item): void {
  sessionMachines.unshift(machine);
}

/** Genera el siguiente código libre: VM-016, VM-017, … */
export function nextMachineCode(): string {
  const used = MACHINE_CATALOG.length + sessionMachines.length + 1;
  return `VM-${String(used).padStart(3, '0')}`;
}