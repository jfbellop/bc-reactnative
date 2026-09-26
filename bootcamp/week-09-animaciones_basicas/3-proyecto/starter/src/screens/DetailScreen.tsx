// src/screens/DetailScreen.tsx
// Detalle de una máquina: aquí se ven las animaciones "de acción":
//
//   1) Entrada de la pantalla: Animated.parallel (opacity 0→1 + translateY 30→0)
//   2) Entrada de las tarjetas internas: Animated.stagger (cascada)
//   3) Spinner de recarga: Animated.loop + interpolate ('0deg' → '360deg')
//   4) Secuencia de recarga: Animated.sequence (pulso → espera → vuelve)
//   5) Barra de progreso que sube/baja al recargar o simular consumo (interpolate)

import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AnimatedButton } from '../components/AnimatedButton';
import { ProgressBar } from '../components/ProgressBar';
import { StockBadge } from '../components/StockBadge';
import { useMachineById, useMachinesStore } from '../store/machinesStore';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../theme';
import { formatCop, getFill, getMachineStatus, getMetrics } from '../utils/machine';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const REFILL_DEMO_MS = 1400;

export function DetailScreen({ route, navigation }: Props): React.JSX.Element {
  const { machineId } = route.params;
  const machine = useMachineById(machineId);
  const refill = useMachinesStore((state) => state.refill);
  const consume = useMachinesStore((state) => state.consume);

  const [isRefilling, setIsRefilling] = useState(false);

  // ── Animación de entrada ────────────────────────────────────────────────
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;

  // ── Animación de las tarjetas internas (cascada) ────────────────────────
  const sectionAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  // ── Spinner de recarga ──────────────────────────────────────────────────
  const spinAnim = useRef(new Animated.Value(0)).current;

  // ── Pulso de la tarjeta al recargar (sequence) ──────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // parallel: fade in + slide up AL MISMO TIEMPO (500 ms, como pide el README)
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // stagger: las tarjetas internas entran 90 ms después una de otra
    Animated.stagger(
      90,
      sectionAnims.map((anim) =>
        Animated.timing(anim, { toValue: 1, duration: 380, useNativeDriver: true })
      )
    ).start();
  }, [opacityAnim, translateYAnim, sectionAnims]);

  // loop: rotación continua 0 → 360° mientras se "recarga"
  useEffect(() => {
    if (!isRefilling) {
      spinAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 900, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [isRefilling, spinAnim]);

  if (!machine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.missing}>
          <Text style={styles.missingText}>Esta máquina ya no está en el inventario</Text>
          <AnimatedButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const metrics = getMetrics(machine);
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  /** sequence: pulso de la tarjeta → recarga → vuelve a su estado normal */
  const handleRefill = (): void => {
    setIsRefilling(true);
    Animated.sequence([
      Animated.spring(pulseAnim, { toValue: 1.04, speed: 30, bounciness: 8, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      refill(machine.id); // el estado cambia → la ProgressBar y el StockBadge animan
      setIsRefilling(false);
    }, REFILL_DEMO_MS);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            gap: SPACING.md,
            opacity: opacityAnim,
            transform: [{ translateY: translateYAnim }],
          }}
        >
          {/* ── Identificación de la máquina ──────────────────────────── */}
          <Animated.View style={wrap(sectionAnims[0], 24)}>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.code}>{machine.code}</Text>
                <StockBadge status={getMachineStatus(machine.stock)} />
              </View>
              <Text style={styles.name}>{machine.name}</Text>
              <Text style={styles.location}>
                {machine.zone} — {machine.location}
              </Text>
              <Text style={styles.price}>{formatCop(machine.price)} por producto</Text>
            </View>
          </Animated.View>

          {/* ── Nivel de carga (animado) ──────────────────────────────── */}
          <Animated.View style={wrap(sectionAnims[1], 24)}>
            <Animated.View style={[styles.card, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Nivel de carga</Text>
                {isRefilling ? (
                  <Animated.Text style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
                    ⚙️
                  </Animated.Text>
                ) : null}
              </View>

              <ProgressBar
                progress={getFill(machine)}
                label={`${machine.stock} de ${machine.capacity} unidades`}
                duration={650}
              />

              <View style={styles.metricsRow}>
                <Metric label="Faltan" value={`${metrics.unitsMissing} uds`} />
                <Metric label="Uso diario" value={`${metrics.dailyUse} uds`} />
                <Metric label="Días restantes" value={`${metrics.daysToEmpty}`} />
              </View>

              <View style={styles.actions}>
                <AnimatedButton
                  label={isRefilling ? 'Recargando…' : '🔄 Recargar a 100 %'}
                  variant="success"
                  loading={isRefilling}
                  disabled={isRefilling || machine.stock === machine.capacity}
                  onPress={handleRefill}
                />
                <AnimatedButton
                  label="📉 Simular consumo (10 uds)"
                  variant="ghost"
                  disabled={isRefilling || machine.stock === 0}
                  onPress={() => consume(machine.id, 10)}
                />
              </View>
              <Text style={styles.tip}>
                La barra interpola ancho y color (rojo → amarillo → verde) según la carga.
              </Text>
            </Animated.View>
          </Animated.View>

          {/* ── Ficha técnica ─────────────────────────────────────────── */}
          <Animated.View style={wrap(sectionAnims[2], 24)}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Ficha técnica</Text>
              <DetailRow label="Código" value={machine.code} />
              <DetailRow label="Zona" value={machine.zone} />
              <DetailRow label="Ubicación" value={machine.location} />
              <DetailRow label="Capacidad" value={`${machine.capacity} unidades`} />
              <DetailRow label="Última recarga" value={machine.lastRefill} />
              <DetailRow label="Tarifa" value={formatCop(machine.price)} />
            </View>
          </Animated.View>

          <AnimatedButton label="← Volver al inventario" variant="ghost" onPress={() => navigation.goBack()} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Estilo compartido por las tarjetas internas: fade + slide en cascada. */
function wrap(anim: Animated.Value, distance: number): { opacity: Animated.Value; transform: { translateY: Animated.AnimatedInterpolation<string | number> }[] } {
  return {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
    ],
  };
}

function Metric({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { ...TYPOGRAPHY.caption, color: COLORS.accent, fontWeight: '700' },
  name: { ...TYPOGRAPHY.h1, fontSize: 22 },
  location: { ...TYPOGRAPHY.caption },
  price: { ...TYPOGRAPHY.body, color: COLORS.accent, fontWeight: '600' },
  sectionTitle: { ...TYPOGRAPHY.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  spinner: { fontSize: 20 },
  metricsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  metric: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    alignItems: 'center',
    gap: 2,
  },
  metricValue: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  metricLabel: { ...TYPOGRAPHY.tiny, textAlign: 'center' },
  actions: { gap: SPACING.sm, marginTop: SPACING.sm },
  tip: { ...TYPOGRAPHY.tiny, fontStyle: 'italic' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: { ...TYPOGRAPHY.caption },
  detailValue: { ...TYPOGRAPHY.body, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  missingText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
});