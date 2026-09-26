// src/navigation/types.ts
// Tipado del stack de navegación — Dominio: Máquinas Expendedoras (VendCorp)

export type RootStackParamList = {
  Home: undefined;
  Create: undefined;
  /** Edit recibe el id (para la query) y el nombre (para el título del header) */
  Edit: { id: number; name: string };
};