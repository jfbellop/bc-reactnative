// src/services/localApi.ts
// Adaptador LOCAL — "servidor" del dominio en memoria (sin internet).
//
// Es el modo por defecto de la app: sirve el inventario VendCorp sembrado en
// src/data/machinesSeed.ts. Con este adaptador el fallback offline de
// AsyncStorage se puede probar de forma determinista (ver modo: 'offline').

import { MACHINES_SEED } from '../data/machinesSeed';
import type { CreateItemPayload, Item, UpdateItemPayload } from '../types';
import type { MachinesApi } from './machinesApi';

export type SimulatedMode = 'normal' | 'offline';

let db: Item[] = MACHINES_SEED.map((machine) => ({ ...machine }));
let simulatedMode: SimulatedMode = 'normal';

/**
 * Permite simular que no hay conexión (Home → "Sin conexión").
 * Con el modo remoto no haría falta: basta con apagar el WiFi.
 */
export function setSimulatedMode(mode: SimulatedMode): void {
  simulatedMode = mode;
  if (__DEV__) console.log(`[api] modo simulado: ${mode}`);
}

export function getSimulatedMode(): SimulatedMode {
  return simulatedMode;
}

function assertOnline(): void {
  if (simulatedMode === 'offline') {
    throw new Error('Sin conexión (modo offline simulado)');
  }
}

function delay(ms = 450): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone(machine: Item): Item {
  return { ...machine };
}

function nextId(): number {
  return db.reduce((max, machine) => Math.max(max, machine.id), 0) + 1;
}

export const localMachinesApi: MachinesApi = {
  async list(): Promise<Item[]> {
    await delay();
    assertOnline();
    return [...db].sort((a, b) => b.id - a.id).map(clone);
  },

  async getById(id: number): Promise<Item> {
    await delay(300);
    assertOnline();
    const machine = db.find((item) => item.id === id);
    if (!machine) throw new Error(`Máquina ${id} no encontrada`);
    return clone(machine);
  },

  async create(payload: CreateItemPayload): Promise<Item> {
    await delay(600);
    assertOnline();
    const created: Item = { id: nextId(), ...payload };
    db = [created, ...db];
    return clone(created);
  },

  async update(payload: UpdateItemPayload): Promise<Item> {
    await delay(600);
    assertOnline();
    const index = db.findIndex((item) => item.id === payload.id);
    if (index === -1) throw new Error(`Máquina ${payload.id} no encontrada`);
    const { id, ...changes } = payload;
    const updated: Item = { ...db[index], ...changes, id };
    db[index] = updated;
    return clone(updated);
  },
};