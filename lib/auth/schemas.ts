import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8),
})

export const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().min(1).email(),
  password: z.string().min(8),
})

export const forgotPasswordSchema = z.object({
  email: z.string().min(1).email(),
})
