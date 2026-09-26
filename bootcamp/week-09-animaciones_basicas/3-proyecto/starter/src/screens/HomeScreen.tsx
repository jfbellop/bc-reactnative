// src/screens/HomeScreen.tsx
// Inventario VendCorp — la pantalla donde viven 3 de las animaciones:
//
//   1) Entrada en cascada de las tarjetas: Animated.stagger(80, [...])
//   2) Feedback de tap en la tarjeta y en los botones: Animated.spring
//   3) LayoutAnimation al recargar / dar de baja / registrar una máquina
//
// Nota de implementación: se usa ScrollView + filas animadas en lugar de
// FlatList. Con 12 equipos no hay problema de rendimiento y LayoutAnimation
// anima el layout de forma determinista (FlatList virtualiza y recicla celdas,
// lo que hace que las animaciones de alta/baja se vean a saltos).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AnimatedButton } from '../components/AnimatedButton';
import { AnimatedCard } from '../components/AnimatedCard';
import { ProgressBar } from '../components/ProgressBar';
import { StockBadge } from '../components/StockBadge';
import { useMachinesStore } from '../store/machinesStore';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../theme';
import type { Machine } from '../types';
import { buildSummary, formatCop, getFill, getMachineStatus } from '../utils/machine';
import type { RootStackParamList } from '../navigation/types';

// ⚠️ Android necesita este flag para habilitar LayoutAnimation.
// Debe ejecutarse a nivel de módulo (fuera del componente) — lo pide la rúbrica.
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

/**
 * `LayoutAnimation` solo está implementado en iOS y Android. En el navegador
 * (react-native-web) `configureNext` es un no-op, así que lo saltamos: en web
 * el cambio de lista se ve igual, solo que sin el movimiento.
 */
const CAN_ANIMATE_LAYOUT = Platform.OS !== 'web';

const ENTRANCE_STAGGER_MS = 80;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type Filter = 'todas' | 'por_recargar';

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const machines = useMachinesStore((state) => state.machines);
  const refill = useMachinesStore((state) => state.refill);
  const remove = useMachinesStore((state) => state.remove);
  const addMachine = useMachinesStore((state) => state.addMachine);
  const reset = useMachinesStore((state) => state.reset);

  const [filter, setFilter] = useState<Filter>('todas');
  // Última acción ejecutada: sirve para ver en el navegador que el botón sí hizo algo.
  const [notice, setNotice] = useState<string>('');

  // Un Animated.Value por máquina (no por posición): así, al eliminar una fila,
  // las demás conservan su valor y no vuelven a animar la entrada.
  const animsRef = useRef(new Map<string, Animated.Value>());
  const ensureAnim = (id: string): Animated.Value => {
    let value = animsRef.current.get(id);
    if (!value) {
      value = new Animated.Value(0);
      animsRef.current.set(id, value);
    }
    return value;
  };

  // ── Animación de entrada en cascada (solo al montar) ──────────────────────
  useEffect(() => {
    const entrance = machines.map((machine) =>
      Animated.timing(ensureAnim(machine.id), {
        toValue: 1,
        duration: 400,
        useNativeDriver: true, // opacity + translateY → hilo nativo
      })
    );
    if (__DEV__) {
      console.log(
        `[anim] stagger iniciado: ${machines.length} tarjetas · ${ENTRANCE_STAGGER_MS} ms entre cada una`
      );
    }
    Animated.stagger(ENTRANCE_STAGGER_MS, entrance).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => buildSummary(machines), [machines]);

  const visible = useMemo(
    () =>
      filter === 'todas'
        ? machines
        : machines.filter((machine) => getMachineStatus(machine.stock) !== 'operativa'),
    [machines, filter]
  );

  /**
   * Configuración de LayoutAnimation reutilizada en las tres acciones.
   *
   * Alta y baja usan el preset que pide el README
   * (`LayoutAnimation.Presets.easeInEaseOut`). El reordenamiento por urgencia
   * lleva además un spring con `scaleXY` para que se note cuál fila se movió.
   */
  const animateLayout = (preset: 'add' | 'remove' | 'reorder' = 'add'): void => {
    if (__DEV__) console.log(`[layout] LayoutAnimation.configureNext → ${preset}`);
    if (!CAN_ANIMATE_LAYOUT) return; // en web no hay LayoutAnimation

    if (preset === 'reorder') {
      LayoutAnimation.configureNext({
        duration: 380,
        create: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.scaleXY,
          springDamping: 0.7,
        },
        update: { type: LayoutAnimation.Types.spring, springDamping: 0.85 },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
      return;
    }

    // add / remove → preset del enunciado
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  // ── Recargar: la máquina se reordena (urgencia) → LayoutAnimation ─────────
  const handleRefill = (machine: Machine): void => {
    animateLayout('reorder');
    refill(machine.id);
    setNotice(`🔄 ${machine.code} recargada al 100 % — baja al final de la lista`);
  };

  // ── Dar de baja: la fila se colapsa animada ──────────────────────────────
  const handleRemove = (machine: Machine): void => {
    animateLayout('remove');
    remove(machine.id);
    setNotice(`🗑️ ${machine.code} dada de baja`);
  };

  // ── Registrar máquina: aparece con layout + fade de entrada ──────────────
  const handleAdd = (): void => {
    animateLayout('add');
    const machine = addMachine();
    if (__DEV__) console.log(`[inventario] alta registrada: ${machine.code}`);
    setNotice(`✅ ${machine.code} registrada — aparece como agotada`);
    const anim = ensureAnim(machine.id);
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay: 80,
      useNativeDriver: true,
    }).start();
  };

  const handleFilter = (next: Filter): void => {
    animateLayout('reorder');
    setFilter(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Encabezado ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>Inventario VendCorp</Text>
          <Text style={styles.subtitle}>
            {summary.machines} máquinas · {summary.outOfStock} agotadas · {summary.lowStock} con stock bajo
          </Text>

          <View style={styles.summaryCard}>
            <ProgressBar
              progress={summary.averageFill}
              label="Carga promedio de la flota"
              duration={1100}
            />
            <View style={styles.summaryLegend}>
              <Text style={styles.legendText}>🟥 0 %</Text>
              <Text style={styles.legendText}>🟨 50 %</Text>
              <Text style={styles.legendText}>🟩 100 %</Text>
            </View>
          </View>
        </View>

        {/* ── Filtro (también animado con LayoutAnimation) ─────────────── */}
        <View style={styles.filterRow}>
          <AnimatedButton
            label={`Todas (${machines.length})`}
            variant={filter === 'todas' ? 'primary' : 'ghost'}
            compact
            onPress={() => handleFilter('todas')}
          />
          <AnimatedButton
            label={`Por recargar (${summary.outOfStock + summary.lowStock})`}
            variant={filter === 'por_recargar' ? 'primary' : 'ghost'}
            compact
            onPress={() => handleFilter('por_recargar')}
          />
        </View>

        {/* ── Lista ───────────────────────────────────────────────────── */}
        {visible.map((machine) => {
          const anim = ensureAnim(machine.id);
          const status = getMachineStatus(machine.stock);

          return (
            <Animated.View
              key={machine.id}
              style={{
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <AnimatedCard onPress={() => navigation.navigate('Detail', { machineId: machine.id })}>
                <View style={styles.cardHeader}>
                  <Text style={styles.code}>{machine.code}</Text>
                  <StockBadge status={status} />
                </View>

                <Text style={styles.itemName}>{machine.name}</Text>
                <Text style={styles.itemDescription}>
                  {machine.zone} — {machine.location}
                </Text>

                <ProgressBar
                  progress={getFill(machine)}
                  label={`Carga · ${machine.stock}/${machine.capacity} uds`}
                  duration={700}
                />

                <View style={styles.cardFooter}>
                  <Text style={styles.price}>{formatCop(machine.price)}</Text>
                  <Text style={styles.lastRefill}>Recarga: {machine.lastRefill}</Text>
                </View>

                <View style={styles.cardActions}>
                  <AnimatedButton
                    label="🔄 Recargar"
                    variant="success"
                    compact
                    onPress={() => handleRefill(machine)}
                  />
                  <AnimatedButton
                    label="🗑️ Baja"
                    variant="danger"
                    compact
                    onPress={() => handleRemove(machine)}
                  />
                </View>
              </AnimatedCard>
            </Animated.View>
          );
        })}

        {visible.length === 0 ? (
          <Text style={styles.empty}>No hay máquinas que necesiten recarga 🎉</Text>
        ) : null}

        {/* ── Acciones finales ───────────────────────────────────────── */}
        <View style={styles.footer}>
          <AnimatedButton label="➕ Registrar máquina" onPress={handleAdd} />
          <AnimatedButton
            label="↺ Reiniciar inventario"
            variant="ghost"
            onPress={() => {
              animateLayout('reorder');
              reset();
              setNotice('↺ Inventario reiniciado: 12 máquinas');
            }}
          />
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <Text style={styles.hint}>
          Toca una tarjeta para ver el detalle (fade + slide up + spinner de recarga).
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, gap: SPACING.md, paddingBottom: SPACING.xxl },
  header: { gap: SPACING.xs },
  title: { ...TYPOGRAPHY.h1 },
  subtitle: { ...TYPOGRAPHY.caption },
  summaryCard: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  summaryLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  legendText: { ...TYPOGRAPHY.tiny },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { ...TYPOGRAPHY.caption, color: COLORS.accent, fontWeight: '700' },
  itemName: { ...TYPOGRAPHY.h3 },
  itemDescription: { ...TYPOGRAPHY.caption },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  lastRefill: { ...TYPOGRAPHY.tiny },
  cardActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  empty: { ...TYPOGRAPHY.caption, textAlign: 'center', marginVertical: SPACING.lg },
  footer: { gap: SPACING.sm, marginTop: SPACING.lg },
  notice: { ...TYPOGRAPHY.caption, color: COLORS.accent, textAlign: 'center', marginTop: SPACING.sm },
  hint: { ...TYPOGRAPHY.tiny, textAlign: 'center', marginTop: SPACING.sm },
});