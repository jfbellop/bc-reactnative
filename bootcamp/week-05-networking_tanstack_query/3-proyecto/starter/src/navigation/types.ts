// src/navigation/types.ts

export type RootStackParamList = {
  Home: undefined;
  Detail: { id: string | number; name: string };
  Create: undefined;
};