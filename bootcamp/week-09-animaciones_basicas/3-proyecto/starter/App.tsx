// App.tsx — VendCorp · Semana 09: Animaciones Básicas
//
// El inventario de esta semana vive en un store Zustand (en memoria) para que
// las animaciones de layout se vean sin latencia de red. El QueryClientProvider
// se conserva porque la semana 10 vuelve a consumir datos remotos con TanStack
// Query, y el store ya tiene la misma forma que devolvería la API.

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from './src/navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}