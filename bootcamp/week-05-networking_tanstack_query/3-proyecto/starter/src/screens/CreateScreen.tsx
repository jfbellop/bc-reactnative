// src/screens/CreateScreen.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
// Formulario que registra una máquina nueva con useMutation (POST + invalidate).

import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import {
  MACHINE_CATEGORIES,
  MACHINE_STATUSES,
  type MachineCategory,
  type MachineStatus,
} from '../types';
import type { RootStackParamList } from '../navigation/types';
import { useCreateItem } from '../hooks/useItems';

type CreateNavProp = NativeStackNavigationProp<RootStackParamList, 'Create'>;

interface ChipsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: ChipsProps<T>): React.JSX.Element {
  return (
    <View style={styles.chipsRow}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CreateScreen(): React.JSX.Element {
  const navigation = useNavigation<CreateNavProp>();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<MachineCategory>('Snacks');
  const [status, setStatus] = useState<MachineStatus>('Operativa');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');

  const { mutate: createItem, isPending } = useCreateItem();

  const canSubmit =
    name.trim().length > 0 &&
    location.trim().length > 0 &&
    price.trim().length > 0 &&
    !isPending;

  function handleSubmit(): void {
    if (!canSubmit) return;

    createItem(
      {
        name,
        location,
        category,
        status,
        price: Number(price.replace(/[^\d]/g, '')),
        stock: Number(stock.replace(/[^\d]/g, '') || '0'),
        description,
      },
      {
        onSuccess: () => navigation.goBack(),
      }
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Datos de la nueva máquina</Text>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>
            Nombre de la máquina <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Snacks Recepción"
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="next"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>
            Ubicación <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ej: Torre A · Piso 1"
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="next"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Categoría</Text>
          <Chips options={MACHINE_CATEGORIES} value={category} onChange={setCategory} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Estado</Text>
          <Chips options={MACHINE_STATUSES} value={status} onChange={setStatus} />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.fieldLabel}>
              Tarifa (COP) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="2500"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
            />
          </View>

          <View style={[styles.field, styles.half]}>
            <Text style={styles.fieldLabel}>Unidades cargadas</Text>
            <TextInput
              style={styles.input}
              value={stock}
              onChangeText={setStock}
              placeholder="40"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Notas de reposición</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: reposición los lunes y jueves a las 7:00 a.m."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <Text style={styles.buttonText}>
              {isPending ? 'Registrando…' : 'Registrar máquina'}
            </Text>
          )}
        </Pressable>

        <Text style={styles.helper}>
          El nombre, la ubicación y la tarifa son obligatorios.
        </Text>

        <Pressable style={styles.cancel} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl },
  sectionLabel: { ...TYPOGRAPHY.label, textTransform: 'uppercase', letterSpacing: 0.8 },
  field: { gap: SPACING.xs },
  fieldLabel: { ...TYPOGRAPHY.body, fontWeight: '600' },
  required: { color: COLORS.error },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  multiline: { minHeight: 96, paddingTop: SPACING.sm },
  row: { flexDirection: 'row', gap: SPACING.md },
  half: { flex: 1 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  chipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.surface },
  chipText: { ...TYPOGRAPHY.caption },
  chipTextActive: { color: COLORS.accent, fontWeight: '600' },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.background },
  helper: { ...TYPOGRAPHY.label, textTransform: 'none', letterSpacing: 0 },
  cancel: { alignItems: 'center', padding: SPACING.sm },
  cancelText: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
});