// src/types/index.ts
// Dominio: Máquinas Expendedoras (VendCorp)
//
// `Item` representa una máquina expendedora del inventario. Mantenemos el
// nombre genérico `Item` que usa el starter de la semana para no romper la
// estructura del proyecto; los CAMPOS sí son 100% del dominio.

export interface Item {
  id: number;
  /** Nombre o código de la máquina. Ej: "VM-014 · Snacks Torre C" */
  name: string;
  /** Ubicación y notas de operación. Ej: "Torre C — Piso 3, junto a cafetería" */
  description: string;
  /** Tarifa por producto en COP. Número real (no string). */
  price: number;
  /** Unidades cargadas en la máquina. Entero >= 0. */
  stock: number;
}

// Payload para crear una máquina (sin id — lo asigna el servidor)
export type CreateItemPayload = Omit<Item, 'id'>;

// Payload para actualizar (id requerido + campos editables)
export interface UpdateItemPayload extends CreateItemPayload {
  id: number;
}

// Estado operativo DERIVADO del stock (no viene de la API, se calcula)
export type MachineStatus = 'operativa' | 'stock_bajo' | 'agotada';