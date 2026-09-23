// src/screens/CreateScreen.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
// Registra una máquina nueva: useForm + zodResolver + useCreateItem.
// El esquema de validación vive en src/schemas/itemSchema.ts (una sola fuente
// de verdad) y el input se renderiza con el FormField reutilizable.

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

// ──────────────────────────────────────────────
// PANTALLA
// ──────────────────────────────────────────────

export function CreateScreen(): React.JSX.Element {
  const navigation = useNavigation<CreateNavProp>();
  const { mutateAsync: createItem } = useCreateItem();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Los 3 genéricos de useForm: valores del formulario (input), contexto y
  // valores ya transformados que recibe onSubmit (output de Zod).
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormInput, unknown, ItemFormData>({
    // Toda la validación la resuelve Zod: aquí no hay reglas a mano.
    resolver: zodResolver(itemSchema),
    // Los numéricos arrancan vacíos: TextInput trabaja con strings y
    // z.coerce.number() los convierte al validar ("2500" → 2500).
    defaultValues: { name: '', description: '', price: '', stock: '' },
  });

  // handleSubmit solo llama a onSubmit si el formulario pasa la validación.
  // Al ser async + mutateAsync, formState.isSubmitting sigue en true durante
  // toda la petición (el spinner no desaparece antes de tiempo).
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
      setSubmitError(
        'No se pudo registrar la máquina. Revisa tu conexión e intenta de nuevo.'
      );
    }
  }

  const canSubmit = !isSubmitting;

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
          placeholder="Ej: VM-014 · Snacks Torre C"
          returnKeyType="next"
          errorMessage={errors.name?.message}
          hint="Incluye el código de la máquina para identificarla rápido."
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
              <Text style={styles.buttonText}>Registrar máquina</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.cancel}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
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
  hint: { ...TYPOGRAPHY.caption, fontStyle: 'italic' },
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
  bannerError: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  bannerErrorText: { ...TYPOGRAPHY.caption, color: COLORS.error },
});
