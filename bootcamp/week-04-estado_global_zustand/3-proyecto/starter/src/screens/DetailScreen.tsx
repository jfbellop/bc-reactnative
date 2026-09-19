// src/screens/DetailScreen.tsx
// Dominio: Máquinas Expendedoras

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { HomeStackParamList } from '../navigation/types';
import { useSavedStore } from '../stores/savedStore';
import { ITEMS } from '../data/mockData';

type DetailRouteProp = RouteProp<HomeStackParamList, 'HomeDetail'>;

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

export function DetailScreen(): React.JSX.Element {
  const route = useRoute<DetailRouteProp>();
  const { id, name } = route.params;

  const item = ITEMS.find((i) => i.id === id);

  const isItemSaved = useSavedStore((state) => state.isItemSaved);
  const addItem = useSavedStore((state) => state.addItem);
  const removeItem = useSavedStore((state) => state.removeItem);

  const isSaved = isItemSaved(id);

  const handleToggleSave = (): void => {
    if (isSaved) {
      removeItem(id);
    } else if (item) {
      addItem(item);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroLetter}>{name.charAt(0)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.id}>ID: {id}</Text>

        {item && (
          <>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Categoría</Text>
              <Text style={styles.fieldValue}>{item.category}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Ubicación</Text>
              <Text style={styles.fieldValue}>{item.location}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Estado</Text>
              <Text style={styles.fieldValue}>{item.status}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Stock</Text>
              <Text style={styles.fieldValue}>
                {item.currentStock}/{item.capacity} unidades
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Ingreso diario</Text>
              <Text style={styles.fieldValue}>
                {formatCOP(item.dailyRevenue)}
              </Text>
            </View>
          </>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          isSaved && styles.saveButtonActive,
          pressed && styles.saveButtonPressed,
        ]}
        onPress={handleToggleSave}
        testID="save-button"
      >
        <Text style={[styles.saveButtonText, isSaved && styles.saveButtonTextActive]}>
          {isSaved ? '★  Guardado' : '☆  Guardar'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  hero: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  heroLetter: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.accent,
  },
  info: {
    gap: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h2,
  },
  id: {
    ...TYPOGRAPHY.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  field: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldLabel: {
    ...TYPOGRAPHY.label,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  fieldValue: {
    ...TYPOGRAPHY.body,
  },
  saveButton: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: 'auto',
  },
  saveButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  saveButtonPressed: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButtonTextActive: {
    color: COLORS.background,
  },
});