// src/hooks/useItems.ts
// Dominio: Máquinas Expendedoras (VendCorp)
// CRUD con TanStack Query + Axios. La API de práctica (DummyJSON /products)
// se usa como proxy y aquí se traduce al modelo del dominio:
//
//   product.title       →  machine.name
//   product.description →  machine.description
//   product.price       →  machine.price      (number real)
//   product.stock       →  machine.stock      (number real)

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { apiClient } from '../services/api';
import type { CreateItemPayload, Item, UpdateItemPayload } from '../types';

export const ITEMS_QUERY_KEY = ['machines'] as const;

// ─────────────────────────────────────────
// Mapeo proxy ↔ dominio
// ─────────────────────────────────────────

// Forma cruda que devuelve la API
interface ApiProduct {
  id: number;
  title: string;
  description?: string;
  price: number;
  stock: number;
}

function mapProductToItem(product: ApiProduct): Item {
  return {
    id: product.id,
    name: product.title,
    description: product.description ?? '',
    price: Number(product.price),
    stock: Number(product.stock),
  };
}

function toApiPayload(payload: CreateItemPayload) {
  return {
    title: payload.name,
    description: payload.description,
    price: payload.price,
    stock: payload.stock,
  };
}

const SELECT_FIELDS = 'id,title,description,price,stock';

// ─────────────────────────────────────────
// READ — lista de máquinas
// ─────────────────────────────────────────

export function useItems() {
  return useQuery<Item[]>({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<{ products: ApiProduct[] }>(
        `/products?limit=15&select=${SELECT_FIELDS}`
      );
      return data.products.map(mapProductToItem);
    },
  });
}

// ─────────────────────────────────────────
// READ — una máquina (formulario Edit)
// ─────────────────────────────────────────

export function useItemById(id: number) {
  return useQuery<Item>({
    queryKey: [...ITEMS_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiProduct>(`/products/${id}`);
      return mapProductToItem(data);
    },
    enabled: Number.isFinite(id),
  });
}

// ─────────────────────────────────────────
// CREATE — registrar máquina
// ─────────────────────────────────────────

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, CreateItemPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<ApiProduct>(
        '/products/add',
        toApiPayload(payload)
      );
      return mapProductToItem({ ...data, ...toApiPayload(payload) });
    },
    onSuccess: (created) => {
      // Escribimos directamente en la caché de TanStack Query para que la
      // máquina nueva aparezca al volver a Home.
      // Nota: el proxy de práctica NO persiste las escrituras, por eso NO
      // invalidamos la query (un refetch haría desaparecer el ítem nuevo).
      // Con una API real esto sería:
      //   queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY], (current) => [
        created,
        ...(current ?? []),
      ]);
      // Sembramos también el detalle para que EditScreen lo abra sin ir a red.
      queryClient.setQueryData<Item>([...ITEMS_QUERY_KEY, created.id], created);
    },
  });
}

// ─────────────────────────────────────────
// UPDATE — guardar cambios de una máquina
// ─────────────────────────────────────────

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, UpdateItemPayload>({
    mutationFn: async (payload) => {
      const body = toApiPayload(payload);
      try {
        const { data } = await apiClient.put<ApiProduct>(
          `/products/${payload.id}`,
          body
        );
        // El payload del formulario tiene prioridad: son los valores guardados.
        return mapProductToItem({ ...data, ...body });
      } catch (error) {
        // ⚠️ Limitación del proxy: DummyJSON simula las escrituras y responde
        // 404 al actualizar ítems creados en esta sesión (ids >= 195).
        // Con una API real, elimina este bloque catch y deja que el error
        // se propague a la UI.
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return { ...payload }; // el payload ya incluye el id
        }
        throw error;
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Item[]>([ITEMS_QUERY_KEY], (current) =>
        (current ?? []).map((item) => (item.id === updated.id ? updated : item))
      );
      queryClient.setQueryData<Item>([...ITEMS_QUERY_KEY, updated.id], updated);
    },
  });
}
