// src/services/remoteApi.ts
// Adaptador REMOTO — Axios contra tu backend real o un mock propio (MockAPI).
// Se activa definiendo EXPO_PUBLIC_API_URL en un archivo .env.

import type { AxiosInstance } from 'axios';

import type { CreateItemPayload, Item, UpdateItemPayload } from '../types';
import type { MachinesApi } from './machinesApi';

interface DomainMachineDto {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  stock: number | string;
}

function toItem(dto: DomainMachineDto): Item {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    price: Number(dto.price),
    stock: Number(dto.stock),
  };
}

export function createRemoteMachinesApi(http: AxiosInstance): MachinesApi {
  return {
    async list(): Promise<Item[]> {
      const { data } = await http.get<DomainMachineDto[] | { machines: DomainMachineDto[] }>(
        '/machines'
      );
      const rows = Array.isArray(data) ? data : data.machines;
      return rows.map(toItem);
    },

    async getById(id: number): Promise<Item> {
      const { data } = await http.get<DomainMachineDto>(`/machines/${id}`);
      return toItem(data);
    },

    async create(payload: CreateItemPayload): Promise<Item> {
      const { data } = await http.post<DomainMachineDto>('/machines', payload);
      return toItem(data);
    },

    async update(payload: UpdateItemPayload): Promise<Item> {
      const { data } = await http.put<DomainMachineDto>(
        `/machines/${payload.id}`,
        payload
      );
      return toItem(data);
    },
  };
}