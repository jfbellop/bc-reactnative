// src/hooks/useItems.ts
// Dominio: Máquinas Expendedoras (VendCorp)
// CRUD con TanStack Query. Los datos los sirve `machinesApi`, que resuelve si
// vienen del inventario local del dominio o de un backend HTTP (ver
// src/services/api.ts). El mismo patrón de la Semana 05: useQuery para leer,
// useMutation + invalidateQueries para escribir.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { machinesApi } from '../services/api';
import type { CreateItemPayload, Item, UpdateItemPayload } from '../types';

export const ITEMS_QUERY_KEY = ['machines'] as const;

// ─────────────────────────────────────────
// READ — lista de máquinas
// ─────────────────────────────────────────

export function useItems() {
  return useQuery<Item[]>({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: () => machinesApi.list(),
  });
}

// ─────────────────────────────────────────
// READ — una máquina (formulario Edit)
// ─────────────────────────────────────────

export function useItemById(id: number) {
  return useQuery<Item>({
    queryKey: [...ITEMS_QUERY_KEY, id],
    queryFn: () => machinesApi.getById(id),
    enabled: Number.isFinite(id),
  });
}

// ─────────────────────────────────────────
// CREATE — registrar máquina
// ─────────────────────────────────────────

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, CreateItemPayload>({
    mutationFn: (payload) => machinesApi.create(payload),
    onSuccess: () => {
      // Invalidar la lista para que se refresque con la máquina nueva.
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
  });
}

// ─────────────────────────────────────────
// UPDATE — guardar cambios de una máquina
// ─────────────────────────────────────────

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, UpdateItemPayload>({
    mutationFn: (payload) => machinesApi.update(payload),
    onSuccess: (updated) => {
      // Lista + detalle: así EditScreen nunca muestra datos viejos.
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      queryClient.setQueryData<Item>(
        [...ITEMS_QUERY_KEY, updated.id],
        updated
      );
    },
  });
}