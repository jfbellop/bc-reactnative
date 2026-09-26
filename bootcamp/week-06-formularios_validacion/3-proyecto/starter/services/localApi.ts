// src/services/localApi.ts
// Adaptador de API LOCAL — Dominio: Máquinas Expendedoras (VendCorp)
//
// Expone el MISMO contrato que el adaptador remoto (ver remoteApi.ts), pero
// contra un "servidor" en memoria sembrado con datos del dominio.
//
// ¿Por qué existe?
//  · La API real de VendCorp todavía no existe y las APIs públicas de prueba
//    (DummyJSON, JSONPlaceholder…) devuelven productos genéricos: muebles,
//    cosméticos, etc. Nada que ver con máquinas expendedoras.
//  · Con este adaptador la app se ve y se comporta como el dominio desde el
//    primer arranque, sin depender de internet ni de que otro servicio esté
//    disponible durante la demo.
//
// Nota para la Semana 07: aquí es donde entrará la persistencia local (MMKV /
// AsyncStorage / SecureStore) para que el inventario sobreviva al cierre.

import { MACHINES_SEED } from '../data/machinesSeed';
import type { CreateItemPayload, Item, UpdateItemPayload } from '../types';
import type { MachinesApi } from './machinesApi';

// Copia mutable: el "servidor" arranca sembrado y va cambiando con el CRUD.
let db: Item[] = MACHINES_SEED.map((machine) => ({ ...machine }));

/** Simula la latencia de red para que los estados de carga se aprecien. */
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
    // Más recientes primero, igual que haría un backend real.
    return [...db].sort((a, b) => b.id - a.id).map(clone);
  },

  async getById(id: number): Promise<Item> {
    await delay(300);
    const machine = db.find((item) => item.id === id);
    if (!machine) {
      throw new Error(`Máquina ${id} no encontrada`);
    }
    return clone(machine);
  },

  async create(payload: CreateItemPayload): Promise<Item> {
    await delay(600);
    const created: Item = { id: nextId(), ...payload };
    db = [created, ...db];
    return clone(created);
  },

  async update(payload: UpdateItemPayload): Promise<Item> {
    await delay(600);
    const index = db.findIndex((item) => item.id === payload.id);
    if (index === -1) {
      throw new Error(`Máquina ${payload.id} no encontrada`);
    }
    const { id, ...changes } = payload;
    const updated: Item = { ...db[index], ...changes, id };
    db[index] = updated;
    return clone(updated);
  },
};