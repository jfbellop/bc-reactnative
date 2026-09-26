// App.tsx — Punto de entrada del proyecto Semana 06
// Dominio: Máquinas Expendedoras (VendCorp)
// QueryClientProvider + NavigationContainer en la raíz

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from './navigation/RootNavigator';

// El QueryClient se crea fuera del componente para que no se recree en cada
// render: si viviera dentro, la caché se perdería en cada actualización.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos
      retry: 2,
      refetchOnWindowFocus: false, // en mobile no hay "ventana"
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