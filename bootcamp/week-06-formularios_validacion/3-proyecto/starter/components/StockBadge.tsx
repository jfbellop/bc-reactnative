// src/components/StockBadge.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
// Badge con el estado operativo derivado del stock de la máquina.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RADIUS, SPACING } from '../theme';
import { getMachineStatus, MACHINE_STATUS } from '../utils/machine';

interface StockBadgeProps {
  stock: number;
}

export function StockBadge({ stock }: StockBadgeProps): React.JSX.Element {
  const { label, color } = MACHINE_STATUS[getMachineStatus(stock)];

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '600' },
});
