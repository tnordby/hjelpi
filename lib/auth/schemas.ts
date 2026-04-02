import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8),
})

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().max(60),
    email: z.string().min(1).email(),
    password: z.string().min(8),
  })
  .refine((d) => `${d.firstName} ${d.lastName}`.trim().length >= 2, {
    path: ['firstName'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().min(1).email(),
})

export const resendConfirmationSchema = z.object({
  email: z.string().min(1).email(),
})
