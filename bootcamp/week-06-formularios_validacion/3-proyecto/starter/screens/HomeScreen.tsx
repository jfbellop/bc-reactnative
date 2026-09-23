// src/screens/HomeScreen.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
// Lista las máquinas del inventario y da acceso a editar cada una.

import React from 'react';
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
import { StockBadge } from '../components/StockBadge';
import { formatCop } from '../utils/machine';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// ──────────────────────────────────────────────
// SUB-COMPONENTE: tarjeta de máquina
// ──────────────────────────────────────────────

interface MachineCardProps {
  item: Item;
  onPress: () => void;
}

function MachineCard({ item, onPress }: MachineCardProps): React.JSX.Element {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      testID={`machine-card-${item.id}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardAvatar}>
          <Text style={styles.cardAvatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          {!!item.description && (
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>

        <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>{formatCop(item.price)}</Text>
        <Text style={styles.cardStock}>{item.stock} uds</Text>
        <StockBadge stock={item.stock} />
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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando máquinas...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ No se pudo cargar el inventario</Text>
        <Text style={styles.errorDetail}>{(error as Error)?.message}</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const machines = data ?? [];

  const renderItem: ListRenderItem<Item> = ({ item }) => (
    <MachineCard
      item={item}
      onPress={() =>
        navigation.navigate('Edit', { id: item.id, name: item.name })
      }
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={machines}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onRefresh={refetch}
        refreshing={isFetching && !isLoading}
        ListHeaderComponent={
          <Text style={styles.countLabel}>
            {machines.length} máquina{machines.length !== 1 ? 's' : ''} en el
            inventario
          </Text>
        }
        ListFooterComponent={
          machines.length > 0 ? (
            <Text style={styles.footerHint}>
              Toca una máquina para editar su tarifa o su stock
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Aún no hay máquinas registradas.</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => navigation.navigate('Create')}
            >
              <Text style={styles.retryButtonText}>Registrar la primera</Text>
            </Pressable>
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
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
  separator: { height: SPACING.sm },
  countLabel: {
    ...TYPOGRAPHY.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  cardPressed: { opacity: 0.75 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarText: { ...TYPOGRAPHY.h3, color: COLORS.accent },
  cardContent: { flex: 1, gap: SPACING.xs },
  cardTitle: { ...TYPOGRAPHY.body, fontWeight: '600' },
  cardSubtitle: { ...TYPOGRAPHY.caption },
  chevron: { ...TYPOGRAPHY.h2, color: COLORS.textMuted },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  cardPrice: { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.accent },
  cardStock: { ...TYPOGRAPHY.caption, flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  loadingText: { ...TYPOGRAPHY.caption },
  errorText: { ...TYPOGRAPHY.h3, color: COLORS.error },
  errorDetail: { ...TYPOGRAPHY.caption, textAlign: 'center' },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center' },
  footerHint: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600',
  },
});
