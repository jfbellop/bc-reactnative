// src/screens/CreateScreen.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
// Formulario de registro de máquina — misma base de la semana 06
// (RHF + Zod + FormField) y mutación de TanStack Query.

import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
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
import { useCreateItem } from '../hooks/useItems';

type CreateNavProp = NativeStackNavigationProp<RootStackParamList, 'Create'>;

export function CreateScreen(): React.JSX.Element {
  const navigation = useNavigation<CreateNavProp>();
  const { mutateAsync: createItem } = useCreateItem();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormInput, unknown, ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: '', description: '', price: '', stock: '' },
  });

  async function onSubmit(data: ItemFormData): Promise<void> {
    setSubmitError(null);
    try {
      await createItem({
        name: data.name,
        description: data.description ?? '',
        price: data.price,
        stock: data.stock,
      });
      navigation.goBack();
    } catch {
      setSubmitError('No se pudo registrar la máquina. Revisa la conexión.');
    }
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
        <Text style={styles.hint}>
          Registra una máquina expendedora en el inventario de VendCorp.
        </Text>

        <FormField
          control={control}
          name="name"
          label="Nombre o código *"
          placeholder="Ej: VM-013 · Snacks Recepción Sur"
          returnKeyType="next"
          errorMessage={errors.name?.message}
        />

        <FormField
          control={control}
          name="description"
          label="Ubicación y notas"
          placeholder="Ej: Torre E — Piso 1, junto a recepción"
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
        />

        <FormField
          control={control}
          name="stock"
          label="Unidades cargadas *"
          placeholder="0"
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
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <Text style={styles.buttonText}>Registrar máquina</Text>
            )}
          </Pressable>

          <Pressable style={styles.cancel} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancelar</Text>
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
  hint: { ...TYPOGRAPHY.caption, fontStyle: 'italic' },
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
  bannerError: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  bannerErrorText: { ...TYPOGRAPHY.caption, color: COLORS.error },
});