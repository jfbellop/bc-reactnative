// src/schemas/itemSchema.ts
// Dominio: Máquinas Expendedoras (VendCorp)
//
// Este schema es la ÚNICA fuente de verdad de la validación del formulario:
// las mismas reglas se usan en CreateScreen y en EditScreen, y el tipo
// TypeScript se infiere de aquí (nada de interfaces duplicadas).

import { z } from 'zod';

export const itemSchema = z.object({
  // ── Texto ─────────────────────────────────────────────────────────────
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(60, 'Máximo 60 caracteres'),

  // ── Texto opcional (con límite) ───────────────────────────────────────
  description: z
    .string()
    .trim()
    .max(300, 'Máximo 300 caracteres')
    .optional()
    .or(z.literal('')),

  // ── Números ───────────────────────────────────────────────────────────
  // ⚠️ TextInput SIEMPRE entrega string, por eso usamos z.coerce.number():
  // convierte "2500" → 2500 ANTES de aplicar las reglas.
  price: z.coerce
    .number({ message: 'La tarifa debe ser un número' })
    .positive('La tarifa debe ser mayor que 0')
    .max(1_000_000, 'La tarifa no puede superar $1.000.000'),

  stock: z.coerce
    .number({ message: 'El stock debe ser un número' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .max(200, 'La capacidad máxima de la máquina es 200 unidades'),
});

// Los tipos se infieren del schema → validación (runtime) y tipos
// (compilación) siempre sincronizados, sin interfaces duplicadas.
//
// Necesitamos DOS vistas del mismo schema porque usamos z.coerce:
//  · ItemFormInput → lo que escriben los TextInput (price/stock llegan como string)
//  · ItemFormData  → lo que recibe onSubmit() ya validado y convertido a number
export type ItemFormInput = z.input<typeof itemSchema>;
export type ItemFormData = z.output<typeof itemSchema>;