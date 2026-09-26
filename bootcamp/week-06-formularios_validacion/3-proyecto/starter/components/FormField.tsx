// src/components/FormField.tsx
// Dominio: Máquinas Expendedoras (VendCorp)
//
// Componente REUTILIZABLE que encapsula la tríada de esta semana:
//   Controller (React Hook Form) + TextInput (RN) + mensaje de error (Zod)
//
// Se usa igual en CreateScreen y en EditScreen: es la pieza que evita
// duplicar el mismo bloque de 20 líneas en cada formulario.

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

// ──────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────

// Omitimos value/onChangeText/onBlur: los inyecta Controller, no el llamador.
interface FormFieldProps<T extends FieldValues>
  extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> {
  /**
   * `control` que devuelve useForm.
   * Los dos `any` finales son TContext y TTransformedValues: los dejamos
   * abiertos para que el componente sirva tanto en formularios con
   * transformación (z.coerce) como sin ella.
   */
  control: Control<T, any, any>;
  /** Nombre del campo: solo acepta claves reales del formulario (tipado) */
  name: FieldPath<T>;
  label: string;
  /** Mensaje de error de Zod: errors.campo?.message */
  errorMessage?: string;
  /** Texto de ayuda que se muestra cuando no hay error */
  hint?: string;
}

// ──────────────────────────────────────────────────────────
// Componente
// ──────────────────────────────────────────────────────────

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
            // TextInput solo acepta string: los campos numéricos se convierten
            // (2500 → "2500"). El valor viaja a Zod como string y z.coerce lo
            // vuelve a convertir a number.
            value={value == null ? '' : String(value)}
            onChangeText={onChange} // en RN es onChangeText (recibe string), no onChange
            onBlur={onBlur} // marca el campo como "tocado"
            placeholderTextColor={COLORS.textMuted}
          />
        )}
      />

      {/* Reservamos espacio para el error y así evitar saltos de layout */}
      <Text
        style={[styles.helper, errorMessage ? styles.helperError : null]}
        numberOfLines={2}
      >
        {errorMessage ?? hint ?? ''}
      </Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────
// Estilos
// ──────────────────────────────────────────────────────────

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