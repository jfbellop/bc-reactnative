// src/services/machinesApi.ts
// Contrato que cumplen los adaptadores de datos (local / remoto).

import type { CreateItemPayload, Item, UpdateItemPayload } from '../types';

export interface MachinesApi {
  list(): Promise<Item[]>;
  getById(id: number): Promise<Item>;
  create(payload: CreateItemPayload): Promise<Item>;
  update(payload: UpdateItemPayload): Promise<Item>;
}