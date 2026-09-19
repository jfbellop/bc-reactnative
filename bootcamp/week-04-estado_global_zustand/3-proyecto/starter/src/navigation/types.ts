// src/navigation/types.ts
// Dominio: Máquinas Expendedoras

export type RootTabParamList = {
  Home: undefined;
  Saved: undefined;
};

export type HomeStackParamList = {
  HomeList: undefined;
  HomeDetail: {
    id: string;
    name: string;
  };
};