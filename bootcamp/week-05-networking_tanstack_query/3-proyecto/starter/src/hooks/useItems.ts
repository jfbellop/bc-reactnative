// src/hooks/useItems.ts
// Dominio: Máquinas Expendedoras
// Usamos /posts de JSONPlaceholder como proxy: mapeamos
// title -> name y body -> description en cada hook.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { CreateItemPayload, Item } from '../types';

export const ITEMS_QUERY_KEY = ['machines'] as const;

// Forma cruda que devuelve JSONPlaceholder
interface RawPost {
  id: number;
  title: string;
  body: string;
  userId: number;
}

function mapPostToItem(post: RawPost): Item {
  return {
    id: post.id,
    name: post.title,
    description: post.body,
  };
}

// ============================================================
// useItems — lista de máquinas expendedoras
// ============================================================

export function useItems() {
  return useQuery<Item[]>({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<RawPost[]>('/posts?_limit=15');
      return data.map(mapPostToItem);
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
      const { data } = await apiClient.get<RawPost>(`/posts/${id}`);
      return mapPostToItem(data);
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
      const { data } = await apiClient.post<RawPost>('/posts', {
        title: payload.name,
        body: payload.description ?? '',
        userId: 1,
      });
      return mapPostToItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Failed to create item:', error.message);
    },
  });
}

// ============================================================
// useDeleteItem — eliminar una máquina
// ============================================================

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string | number>({
    mutationFn: async (id) => {
      await apiClient.delete(`/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
  });
}