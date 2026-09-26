// src/services/remoteApi.ts
// Adaptador de API REMOTA — Dominio: Máquinas Expendedoras (VendCorp)
//
// Se activa automáticamente cuando defines EXPO_PUBLIC_API_URL en un archivo
// .env (ver .env.example). Sirve tanto para tu backend real como para un mock
// propio (MockAPI) y traduce su respuesta al modelo del dominio.
//
// El adaptador que trae el starter apunta a DummyJSON (/products) como proxy,
// que devuelve productos genéricos: muebles, cosméticos, etc. Por eso el modo
// por defecto es el adaptador local con datos del dominio (localApi.ts).

import type { AxiosInstance } from 'axios';

import type { CreateItemPayload, Item, UpdateItemPayload } from '../types';
import type { MachinesApi } from './machinesApi';

// ─────────────────────────────────────────
// Formatos que puede devolver el backend
// ─────────────────────────────────────────

/** Formato del dominio: ya viene con los nombres correctos */
interface DomainMachineDto {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  stock: number | string;
}

/** Formato de APIs genéricas de práctica (DummyJSON /products) */
interface GenericProductDto {
  id: number;
  title: string;
  description?: string;
  price: number | string;
  stock: number | string;
}

type MachineDto = DomainMachineDto | GenericProductDto;

function isGenericProduct(dto: MachineDto): dto is GenericProductDto {
  return 'title' in dto;
}

/** Normaliza cualquier respuesta al modelo Item del dominio. */
function toItem(dto: MachineDto): Item {
  if (isGenericProduct(dto)) {
    return {
      id: dto.id,
      name: dto.title,
      description: dto.description ?? '',
      price: Number(dto.price),
      stock: Number(dto.stock),
    };
  }
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    price: Number(dto.price),
    stock: Number(dto.stock),
  };
}

/** Traduce el payload del dominio al body que espera el backend. */
function toBody(payload: CreateItemPayload, useGenericFields: boolean) {
  if (useGenericFields) {
    return {
      title: payload.name,
      description: payload.description,
      price: payload.price,
      stock: payload.stock,
    };
  }
  return { ...payload };
}

// ─────────────────────────────────────────
// Adaptador
// ─────────────────────────────────────────

const SELECT_FIELDS = 'id,title,description,price,stock';

/**
 * @param http       instancia Axios ya configurada (con baseURL e interceptores)
 * @param genericApi true si el backend es DummyJSON (/products); false para un
 *                   backend propio con los campos del dominio (/machines).
 */
export function createRemoteMachinesApi(
  http: AxiosInstance,
  genericApi: boolean
): MachinesApi {
  const resource = genericApi ? '/products' : '/machines';

  return {
    async list(): Promise<Item[]> {
      const { data } = await http.get<{ products?: MachineDto[] } | MachineDto[]>(
        genericApi ? `${resource}?limit=20&select=${SELECT_FIELDS}` : resource
      );
      // Unos backends devuelven el array directo y otros lo envuelven.
      const rows = Array.isArray(data) ? data : data.products ?? [];
      return rows.map(toItem);
    },

    async getById(id: number): Promise<Item> {
      const { data } = await http.get<MachineDto>(`${resource}/${id}`);
      return toItem(data);
    },

    async create(payload: CreateItemPayload): Promise<Item> {
      const body = toBody(payload, genericApi);
      const { data } = await http.post<MachineDto>(
        genericApi ? `${resource}/add` : resource,
        body
      );
      // DummyJSON simula la escritura: nos quedamos con lo que enviamos.
      return toItem(genericApi ? ({ ...data, ...body } as MachineDto) : data);
    },

    async update(payload: UpdateItemPayload): Promise<Item> {
      const body = toBody(payload, genericApi);
      const { data } = await http.put<MachineDto>(`${resource}/${payload.id}`, body);
      return toItem(genericApi ? ({ ...data, ...body, id: payload.id } as MachineDto) : data);
    },
  };
}