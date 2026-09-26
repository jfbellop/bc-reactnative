// src/navigation/types.ts
// Stack de la semana 09: lista (Home) → detalle de la máquina (Detail).

export type RootStackParamList = {
  Home: undefined;
  Detail: { machineId: string };
};