// src/screens/HomeScreen.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
// Lista el inventario con useQuery + pull-to-refresh.

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
import {
  CATEGORY_ICONS,
  STATUS_COLORS,
  fillPercent,
  formatCop,
} from '../utils/machine';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface ItemCardProps {
  item: Item;
  onPress: () => void;
}

function ItemCard({ item, onPress }: ItemCardProps): React.JSX.Element {
  const statusColor = STATUS_COLORS[item.status];
  const carga = fillPercent(item.stock, item.capacity);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
      onPress={onPress}
      testID={`item-card-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${item.code} ${item.name}, ${item.status}`}
    >
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>{CATEGORY_ICONS[item.category]}</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.badge, { borderColor: statusColor }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.code} · {item.location}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{formatCop(item.price)}</Text>
          <Text style={styles.cardStock}>
            {item.stock}/{item.capacity} uds
          </Text>
        </View>

        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${carga}%`, backgroundColor: statusColor }]}
          />
        </View>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNavProp>();
  const { data, isLoading, isError, isFetching, refetch, error } = useItems();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando máquinas expendedoras…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ No se pudo cargar el inventario</Text>
        <Text style={styles.errorDetail}>
          Revisa tu conexión a internet e inténtalo de nuevo.
        </Text>
        <Text style={styles.errorDetail}>{(error as Error)?.message}</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const machines = data ?? [];

  const renderItem: ListRenderItem<Item> = ({ item }) => (
    <ItemCard
      item={item}
      onPress={() =>
        navigation.navigate('Detail', {
          id: item.id,
          name: `${item.code} · ${item.name}`,
        })
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
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>No hay máquinas registradas</Text>
            <Text style={styles.emptyText}>
              Toca el botón «+» de arriba para registrar la primera máquina.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.countLabel}>
              {machines.length} máquina{machines.length !== 1 ? 's' : ''} en inventario
            </Text>
            <Text style={styles.hint}>Tira hacia abajo para actualizar</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
  separator: { height: SPACING.sm },
  header: { marginBottom: SPACING.md, gap: SPACING.xs },
  countLabel: {
    ...TYPOGRAPHY.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hint: { ...TYPOGRAPHY.label, textTransform: 'none', letterSpacing: 0 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: { fontSize: 22 },
  cardContent: { flex: 1, gap: SPACING.xs },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardTitle: { ...TYPOGRAPHY.body, fontWeight: '600', flexShrink: 1 },
  cardSubtitle: { ...TYPOGRAPHY.caption },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPrice: { ...TYPOGRAPHY.caption, color: COLORS.accent, fontWeight: '600' },
  cardStock: { ...TYPOGRAPHY.label },
  track: {
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  fill: { height: 4, borderRadius: RADIUS.full },
  badge: {
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 1,
  },
  badgeText: { fontSize: 10, fontWeight: '600' },
  chevron: { ...TYPOGRAPHY.h2, color: COLORS.textMuted },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  loadingText: { ...TYPOGRAPHY.caption },
  errorText: { ...TYPOGRAPHY.h3, color: COLORS.error, textAlign: 'center' },
  errorDetail: { ...TYPOGRAPHY.caption, textAlign: 'center' },
  retryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryButtonText: { ...TYPOGRAPHY.body, color: COLORS.background, fontWeight: '600' },
  emptyTitle: { ...TYPOGRAPHY.h3, textAlign: 'center' },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center' },
});