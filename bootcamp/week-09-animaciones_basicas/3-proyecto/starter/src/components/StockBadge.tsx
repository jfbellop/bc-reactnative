// src/components/StockBadge.tsx
// Badge de estado de la máquina. Cuando el estado CAMBIA (p. ej. al recargar),
// hace un pequeño rebote con Animated.sequence para llamar la atención sobre
// la transición: agotada → operativa.

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADII, SPACING } from '../theme';
import type { MachineStatus } from '../types';
import { STATUS_COLOR, STATUS_LABEL } from '../utils/machine';

interface StockBadgeProps {
  status: MachineStatus;
}

export function StockBadge({ status }: StockBadgeProps): React.JSX.Element {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const previousStatus = useRef(status);

  useEffect(() => {
    if (previousStatus.current === status) return;
    previousStatus.current = status;

    // sequence: crece → se pasa un poco → vuelve a su tamaño.
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.25, speed: 40, bounciness: 0, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, tension: 300, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [status, bounceAnim]);

  const color = STATUS_COLOR[status];

  return (
    <Animated.View
      style={[
        styles.badge,
        { borderColor: color, transform: [{ scale: bounceAnim }] },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{STATUS_LABEL[status]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderRadius: RADII.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '600' },
});