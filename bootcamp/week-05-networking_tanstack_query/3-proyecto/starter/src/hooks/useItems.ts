// src/hooks/useItems.ts
// Dominio: Máquinas Expendedoras (VendCorp)

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { CreateItemPayload, Item } from '../types';
import {
  MACHINE_CATALOG,
  addSessionMachine,
  getSessionMachines,
  nextMachineCode,
} from '../data/machinesCatalog';

export const ITEMS_QUERY_KEY = ['machines'] as const;

// Forma cruda que devuelve la API de práctica.
interface RawPost {
  id: number;
  title: string;
  body: string;
  userId: number;
}

/**
 * Convierte un registro de la API en una máquina de NUESTRO dominio.
 * JSONPlaceholder no conoce las máquinas expendedoras: solo aporta el id
 * y la confirmación de la llamada de red, así que el contenido real
 * (nombre, ubicación, categoría, estado, precio, stock) viene del catálogo
 * en español de src/data/machinesCatalog.ts.
 *
 * El día que exista la API real, se cambia EXPO_PUBLIC_API_URL y esta
 * función pasa a mapear la respuesta del backend; el resto no cambia.
 */
function postToItem(post: RawPost, index: number): Item {
  const base = MACHINE_CATALOG[index % MACHINE_CATALOG.length];
  return { ...base, id: post.id };
}

// ============================================================
// useItems — lista de máquinas expendedoras
// ============================================================

export function useItems() {
  return useQuery<Item[]>({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<RawPost[]>('/posts?_limit=15');
      // Primero lo registrado en esta sesión, luego el inventario de la API.
      return [...getSessionMachines(), ...data.map(postToItem)];
    },
  });
}

// ============================================================
// useItemById — detalle de una máquina
// ============================================================

export function useItemById(id: string | number) {
  return useQuery<Item>({
    queryKey: [...ITEMS_QUERY_KEY, id],
    queryFn: async () => {
      // Máquina registrada en esta sesión: no está en el servidor.
      const local = getSessionMachines().find((machine) => machine.id === id);
      if (local) return local;

      const { data } = await apiClient.get<RawPost>(`/posts/${id}`);
      return postToItem(data, Number(data.id) - 1);
    },
    enabled: !!id,
  });
}

// ============================================================
// useCreateItem — registrar una nueva máquina
// ============================================================

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, CreateItemPayload>({
    mutationFn: async (payload) => {
      const code = nextMachineCode();

      // El POST sí sale a la API real (JSONPlaceholder lo acepta y responde 201).
      await apiClient.post('/posts', {
        title: `${code} · ${payload.name}`,
        body: payload.description ?? '',
        userId: 1,
      });

      const machine: Item = {
        id: `local-${code}`,
        code,
        name: payload.name.trim(),
        location: payload.location.trim(),
        category: payload.category,
        status: payload.status,
        price: payload.price,
        stock: payload.stock,
        capacity: 50,
        description: payload.description?.trim(),
      };

      return machine;
    },
    onSuccess: (machine) => {
      // La API de práctica no persiste: guardamos la máquina en memoria
      // para que aparezca en la lista, y luego invalidamos el caché.
      addSessionMachine(machine);
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
    onError: (error) => {
      console.error('No se pudo registrar la máquina:', error.message);
    },
  });
}

// ============================================================
// useDeleteItem — dar de baja una máquina
// ============================================================

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string | number>({
    mutationFn: async (id) => {
      // Las máquinas creadas en la sesión no existen en el servidor.
      if (typeof id === 'string' && id.startsWith('local-')) return;
      await apiClient.delete(`/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
  });
}