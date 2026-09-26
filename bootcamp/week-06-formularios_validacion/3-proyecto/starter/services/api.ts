// src/services/api.ts
// Punto único de acceso a los datos — Dominio: Máquinas Expendedoras (VendCorp)
//
// La app consume SIEMPRE `machinesApi` (mismo contrato). Cuál adaptador se usa
// depende del entorno:
//
//   · Sin EXPO_PUBLIC_API_URL  → adaptador LOCAL  (inventario del dominio en memoria)
//   · Con EXPO_PUBLIC_API_URL  → adaptador REMOTO (Axios contra tu backend o mock)
//
// Así los hooks de TanStack Query y las pantallas no saben de dónde vienen los
// datos: cambiar de backend es cambiar un archivo .env.

import axios from 'axios';

import { localMachinesApi } from './localApi';
import { createRemoteMachinesApi } from './remoteApi';
import type { MachinesApi } from './machinesApi';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Instancia Axios con la configuración compartida (timeout, cabeceras e
// interceptor de errores). Solo se usa en modo remoto.
export const apiClient = axios.create({
  baseURL: API_BASE_URL ?? 'https://dummyjson.com',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.error('[API Error]', error.response?.status, error.config?.url);
    }
    return Promise.reject(error);
  }
);

// Heurística: si apuntas a DummyJSON usamos sus campos (title) y sus rutas
// (/products/add). Con tu propio backend se usan los campos del dominio.
const usesGenericApi = (API_BASE_URL ?? '').includes('dummyjson');

export const machinesApi: MachinesApi = API_BASE_URL
  ? createRemoteMachinesApi(apiClient, usesGenericApi)
  : localMachinesApi;

export const apiMode = API_BASE_URL
  ? `remoto → ${API_BASE_URL}`
  : 'local (inventario VendCorp en memoria)';

if (__DEV__) {
  console.log(`[api] modo: ${apiMode}`);
}