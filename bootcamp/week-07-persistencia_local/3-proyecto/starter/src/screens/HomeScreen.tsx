// src/screens/HomeScreen.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
//
// Lista el inventario aplicando las PREFERENCIAS (MMKV) y mostrando el BANNER
// OFFLINE cuando los datos vienen de la caché de AsyncStorage.

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { Item } from '../types';
import type { RootStackParamList } from '../navigation/types';
import { useItems } from '../hooks/useItems';
import { usePreferences } from '../hooks/usePreferences';
import { getSimulatedMode, setSimulatedMode } from '../services/localApi';
import {
  formatCop,
  getMachineCode,
  getMachineStatus,
  MACHINE_STATUS,
  sortAndFilterMachines,
} from '../utils/machine';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// ──────────────────────────────────────────────
// SUB-COMPONENTE: tarjeta de máquina
// ──────────────────────────────────────────────

interface MachineCardProps {
  item: Item;
  compact: boolean;
  onPress: () => void;
}

function MachineCard({ item, compact, onPress }: MachineCardProps): React.JSX.Element {
  const status = MACHINE_STATUS[getMachineStatus(item.stock)];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      testID={`machine-card-${item.id}`}
    >
      <View style={[styles.avatar, compact && styles.avatarCompact]}>
        <Text style={styles.avatarText}>{getMachineCode(item.name)}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>

        {/* El modo compacto oculta la ubicación */}
        {!compact && (
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.description}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{formatCop(item.price)}</Text>
          <Text style={styles.cardStock}>{item.stock} uds</Text>
          <Text style={[styles.cardStatus, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// PANTALLA
// ──────────────────────────────────────────────

export function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNavProp>();
  const { data, isLoading, isError, isFetching, refetch, error } = useItems();
  const { sortOrder, compactMode, itemsPerPage, lowStockOnly } = usePreferences();

  const [simulatedOffline, setSimulatedOffline] = useState(
    getSimulatedMode() === 'offline'
  );

  // Preferencias → lista final (filtro + orden + límite)
  const machines = useMemo(
    () =>
      sortAndFilterMachines(data?.items ?? [], {
        sortOrder,
        lowStockOnly,
        itemsPerPage,
      }),
    [data?.items, sortOrder, lowStockOnly, itemsPerPage]
  );

  const toggleSimulatedOffline = useCallback(() => {
    const next = simulatedOffline ? 'normal' : 'offline';
    setSimulatedMode(next);
    setSimulatedOffline(next !== 'normal');
  }, [simulatedOffline]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando inventario...</Text>
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ Sin conexión y sin datos en caché</Text>
        <Text style={styles.errorDetail}>{(error as Error)?.message}</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
        <Text style={styles.hintSmall}>
          Consejo: la primera carga necesita conexión para llenar la caché.
        </Text>
      </View>
    );
  }

  const renderItem: ListRenderItem<Item> = ({ item }) => (
    <MachineCard
      item={item}
      compact={compactMode}
      onPress={() => navigation.navigate('Edit', { id: item.id, name: item.name })}
    />
  );

  const total = data?.items.length ?? 0;

  return (
    <View style={styles.container}>
      {/* Banner offline — aparece cuando los datos vienen de la caché */}
      {data?.source === 'cache' && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            ⚠️ Sin conexión — mostrando datos guardados localmente
            {data.cachedAt
              ? ` (${new Date(data.cachedAt).toLocaleTimeString()})`
              : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={machines}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onRefresh={refetch}
        refreshing={isFetching && !isLoading}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>
              {machines.length}
              {machines.length !== total ? ` de ${total}` : ''} máquinas ·{' '}
              {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
              {compactMode ? ' · Compacto' : ''}
              {lowStockOnly ? ' · Solo recargas' : ''}
            </Text>

            {/* Simulador de caída de red (con el modo remoto apagar el WiFi) */}
            <Pressable onPress={toggleSimulatedOffline} style={styles.simToggle}>
              <Text style={styles.simToggleText}>
                {simulatedOffline ? '▶️ Restaurar conexión' : '🔌 Simular sin conexión'}
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              {lowStockOnly
                ? 'Todas las máquinas están operativas 🎉'
                : 'No hay máquinas registradas'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ──────────────────────────────────────────────
// ESTILOS
// ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingVertical: SPACING.sm, paddingBottom: SPACING.xl },
  separator: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  listHeader: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  listHeaderText: { ...TYPOGRAPHY.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  simToggle: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  simToggleText: { ...TYPOGRAPHY.caption, color: COLORS.accent },

  offlineBanner: {
    backgroundColor: COLORS.offlineBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  offlineText: { ...TYPOGRAPHY.caption, color: COLORS.offlineText, fontWeight: '600' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  cardCompact: { paddingVertical: SPACING.sm },
  cardPressed: { opacity: 0.7 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCompact: { width: 32, height: 32 },
  avatarText: { ...TYPOGRAPHY.h3, color: COLORS.accent },
  cardContent: { flex: 1, gap: SPACING.xs },
  cardTitle: { ...TYPOGRAPHY.body, fontWeight: '600' },
  cardSubtitle: { ...TYPOGRAPHY.caption },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardPrice: { ...TYPOGRAPHY.caption, color: COLORS.accent, fontWeight: '700' },
  cardStock: { ...TYPOGRAPHY.caption, flex: 1 },
  cardStatus: { ...TYPOGRAPHY.caption, fontWeight: '600' },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  loadingText: { ...TYPOGRAPHY.caption },
  errorText: { ...TYPOGRAPHY.h3, color: COLORS.error },
  errorDetail: { ...TYPOGRAPHY.caption, textAlign: 'center' },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center' },
  hintSmall: { ...TYPOGRAPHY.caption, textAlign: 'center', fontStyle: 'italic' },
  retryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryButtonText: { ...TYPOGRAPHY.body, color: COLORS.background, fontWeight: '600' },
});