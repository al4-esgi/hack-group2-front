import { z } from 'zod'
import fieldErrors from '@/utils/field-errors'

export const loginSchema = z.object({
  email: z.string().min(1, fieldErrors.email.required).email(fieldErrors.email.invalid),
  password: z.string().min(1, fieldErrors.password.required).min(8, fieldErrors.password.tooShort),
})

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, fieldErrors.firstName.required)
      .min(2, fieldErrors.firstName.tooShort)
      .max(50, fieldErrors.firstName.tooLong)
      .trim(),

    lastName: z
      .string()
      .min(1, fieldErrors.lastName.required)
      .min(2, fieldErrors.lastName.tooShort)
      .max(50, fieldErrors.lastName.tooLong)
      .trim(),

    email: z
      .string()
      .min(1, fieldErrors.email.required)
      .email(fieldErrors.email.invalid)
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(1, fieldErrors.password.required)
      .min(8, fieldErrors.password.tooShort)
      .regex(/[A-Z]/, fieldErrors.password.uppercase)
      .regex(/[a-z]/, fieldErrors.password.lowercase)
      .regex(/[0-9]/, fieldErrors.password.number),

    confirmPassword: z.string().min(1, fieldErrors.confirmPassword.required).trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: fieldErrors.confirmPassword.mismatch,
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
