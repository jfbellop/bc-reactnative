// src/screens/DetailScreen.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
// Detalle de una máquina: todos los campos del dominio.

import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { useItemById } from '../hooks/useItems';
import { CATEGORY_ICONS, STATUS_COLORS, fillPercent, formatCop } from '../utils/machine';

type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;

interface FieldProps {
  label: string;
  value: string;
}

function Field({ label, value }: FieldProps): React.JSX.Element {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export function DetailScreen(): React.JSX.Element {
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;

  const { data: item, isLoading, isError, refetch } = useItemById(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando la máquina…</Text>
      </View>
    );
  }

  if (isError || !item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se pudo cargar el detalle</Text>
        <Text style={styles.errorDetail}>
          La máquina no está disponible en este momento.
        </Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[item.status];
  const carga = fillPercent(item.stock, item.capacity);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Encabezado */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroEmoji}>{CATEGORY_ICONS[item.category]}</Text>
        </View>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.idBadge}>{item.code}</Text>
        <View style={[styles.statusBadge, { borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>

      {/* Nivel de carga */}
      <View style={styles.fieldsCard}>
        <Text style={styles.fieldLabel}>NIVEL DE CARGA</Text>
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${carga}%`, backgroundColor: statusColor }]}
          />
        </View>
        <Text style={styles.fieldValue}>
          {item.stock} de {item.capacity} unidades ({carga}%)
        </Text>
      </View>

      {/* Datos de la máquina */}
      <View style={styles.fieldsCard}>
        <Field label="CÓDIGO" value={item.code} />
        <Field label="UBICACIÓN" value={item.location} />
        <Field label="CATEGORÍA" value={item.category} />
        <Field label="ESTADO" value={item.status} />
        <Field label="TARIFA POR PRODUCTO" value={formatCop(item.price)} />
        <Field label="UNIDADES DISPONIBLES" value={`${item.stock} uds`} />
        <Field label="CAPACIDAD MÁXIMA" value={`${item.capacity} uds`} />
      </View>

      {/* Descripción */}
      <View style={styles.fieldsCard}>
        <Text style={styles.fieldLabel}>DESCRIPCIÓN Y NOTAS</Text>
        <Text style={styles.fieldValue}>
          {item.description || 'Sin notas registradas para esta máquina.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xxl },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  loadingText: { ...TYPOGRAPHY.caption },
  hero: { alignItems: 'center', gap: SPACING.sm },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 40 },
  title: { ...TYPOGRAPHY.h2, textAlign: 'center' },
  idBadge: { ...TYPOGRAPHY.label, textTransform: 'uppercase', letterSpacing: 1 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  fieldsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  fieldLabel: {
    ...TYPOGRAPHY.label,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: { ...TYPOGRAPHY.body, lineHeight: 22 },
  track: {
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: RADIUS.full },
  errorText: { ...TYPOGRAPHY.h3, color: COLORS.error },
  errorDetail: { ...TYPOGRAPHY.caption, textAlign: 'center' },
  retryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryButtonText: { ...TYPOGRAPHY.body, color: COLORS.background, fontWeight: '600' },
});