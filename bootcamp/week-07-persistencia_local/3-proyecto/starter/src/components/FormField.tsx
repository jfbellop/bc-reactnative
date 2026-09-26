// src/components/FormField.tsx
// Componente REUTILIZABLE: Controller (RHF) + TextInput + mensaje de error (Zod).
// Reutilizado de la semana 06.

import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';

interface FormFieldProps<T extends FieldValues>
  extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> {
  /** Los dos `any` finales son TContext y TTransformedValues (z.coerce). */
  control: Control<T, any, any>;
  name: FieldPath<T>;
  label: string;
  errorMessage?: string;
  hint?: string;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  errorMessage,
  hint,
  ...textInputProps
}: FormFieldProps<T>): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            {...textInputProps}
            style={[
              styles.input,
              textInputProps.multiline === true && styles.inputMultiline,
              !!errorMessage && styles.inputError,
            ]}
            value={value == null ? '' : String(value)}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholderTextColor={COLORS.textMuted}
          />
        )}
      />

      {/* Espacio reservado para el error: evita saltos de layout */}
      <Text
        style={[styles.helper, errorMessage ? styles.helperError : null]}
        numberOfLines={2}
      >
        {errorMessage ?? hint ?? ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.xs },
  label: {
    ...TYPOGRAPHY.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
  },
  inputMultiline: { minHeight: 96, paddingTop: SPACING.md },
  inputError: { borderColor: COLORS.error },
  helper: { ...TYPOGRAPHY.caption, minHeight: 16 },
  helperError: { color: COLORS.error },
});