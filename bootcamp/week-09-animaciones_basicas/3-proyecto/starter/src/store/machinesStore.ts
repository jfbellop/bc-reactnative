// src/store/machinesStore.ts
// Estado del inventario (patrón Zustand de la semana 04).
//
// ¿Por qué un store y no TanStack Query en esta semana?
//   Las animaciones de la semana 09 dependen de cambios de lista INMEDIATOS
//   (agregar / eliminar / recargar). Con el store, el LayoutAnimation dispara
//   en el mismo frame en que el técnico toca el botón, sin esperar red.

import { create } from 'zustand';

import { MACHINES_SEED, createNextMachine } from '../data/machines';
import type { Machine } from '../types';
import { getMachineStatus, sortByUrgency } from '../utils/machine';

interface MachinesState {
  machines: Machine[];
  /** Cuántas máquinas nuevas se han registrado (para el código VM-0xx) */
  created: number;
  /** Recarga la máquina al 100 % de su capacidad */
  refill: (id: string) => void;
  /** Da de baja la máquina del inventario */
  remove: (id: string) => void;
  /** Registra una máquina nueva (queda agotada hasta la primera recarga) */
  addMachine: () => Machine;
  /** Simula el consumo del día para ver cómo baja la carga */
  consume: (id: string, units: number) => void;
  /** Devuelve el inventario a su estado inicial */
  reset: () => void;
}

/** Orden estable por urgencia: lo que el LayoutAnimation deja ver al moverse. */
function sorted(machines: Machine[]): Machine[] {
  return sortByUrgency(machines);
}

export const useMachinesStore = create<MachinesState>((set, get) => ({
  machines: sorted(MACHINES_SEED),
  created: 0,

  refill: (id) =>
    set((state) => ({
      machines: sorted(
        state.machines.map((machine) =>
          machine.id === id
            ? {
                ...machine,
                stock: machine.capacity,
                lastRefill: new Date().toISOString().slice(0, 10),
              }
            : machine
        )
      ),
    })),

  remove: (id) =>
    set((state) => ({
      machines: state.machines.filter((machine) => machine.id !== id),
    })),

  addMachine: () => {
    const created = get().created;
    const machine = createNextMachine(created);
    set((state) => ({
      created: created + 1,
      machines: sorted([...state.machines, machine]),
    }));
    return machine;
  },

  consume: (id, units) =>
    set((state) => ({
      machines: sorted(
        state.machines.map((machine) =>
          machine.id === id
            ? { ...machine, stock: Math.max(0, machine.stock - units) }
            : machine
        )
      ),
    })),

  reset: () => set({ machines: sorted(MACHINES_SEED), created: 0 }),
}));

// ─────────────────────────────────────────────────────────────
// Selectores (evitan re-renderizar la lista completa por un detalle)
// ─────────────────────────────────────────────────────────────

export function useMachineById(id: string): Machine | undefined {
  return useMachinesStore((state) => state.machines.find((machine) => machine.id === id));
}

export function useInventorySummary(): { total: number; critical: number } {
  return useMachinesStore((state) => ({
    total: state.machines.length,
    critical: state.machines.filter((machine) => getMachineStatus(machine.stock) !== 'operativa')
      .length,
  }));
}