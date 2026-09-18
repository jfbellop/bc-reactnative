// src/navigation/types.ts
// Dominio: Máquinas Expendedoras

export type RootTabParamList = {
  Home: undefined;
  Favorites: undefined;
};

export type HomeStackParamList = {
  HomeList: undefined;
  HomeDetail: {
    id: string;
    name: string;
    description: string;
    category: string;
    location: string;
    status: string;
    capacity: number;
    currentStock: number;
    dailyRevenue: number;
  };
};