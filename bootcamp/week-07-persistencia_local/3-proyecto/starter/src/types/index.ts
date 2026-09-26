// src/types/index.ts
// Dominio: Máquinas Expendedoras (VendCorp)

export interface Item {
  id: number;
  /** Nombre o código de la máquina. Ej: "VM-014 · Snacks Torre C" */
  name: string;
  /** Ubicación y notas de operación */
  description: string;
  /** Tarifa por producto en COP */
  price: number;
  /** Unidades cargadas en la máquina (0-200) */
  stock: number;
}

export type CreateItemPayload = Omit<Item, 'id'>;

export interface UpdateItemPayload extends CreateItemPayload {
  id: number;
}

/** Estado operativo DERIVADO del stock (no viene de la API) */
export type MachineStatus = 'operativa' | 'stock_bajo' | 'agotada';

/**
 * Resultado de la lista para la UI: incluye de dónde vinieron los datos.
 * `source === 'cache'` es lo que activa el banner de "sin conexión".
 */
export interface MachinesWithSource {
  items: Item[];
  source: 'network' | 'cache';
  /** Momento en que se guardó la caché que se está mostrando */
  cachedAt?: number;
}