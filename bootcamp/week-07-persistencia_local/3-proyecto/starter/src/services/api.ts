// src/services/api.ts
// Punto único de acceso a los datos.
//
//   · Sin EXPO_PUBLIC_API_URL → adaptador LOCAL (inventario VendCorp en memoria)
//   · Con EXPO_PUBLIC_API_URL → adaptador REMOTO (Axios contra tu backend/mock)
//
// Los hooks de TanStack Query no saben de dónde vienen los datos.

import axios from 'axios';

import { localMachinesApi } from './localApi';
import { createRemoteMachinesApi } from './remoteApi';
import type { MachinesApi } from './machinesApi';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL ?? 'http://localhost',
  timeout: 8_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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

export const machinesApi: MachinesApi = API_BASE_URL
  ? createRemoteMachinesApi(apiClient)
  : localMachinesApi;

if (__DEV__) {
  console.log(
    `[api] modo: ${API_BASE_URL ? `remoto → ${API_BASE_URL}` : 'local (inventario VendCorp en memoria)'}`
  );
}