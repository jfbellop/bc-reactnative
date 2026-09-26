// App.tsx — Punto de entrada del proyecto Semana 07
// Dominio: Máquinas Expendedoras (VendCorp)
// QueryClientProvider + NavigationContainer + almacenamiento (MMKV/compatibilidad)

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from './src/navigation/RootNavigator';
// Importar el almacén arranca la hidratación de preferencias antes del primer render.
import './src/storage/mmkv';

// retry: 1 y no 3 → el fallback de caché (AsyncStorage) resuelve más rápido.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}