// src/screens/SettingsScreen.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
// Pantalla clave de la semana 07:
//   · Preferencias persistidas con MMKV (sin botón de guardar)
//   · Dato sensible cifrado con Expo SecureStore (código de acceso técnico)

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { PREF_KEYS, usePreferences } from '../hooks/usePreferences';
import { storageBackend, storageReady, useMMKVBoolean } from '../storage/mmkv';
import { ITEMS_PER_PAGE_OPTIONS } from '../utils/machine';
import {
  deleteAccessCode,
  generateAccessCode,
  hasAccessCode,
  maskAccessCode,
  readAccessCode,
  saveAccessCode,
} from '../services/accessCode';
import { useQueryClient } from '@tanstack/react-query';
import { clearMachinesCache, ITEMS_QUERY_KEY } from '../hooks/useItems';

// Preferencia exclusiva de esta pantalla, para demostrar que MMKV sirve en
// cualquier componente (no solo dentro de usePreferences).
const AUTO_REFRESH_KEY = 'pref_autoRefresh';

export function SettingsScreen(): React.JSX.Element {
  const {
    sortOrder,
    toggleSortOrder,
    compactMode,
    setCompactMode,
    itemsPerPage,
    setItemsPerPage,
    lowStockOnly,
    setLowStockOnly,
    resetPreferences,
  } = usePreferences();

  const [autoRefresh, setAutoRefresh] = useMMKVBoolean(AUTO_REFRESH_KEY);
  const queryClient = useQueryClient();

  // ── Estado del dato sensible (SecureStore) ─────────────────
  const [hasCode, setHasCode] = useState(false);
  const [maskedCode, setMaskedCode] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // Al volver a la pantalla comprobamos si ya existe un código guardado.
  // El catch cubre el caso de entornos sin almacén seguro (p. ej. web).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      hasAccessCode()
        .then((exists) => {
          if (active) setHasCode(exists);
        })
        .catch(() => {
          if (active) setHasCode(false);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  async function handleGenerateAndSave(): Promise<void> {
    setIsBusy(true);
    try {
      // El código se genera al momento: nunca está escrito en el código fuente.
      const code = generateAccessCode();
      const info = await saveAccessCode(code);
      setHasCode(true);
      setSavedAt(info.savedAt);
      setMaskedCode(null); // no mostramos el valor recién guardado
      Alert.alert(
        'Código guardado',
        `Se cifró un nuevo código de acceso con SecureStore.\n\nVista previa: ${info.masked}`
      );
    } catch (error) {
      Alert.alert('Error', `No se pudo guardar en SecureStore: ${(error as Error).message}`);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRead(): Promise<void> {
    setIsBusy(true);
    try {
      const stored = await readAccessCode();
      if (!stored) {
        Alert.alert('Sin datos', 'Todavía no hay un código guardado en SecureStore.');
        return;
      }
      // El valor completo NUNCA se muestra: solo una versión enmascarada.
      setMaskedCode(maskAccessCode(stored.code));
      setSavedAt(stored.savedAt);
    } catch (error) {
      Alert.alert('Error', `No se pudo leer de SecureStore: ${(error as Error).message}`);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(): Promise<void> {
    setIsBusy(true);
    try {
      await deleteAccessCode();
      setHasCode(false);
      setMaskedCode(null);
      setSavedAt(null);
      Alert.alert('Eliminado', 'El código de acceso se borró de SecureStore.');
    } catch (error) {
      Alert.alert('Error', `No se pudo eliminar: ${(error as Error).message}`);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleClearCache(): Promise<void> {
    await clearMachinesCache();
    await queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    Alert.alert('Caché borrada', 'Se eliminó la copia offline del inventario.');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ───────────────────────────────────────────────
          SECCIÓN 1 — Preferencias (MMKV)
      ─────────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Preferencias de la app</Text>
      <Text style={styles.sectionHint}>
        Se guardan con MMKV (sincrónico, sin await). Cambian en tiempo real, sin
        botón "Guardar", y sobreviven al cierre de la app.
      </Text>

      {/* Orden de la lista */}
      <View style={[styles.row, styles.rowColumn]}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>Orden del inventario</Text>
          <Text style={styles.rowDesc}>
            Clave MMKV: <Text style={styles.mono}>{PREF_KEYS.SORT_ORDER}</Text>
          </Text>
        </View>
        <View style={styles.segmented}>
          {(['asc', 'desc'] as const).map((order) => (
            <Pressable
              key={order}
              onPress={() => sortOrder !== order && toggleSortOrder()}
              style={[styles.segment, sortOrder === order && styles.segmentActive]}
            >
              <Text
                style={[
                  styles.segmentText,
                  sortOrder === order && styles.segmentTextActive,
                ]}
              >
                {order === 'asc' ? 'A → Z' : 'Z → A'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Modo compacto */}
      <View style={styles.row}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>Modo compacto</Text>
          <Text style={styles.rowDesc}>
            Muestra menos información por máquina en la lista
          </Text>
        </View>
        <Switch
          value={compactMode}
          onValueChange={setCompactMode}
          trackColor={{ false: COLORS.border, true: COLORS.accent }}
          thumbColor={COLORS.textPrimary}
        />
      </View>

      {/* Solo máquinas que requieren recarga (preferencia del dominio) */}
      <View style={styles.row}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>Solo máquinas por recargar</Text>
          <Text style={styles.rowDesc}>
            Filtra las que están agotadas o con stock bajo
          </Text>
        </View>
        <Switch
          value={lowStockOnly}
          onValueChange={setLowStockOnly}
          trackColor={{ false: COLORS.border, true: COLORS.warning }}
          thumbColor={COLORS.textPrimary}
        />
      </View>

      {/* Máquinas por página */}
      <View style={[styles.row, styles.rowColumn]}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>Máquinas por página</Text>
          <Text style={styles.rowDesc}>0 = mostrar todas</Text>
        </View>
        <View style={styles.segmented}>
          {ITEMS_PER_PAGE_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setItemsPerPage(option)}
              style={[
                styles.segment,
                itemsPerPage === option && styles.segmentActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  itemsPerPage === option && styles.segmentTextActive,
                ]}
              >
                {option === 0 ? 'Todas' : option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Preferencia local de esta pantalla */}
      <View style={styles.row}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>Sincronización automática</Text>
          <Text style={styles.rowDesc}>
            Preferencia usada solo aquí · clave{' '}
            <Text style={styles.mono}>{AUTO_REFRESH_KEY}</Text>
          </Text>
        </View>
        <Switch
          value={autoRefresh ?? false}
          onValueChange={setAutoRefresh}
          trackColor={{ false: COLORS.border, true: COLORS.accent }}
          thumbColor={COLORS.textPrimary}
        />
      </View>

      <Pressable style={styles.resetBtn} onPress={resetPreferences}>
        <Text style={styles.resetText}>Restablecer preferencias (borra las claves MMKV)</Text>
      </Pressable>

      {/* ───────────────────────────────────────────────
          SECCIÓN 2 — Caché offline (AsyncStorage)
      ─────────────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>
        Caché sin conexión
      </Text>
      <Text style={styles.sectionHint}>
        El inventario se guarda en AsyncStorage para poder mostrarlo sin red.
      </Text>
      <Pressable style={styles.secondaryBtn} onPress={handleClearCache}>
        <Text style={styles.secondaryBtnText}>🗑️ Borrar caché del inventario</Text>
      </Pressable>

      {/* ───────────────────────────────────────────────
          SECCIÓN 3 — Datos sensibles (SecureStore)
      ─────────────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>
        Datos sensibles (SecureStore)
      </Text>
      <Text style={styles.sectionHint}>
        El código de acceso técnico se cifra en Keychain (iOS) / Keystore
        (Android). Nunca se muestra completo en pantalla ni se guarda en
        AsyncStorage o MMKV.
      </Text>

      <View style={styles.statusRow}>
        <Text style={styles.rowDesc}>
          Estado:{' '}
          <Text style={{ color: hasCode ? COLORS.success : COLORS.textSecondary, fontWeight: '700' }}>
            {hasCode ? 'código guardado' : 'sin código guardado'}
          </Text>
        </Text>
        {savedAt && (
          <Text style={styles.rowDesc}>
            Guardado: {new Date(savedAt).toLocaleString()}
          </Text>
        )}
      </View>

      {maskedCode && (
        <View style={styles.maskedContainer}>
          <Text style={styles.rowLabel}>Valor leído (enmascarado)</Text>
          <Text style={styles.maskedValue}>{maskedCode}</Text>
        </View>
      )}

      <View style={styles.secureActions}>
        <Pressable
          style={[styles.btnSecure, isBusy && styles.btnDisabled]}
          onPress={handleGenerateAndSave}
          disabled={isBusy}
        >
          <Text style={styles.btnSecureText}>💾 Generar y guardar</Text>
        </Pressable>
        <Pressable
          style={[styles.btnSecure, styles.btnSecureAlt, isBusy && styles.btnDisabled]}
          onPress={handleRead}
          disabled={isBusy}
        >
          <Text style={[styles.btnSecureText, { color: COLORS.accent }]}>🔍 Leer</Text>
        </Pressable>
        <Pressable
          style={[styles.btnSecure, styles.btnDanger, isBusy && styles.btnDisabled]}
          onPress={handleDelete}
          disabled={isBusy}
        >
          <Text style={[styles.btnSecureText, { color: COLORS.error }]}>🗑️ Eliminar</Text>
        </Pressable>
      </View>

      {isBusy && <ActivityIndicator color={COLORS.accent} style={{ marginTop: SPACING.sm }} />}

      {/* ───────────────────────────────────────────────
          Info técnica
      ─────────────────────────────────────────────── */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 <Text style={{ fontWeight: '700' }}>Motor de almacenamiento:</Text>{' '}
          {storageBackend === 'mmkv'
            ? 'MMKV nativo (Nitro/JSI) — build nativo detectado.'
            : 'modo compatibilidad sincrónico sobre AsyncStorage (Expo Go/web). En un dev build (pnpm expo run:android) se usa MMKV nativo automáticamente.'}
        </Text>
      </View>
    </ScrollView>
  );
}

// ──────────────────────────────────────────────
// ESTILOS
// ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.sm },

  sectionTitle: { ...TYPOGRAPHY.h3, marginBottom: SPACING.xs },
  sectionHint: { ...TYPOGRAPHY.caption, marginBottom: SPACING.md, fontStyle: 'italic' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  rowColumn: { flexDirection: 'column', alignItems: 'flex-start', gap: SPACING.sm },
  rowInfo: { flex: 1, marginRight: SPACING.md },
  rowLabel: { ...TYPOGRAPHY.body, fontWeight: '600' },
  rowDesc: { ...TYPOGRAPHY.caption, marginTop: 2 },
  mono: { ...TYPOGRAPHY.mono, fontSize: 12 },

  segmented: { flexDirection: 'row', gap: SPACING.xs },
  segment: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  segmentActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  segmentText: { ...TYPOGRAPHY.caption },
  segmentTextActive: { color: COLORS.background, fontWeight: '700' },

  resetBtn: { padding: SPACING.sm, alignItems: 'center' },
  resetText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },

  secondaryBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  secondaryBtnText: { ...TYPOGRAPHY.caption, fontWeight: '600' },

  statusRow: { gap: SPACING.xs, marginBottom: SPACING.sm },
  maskedContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  maskedValue: { ...TYPOGRAPHY.mono, fontSize: 18, color: COLORS.accent, fontWeight: '700' },

  secureActions: { flexDirection: 'row', gap: SPACING.sm },
  btnSecure: {
    flex: 1,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  btnSecureAlt: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  btnDanger: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  btnDisabled: { opacity: 0.5 },
  btnSecureText: { ...TYPOGRAPHY.caption, fontWeight: '700', color: COLORS.background },

  infoBox: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    borderRadius: RADIUS.xs,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  infoText: { ...TYPOGRAPHY.caption },
});