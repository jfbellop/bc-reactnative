// src/screens/EditScreen.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
// Edita una máquina existente. Reutiliza el MISMO schema Zod y el MISMO
// FormField que CreateScreen; lo único distinto es que los valores iniciales
// se cargan desde la API con reset() dentro de un useEffect.

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
import { StockBadge } from '../components/StockBadge';
import { formatCop } from '../utils/machine';

type EditNavProp = NativeStackNavigationProp<RootStackParamList, 'Edit'>;
type EditRouteProp = RouteProp<RootStackParamList, 'Edit'>;

// ──────────────────────────────────────────────
// PANTALLA
// ──────────────────────────────────────────────

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

  // Patrón clave de la semana: cuando llegan los datos del servidor,
  // rellenamos el formulario con reset(). Es más eficiente que setValue campo
  // a campo y además deja isDirty en false (el botón Guardar arranca apagado).
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
      setSubmitError('No se pudieron guardar los cambios. Intenta de nuevo.');
    }
  }

  // Mientras llega la máquina desde la API mostramos un spinner.
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando datos de la máquina...</Text>
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
            <StockBadge stock={item.stock} />
          </View>
        </View>

        <FormField
          control={control}
          name="name"
          label="Nombre o código *"
          placeholder="Ej: VM-014 · Snacks Torre C"
          returnKeyType="next"
          errorMessage={errors.name?.message}
        />

        <FormField
          control={control}
          name="description"
          label="Ubicación y notas"
          placeholder="Ej: Torre C — Piso 3, junto a la cafetería"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          errorMessage={errors.description?.message}
        />

        <FormField
          control={control}
          name="price"
          label="Tarifa por producto (COP) *"
          placeholder="2500"
          keyboardType="numeric"
          errorMessage={errors.price?.message}
          hint="Sin puntos ni símbolos: 2500"
        />

        <FormField
          control={control}
          name="stock"
          label="Unidades cargadas *"
          placeholder="0"
          keyboardType="number-pad"
          errorMessage={errors.stock?.message}
          hint="Entre 0 y 200 unidades."
        />

        {submitError && (
          <View style={styles.bannerError}>
            <Text style={styles.bannerErrorText}>{submitError}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.buttonPressed,
            ]}
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
            onPress={() => reset()} // descarta los cambios y vuelve a los datos de la API
            disabled={!isDirty || isSubmitting}
          >
            <Text
              style={[styles.cancelText, !isDirty && styles.cancelTextDisabled]}
            >
              Deshacer cambios
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancel}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelText}>Volver al inventario</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ──────────────────────────────────────────────
// ESTILOS
// ──────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  loadingText: { ...TYPOGRAPHY.caption },
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
  actions: { gap: SPACING.sm, marginTop: SPACING.sm },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.85 },
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
  retryButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    fontWeight: '600',
  },
  bannerError: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  bannerErrorText: { ...TYPOGRAPHY.caption, color: COLORS.error },
});
