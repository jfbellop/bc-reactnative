// src/components/AnimatedButton.tsx
// Botón con doble animación de feedback:
//   onPressIn  → Animated.timing corto (80 ms) a 0.96  → respuesta inmediata
//   onPressOut → Animated.spring (tension 400 / friction 12) de vuelta a 1 → rebote
//
// Es la combinación típica: timing para el "ataque" (rápido y exacto) y spring
// para la "relajación" (natural, con inercia).

import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text } from 'react-native';

import { COLORS, RADII } from '../theme';

type Variant = 'primary' | 'success' | 'danger' | 'ghost';

interface AnimatedButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
}

const BACKGROUNDS: Record<Variant, string> = {
  primary: COLORS.primary,
  success: COLORS.success,
  danger: COLORS.error,
  ghost: 'transparent',
};

export function AnimatedButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  compact = false,
}: AnimatedButtonProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = (): void => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 400,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: isDisabled ? 0.5 : 1 }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          compact && styles.compact,
          { backgroundColor: BACKGROUNDS[variant] },
          variant === 'ghost' && styles.ghost,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variant === 'ghost' ? COLORS.text : '#fff'} />
        ) : (
          <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADII.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { paddingVertical: 9, paddingHorizontal: 14 },
  ghost: { borderWidth: 1, borderColor: COLORS.border },
  label: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  ghostLabel: { color: COLORS.textSecondary },
});