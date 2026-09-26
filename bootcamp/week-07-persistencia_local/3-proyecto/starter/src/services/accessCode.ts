// src/services/accessCode.ts
// Dato SENSIBLE del dominio: código de acceso técnico de VendCorp.
//
// Se guarda SIEMPRE con Expo SecureStore → cifrado en Keychain (iOS) /
// Keystore (Android). Nunca en AsyncStorage ni MMKV (sin cifrado).
//
// En la semana 08 este mismo módulo evoluciona hacia el guardado del JWT.

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_CODE_KEY = 'vendcorp_access_code';

/**
 * En web no existe Keychain/Keystore: expo-secure-store es un stub vacío.
 * Se avisa con un mensaje claro en lugar de fallar con un error técnico.
 */
const WEB_WARNING =
  'SecureStore solo está disponible en iOS/Android. En web no hay Keychain/Keystore: ' +
  'prueba esta sección desde el simulador o un dispositivo (el resto de la app sí funciona en web).';

function assertSecureStoreAvailable(): void {
  if (Platform.OS === 'web') {
    throw new Error(WEB_WARNING);
  }
}

export interface AccessCodeInfo {
  /** Valor enmascarado, seguro para mostrar en pantalla */
  masked: string;
  savedAt: number;
}

const META_KEY = `${ACCESS_CODE_KEY}_savedAt`;

/** Enmascara el código: "TEC-4821" → "TEC•••821" */
export function maskAccessCode(code: string): string {
  if (code.length <= 6) return '•••';
  return `${code.slice(0, 3)}•••${code.slice(-3)}`;
}

/**
 * Genera un código de acceso de técnico con formato del dominio:
 * "TEC-4821". Se genera al momento; nunca queda escrito en el código fuente.
 */
export function generateAccessCode(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TEC-${random}`;
}

export async function saveAccessCode(code: string): Promise<AccessCodeInfo> {
  assertSecureStoreAvailable();
  const savedAt = Date.now();
  // setItemAsync cifra el valor en el almacén seguro del sistema operativo.
  await SecureStore.setItemAsync(ACCESS_CODE_KEY, code);
  await SecureStore.setItemAsync(META_KEY, String(savedAt));
  return { masked: maskAccessCode(code), savedAt };
}

/** Devuelve `null` si nunca se guardó un código. */
export async function readAccessCode(): Promise<{ code: string; savedAt: number | null } | null> {
  assertSecureStoreAvailable();
  const [code, savedAt] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_CODE_KEY),
    SecureStore.getItemAsync(META_KEY),
  ]);
  if (!code) return null;
  return { code, savedAt: savedAt ? Number(savedAt) : null };
}

export async function deleteAccessCode(): Promise<void> {
  assertSecureStoreAvailable();
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_CODE_KEY),
    SecureStore.deleteItemAsync(META_KEY),
  ]);
}

export async function hasAccessCode(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const code = await SecureStore.getItemAsync(ACCESS_CODE_KEY);
  return code !== null;
}