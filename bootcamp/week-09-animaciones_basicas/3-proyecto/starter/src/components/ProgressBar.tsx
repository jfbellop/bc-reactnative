// src/components/ProgressBar.tsx
// Nivel de carga de la máquina animado con interpolate.
//
// ⚠️ useNativeDriver: false — 'width' y 'backgroundColor' son propiedades de
// LAYOUT/PINTURA, no de transformación, así que no las puede animar el hilo
// nativo. Para opacity/transform (ver AnimatedCard) siempre va en true.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADII, SPACING } from '../theme';

interface ProgressBarProps {
  /** Progreso entre 0 y 1 */
  progress: number;
  label?: string;
  /** Duración de la animación en ms */
  duration?: number;
  /** Color interpolado (rojo → amarillo → verde). Si se omiten showColors/colors, usa un color fijo. */
  colors?: readonly [string, string, string];
  /** Muestra el porcentaje a la derecha del label */
  showPercentage?: boolean;
  height?: number;
}

export function ProgressBar({
  progress,
  label,
  duration = 800,
  colors = [COLORS.error, COLORS.warning, COLORS.success],
  showPercentage = true,
  height = 10,
}: ProgressBarProps): React.JSX.Element {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // timing (no spring) porque el ancho debe llegar EXACTO al valor real:
    // un spring se pasaría del 100 % y la barra "rebotaría" fuera del carril.
    Animated.timing(progressAnim, {
      toValue: progress,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width + backgroundColor
    }).start();
  }, [progress, progressAnim, duration]);

  // PASO interpolate #1: valor numérico → porcentaje de ancho.
  const widthInterp = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp', // si el valor se sale de 0–1, la barra no se desborda
  });

  // PASO interpolate #2: el color cambia con el mismo valor (3 puntos de control).
  const colorInterp = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [colors[0], colors[1], colors[2]],
    extrapolate: 'clamp',
  });

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      {label !== undefined && (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage ? <Text style={styles.percentage}>{percentage}%</Text> : null}
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            { height, borderRadius: height / 2, width: widthInterp, backgroundColor: colorInterp },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.xs + 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: COLORS.textSecondary, fontSize: 12 },
  percentage: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  track: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fill: { backgroundColor: COLORS.error },
});