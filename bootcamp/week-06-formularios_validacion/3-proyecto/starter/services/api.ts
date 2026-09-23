// src/services/api.ts
// Instancia Axios centralizada.
// Dominio: Máquinas Expendedoras (VendCorp)
//
// ⚠️ API de práctica: DummyJSON (/products) actúa como proxy de la API real del
// dominio. El mapeo producto → máquina vive en src/hooks/useItems.ts.
// Cuando exista el backend propio, basta con exportar la URL en un .env:
//   EXPO_PUBLIC_API_URL=https://api.vendcorp.com/v1

import axios from 'axios';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://dummyjson.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor global de errores: centraliza el logging en desarrollo.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.error('[API Error]', error.response?.status, error.config?.url);
    }
    return Promise.reject(error);
  }
);
