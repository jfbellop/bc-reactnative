// src/types/index.ts
// Dominio: Máquinas Expendedoras
// Usamos JSONPlaceholder como proxy de API real; mapeamos sus campos
// (title/body) a los nuestros (name/description) en los hooks.

export interface Item {
  id: string | number;
  name: string;
  description?: string;
}

// Lo que se envía en el POST para crear un nuevo ítem.
export type CreateItemPayload = Omit<Item, 'id'>;