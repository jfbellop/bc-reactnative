// src/components/AnimatedCard.tsx
// Tarjeta del inventario con feedback táctil de resorte (Animated.spring).
//
//   onPressIn  → se comprime a 0.95 (da la sensación de "hundirse")
//   onPressOut → vuelve a 1 con rebote natural (tension/friction)
//
// useNativeDriver: true → 'transform' sí lo puede animar el hilo nativo,
// así que el feedback se siente incluso si JS está ocupado.

import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { COLORS, RADII } from '../theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Escala mínima al presionar (0.95 por defecto) */
  pressedScale?: number;
  disabled?: boolean;
}

export function AnimatedCard({
  children,
  onPress,
  style,
  pressedScale = 0.95,
  disabled = false,
}: AnimatedCardProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (): void => {
    Animated.spring(scaleAnim, {
      toValue: pressedScale,
      speed: 40, // respuesta rápida al toque
      bounciness: 0, // al hundir no debe rebotar
      useNativeDriver: true,
    }).start();

    Animated.timing(elevationAnim, {
      toValue: 0.6,
      duration: 120,
      useNativeDriver: true, // se usa como opacity de la sombra simulada
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300, // resorte rígido…
      friction: 10, // …con poca amortiguación → pequeño rebote
      useNativeDriver: true,
    }).start();

    Animated.timing(elevationAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[styles.card, style, { transform: [{ scale: scaleAnim }] }]}
    >
      {/* Sombra simulada que se atenúa al presionar la tarjeta */}
      <Animated.View pointerEvents="none" style={[styles.glow, { opacity: elevationAnim }]} />

      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.pressable}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    height: 1,
    backgroundColor: COLORS.accent,
  },
  pressable: { padding: 16, gap: 8 },
});