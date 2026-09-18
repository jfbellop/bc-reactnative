// src/screens/DetailScreen.tsx
// Dominio: Máquinas Expendedoras

import React from 'react';
import type { NativeStackRouteProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { HomeStackParamList } from '../navigation/types';

type DetailScreenRouteProp = NativeStackRouteProp<HomeStackParamList, 'HomeDetail'>;

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

export function DetailScreen(): React.JSX.Element {
  const route = useRoute<DetailScreenRouteProp>();
  const {
    id,
    name,
    description,
    category,
    location,
    status,
    capacity,
    currentStock,
    dailyRevenue,
  } = route.params;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.name}>{name}</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>ID: {id}</Text>
      </View>

      <Text style={styles.description}>{description}</Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Categoría</Text>
        <Text style={styles.fieldValue}>{category}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Ubicación</Text>
        <Text style={styles.fieldValue}>{location}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Estado</Text>
        <Text style={styles.fieldValue}>{status}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Stock</Text>
        <Text style={styles.fieldValue}>
          {currentStock}/{capacity} unidades
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Ingreso diario</Text>
        <Text style={styles.fieldValue}>{formatCOP(dailyRevenue)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.base,
    gap: SPACING.md,
  },
  name: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentDim,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.accent,
  },
  description: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  field: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textPrimary,
  },
});