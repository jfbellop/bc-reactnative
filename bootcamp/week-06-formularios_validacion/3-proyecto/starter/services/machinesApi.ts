// src/services/machinesApi.ts
// Contrato (interfaz) que deben cumplir los adaptadores de datos.
//
// Tener esta interfaz separada permite cambiar la fuente de datos sin tocar
// los hooks ni las pantallas: localApi (datos del dominio) ↔ remoteApi (HTTP).
// Es el patrón "adaptador/repositorio" aplicado a la semana de networking.

import type { CreateItemPayload, Item, UpdateItemPayload } from '../types';

export interface MachinesApi {
  /** GET /machines */
  list(): Promise<Item[]>;
  /** GET /machines/:id */
  getById(id: number): Promise<Item>;
  /** POST /machines */
  create(payload: CreateItemPayload): Promise<Item>;
  /** PUT /machines/:id */
  update(payload: UpdateItemPayload): Promise<Item>;
}