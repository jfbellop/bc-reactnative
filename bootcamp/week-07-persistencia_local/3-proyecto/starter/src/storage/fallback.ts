// src/storage/fallback.ts
// Almacén clave-valor SÍNCRONO respaldado por un almacén asíncrono.
//
// ¿Por qué existe este archivo?
//   MMKV es sincrónico pero necesita un dev build nativo (no funciona en Expo Go
//   ni en web). Para poder desarrollar y demostrar la app en Expo Go sin perder
//   la API sincrónica que exige la semana, este módulo implementa el MISMO
//   contrato (getString/set/delete… sin await) manteniendo los valores en
//   memoria y persistiéndolos en un almacén asíncrono (AsyncStorage) por detrás.
//
// Este archivo no importa nada de React Native a propósito: es lógica pura y se
// puede probar con Node (ver GUIA-SEMANA-07.md, sección de verificaciones).

export type StoredPrimitive = string | number | boolean;

/** Almacén asíncrono mínimo (lo cumple AsyncStorage tal cual). */
export interface AsyncPersistence {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

/** Contrato que consumen los hooks y las pantallas. */
export interface KeyValueStore {
  /** Motor real que está detrás: MMKV nativo o el modo compatibilidad. */
  readonly backend: 'mmkv' | 'fallback';
  /** Se resuelve cuando el almacén ya cargó sus valores de disco. */
  readonly ready: Promise<void>;
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean | undefined;
  set(key: string, value: StoredPrimitive): void;
  delete(key: string): void;
  getAllKeys(): string[];
  /** Notifica a los hooks cuando cambia cualquier clave (reactividad). */
  subscribe(listener: () => void): () => void;
}

export const FALLBACK_STORAGE_KEY = '@vendcorp/kv';

/**
 * Crea un almacén sincrónico en memoria con persistencia asíncrona.
 *
 * @param persistence almacén de respaldo (AsyncStorage en la app)
 * @param storageKey  clave donde se serializa todo el mapa
 */
export function createFallbackStorage(
  persistence: AsyncPersistence,
  storageKey: string = FALLBACK_STORAGE_KEY
): KeyValueStore {
  const memory = new Map<string, StoredPrimitive>();
  const listeners = new Set<() => void>();

  function emit(): void {
    listeners.forEach((listener) => listener());
  }

  // El mapa completo se serializa como un único JSON (más simple y suficiente
  // para un puñado de preferencias).
  function persist(): void {
    const plainObject = Object.fromEntries(memory);
    persistence.setItem(storageKey, JSON.stringify(plainObject)).catch((error: unknown) => {
      console.warn('[storage] no se pudo persistir la preferencia:', error);
    });
  }

  // Hidratación: lectura inicial desde disco. Los hooks se re-renderizan solos
  // gracias a emit() cuando termina.
  const ready = persistence
    .getItem(storageKey)
    .then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as Record<string, StoredPrimitive>;
        Object.entries(parsed).forEach(([key, value]) => memory.set(key, value));
      } catch {
        console.warn('[storage] contenido corrupto en disco, se ignora');
      }
    })
    .catch(() => undefined)
    .then(() => {
      emit();
    });

  return {
    backend: 'fallback',
    ready,

    getString(key) {
      const value = memory.get(key);
      return typeof value === 'string' ? value : undefined;
    },

    getNumber(key) {
      const value = memory.get(key);
      return typeof value === 'number' ? value : undefined;
    },

    getBoolean(key) {
      const value = memory.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },

    set(key, value) {
      memory.set(key, value);
      persist();
      emit();
    },

    delete(key) {
      memory.delete(key);
      persist();
      emit();
    },

    getAllKeys() {
      return [...memory.keys()];
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}