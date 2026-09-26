// src/screens/EditScreen.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
// Edición de una máquina: mismos campos y schema que CreateScreen, con
// defaultValues cargados desde la API mediante reset() en un useEffect.

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { FormField } from '../components/FormField';
import {
  itemSchema,
  type ItemFormData,
  type ItemFormInput,
} from '../schemas/itemSchema';
import { useItemById, useUpdateItem } from '../hooks/useItems';
import {
  formatCop,
  getMachineStatus,
  MACHINE_STATUS,
} from '../utils/machine';

type EditNavProp = NativeStackNavigationProp<RootStackParamList, 'Edit'>;
type EditRouteProp = RouteProp<RootStackParamList, 'Edit'>;

export function EditScreen(): React.JSX.Element {
  const navigation = useNavigation<EditNavProp>();
  const route = useRoute<EditRouteProp>();
  const { id } = route.params;

  const { data: item, isLoading, isError, refetch } = useItemById(id);
  const { mutateAsync: updateItem } = useUpdateItem();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ItemFormInput, unknown, ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: '', description: '', price: '', stock: '' },
  });

  // Cuando llegan los datos, se rellena el formulario de una sola vez.
  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        description: item.description,
        price: item.price,
        stock: item.stock,
      });
    }
  }, [item, reset]);

  async function onSubmit(data: ItemFormData): Promise<void> {
    setSubmitError(null);
    try {
      await updateItem({
        id,
        name: data.name,
        description: data.description ?? '',
        price: data.price,
        stock: data.stock,
      });
      navigation.goBack();
    } catch {
      setSubmitError('No se pudieron guardar los cambios.');
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (isError || !item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ No se pudo cargar la máquina</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const status = MACHINE_STATUS[getMachineStatus(item.stock)];
  const canSubmit = !isSubmitting && isDirty;

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
        <View style={styles.summary}>
          <Text style={styles.summaryTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryPrice}>{formatCop(item.price)}</Text>
            <Text style={styles.summaryStock}>{item.stock} uds</Text>
            <Text style={[styles.summaryStatus, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <FormField
          control={control}
          name="name"
          label="Nombre o código *"
          errorMessage={errors.name?.message}
        />

        <FormField
          control={control}
          name="description"
          label="Ubicación y notas"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          errorMessage={errors.description?.message}
        />

        <FormField
          control={control}
          name="price"
          label="Tarifa por producto (COP) *"
          keyboardType="numeric"
          errorMessage={errors.price?.message}
        />

        <FormField
          control={control}
          name="stock"
          label="Unidades cargadas *"
          keyboardType="number-pad"
          errorMessage={errors.stock?.message}
        />

        {submitError && (
          <View style={styles.bannerError}>
            <Text style={styles.bannerErrorText}>{submitError}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <Text style={styles.buttonText}>Guardar cambios</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.cancel}
            onPress={() => reset()}
            disabled={!isDirty || isSubmitting}
          >
            <Text style={[styles.cancelText, !isDirty && styles.cancelTextDisabled]}>
              Deshacer cambios
            </Text>
          </Pressable>

          <Pressable style={styles.cancel} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Volver al inventario</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.background,
  },
  errorText: { ...TYPOGRAPHY.h3, color: COLORS.error },
  summary: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  summaryTitle: { ...TYPOGRAPHY.h3 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  summaryPrice: { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.accent },
  summaryStock: { ...TYPOGRAPHY.caption, flex: 1 },
  summaryStatus: { ...TYPOGRAPHY.caption, fontWeight: '600' },
  actions: { gap: SPACING.sm, marginTop: SPACING.sm },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.background },
  cancel: { alignItems: 'center', padding: SPACING.sm },
  cancelText: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
  cancelTextDisabled: { opacity: 0.4 },
  retryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryButtonText: { ...TYPOGRAPHY.body, color: COLORS.background, fontWeight: '600' },
  bannerError: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  bannerErrorText: { ...TYPOGRAPHY.caption, color: COLORS.error },
});