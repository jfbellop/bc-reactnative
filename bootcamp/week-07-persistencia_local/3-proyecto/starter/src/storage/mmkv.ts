// src/storage/mmkv.ts
// Dominio: Máquinas Expendedoras (VendCorp)
//
// Instancia GLOBAL de almacenamiento + hooks reactivos.
//
//   · Dev build (expo run:android / expo run:ios) → MMKV real (Nitro/JSI, sincrónico)
//   · Expo Go / web → modo compatibilidad sincrónico sobre AsyncStorage
//
// Los hooks `useMMKVString` / `useMMKVBoolean` / `useMMKVNumber` tienen la misma
// firma y el mismo comportamiento que los de react-native-mmkv (reactividad
// incluida), pero viven aquí para que la app funcione en los dos entornos.
// Usa SIEMPRE estos hooks: nunca importes `storage` dentro de un componente.

import { useCallback, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createFallbackStorage,
  type KeyValueStore,
  type StoredPrimitive,
} from './fallback';

/**
 * Ponlo en `false` para forzar el modo compatibilidad (útil para probar en Expo
 * Go o si el dev build nativo fallara).
 */
export const USE_NATIVE_MMKV = true;

export const MMKV_ID = 'vendcorp-storage';

// ─────────────────────────────────────────────────────────────
// 1. Intento de MMKV nativo
// ─────────────────────────────────────────────────────────────

function createNativeStore(): KeyValueStore | null {
  try {
    // require dinámico a propósito: el módulo nativo SOLO se ejecuta si existe.
    // En Expo Go / web esta llamada lanza y caemos al modo compatibilidad en
    // lugar de romper el arranque de la app.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mmkvModule = require('react-native-mmkv') as typeof import('react-native-mmkv');
    // ⚠️ API de react-native-mmkv 4.x: `createMMKV(config)`, NO `new MMKV()`.
    // (En la 3.x era una clase; el starter del bootcamp todavía muestra la 3.x.)
    const instance = mmkvModule.createMMKV({ id: MMKV_ID });

    const listeners = new Set<() => void>();
    // Listener nativo de MMKV → reactividad de los hooks.
    instance.addOnValueChangedListener(() => {
      listeners.forEach((listener) => listener());
    });

    return {
      backend: 'mmkv',
      ready: Promise.resolve(),
      getString: (key) => instance.getString(key),
      getNumber: (key) => instance.getNumber(key),
      getBoolean: (key) => instance.getBoolean(key),
      set: (key, value) => instance.set(key, value),
      // En MMKV 4.x el método se llama `remove` (en la 3.x era `delete`).
      delete: (key) => {
        instance.remove(key);
      },
      getAllKeys: () => instance.getAllKeys(),
      subscribe: (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    };
  } catch (error) {
    console.warn(
      '[storage] MMKV nativo no disponible → modo compatibilidad (Expo Go/web).',
      (error as Error)?.message
    );
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 2. Instancia global (una sola por app)
// ─────────────────────────────────────────────────────────────

export const storage: KeyValueStore =
  (USE_NATIVE_MMKV ? createNativeStore() : null) ??
  createFallbackStorage(AsyncStorage);

/** 'mmkv' en dev build · 'fallback' en Expo Go/web (se muestra en Ajustes). */
export const storageBackend = storage.backend;

/** Se resuelve cuando el modo compatibilidad terminó de leer el disco. */
export const storageReady: Promise<void> = storage.ready;

if (__DEV__) {
  console.log(
    `[storage] backend: ${storageBackend}` +
      (storageBackend === 'mmkv'
        ? ' (MMKV nativo, sincrónico)'
        : ' (compatibilidad: memoria + AsyncStorage)')
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Hooks reactivos (misma API que react-native-mmkv)
// ─────────────────────────────────────────────────────────────

function useStoreValue<T extends StoredPrimitive>(
  read: () => T | undefined,
  key: string,
  store: KeyValueStore
): [
  T | undefined,
  (value: T | ((current: T | undefined) => T | undefined) | undefined) => void,
] {
  const subscribe = useCallback(
    (listener: () => void) => store.subscribe(listener),
    [store]
  );
  const getSnapshot = useCallback(() => read(), [read]);

  // useSyncExternalStore: React 19 vuelve a renderizar cuando el store notifica.
  // Es el mismo mecanismo que usan los hooks de react-native-mmkv.
  const value = useSyncExternalStore(subscribe, getSnapshot);

  // Acepta valor directo o función (igual firma que react-native-mmkv).
  const setValue = useCallback(
    (next: T | ((current: T | undefined) => T | undefined) | undefined) => {
      const resolved = typeof next === 'function' ? next(read()) : next;
      if (resolved === undefined) {
        store.delete(key);
      } else {
        store.set(key, resolved);
      }
    },
    [store, key, read]
  );

  return [value, setValue];
}

export function useMMKVString(
  key: string,
  store: KeyValueStore = storage
): [
  string | undefined,
  (value: string | ((current: string | undefined) => string | undefined) | undefined) => void,
] {
  const read = useCallback(() => store.getString(key), [store, key]);
  return useStoreValue<string>(read, key, store);
}

export function useMMKVNumber(
  key: string,
  store: KeyValueStore = storage
): [
  number | undefined,
  (value: number | ((current: number | undefined) => number | undefined) | undefined) => void,
] {
  const read = useCallback(() => store.getNumber(key), [store, key]);
  return useStoreValue<number>(read, key, store);
}

export function useMMKVBoolean(
  key: string,
  store: KeyValueStore = storage
): [
  boolean | undefined,
  (value: boolean | ((current: boolean | undefined) => boolean | undefined) | undefined) => void,
] {
  const read = useCallback(() => store.getBoolean(key), [store, key]);
  return useStoreValue<boolean>(read, key, store);
}