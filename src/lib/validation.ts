import { z } from 'zod'

export const TallerRegisterSchema = z.object({
  token: z.string().min(1, 'Token es requerido'),
  km_registrado: z
    .number()
    .int()
    .positive()
    .max(999999, 'Kilometraje inválido'),
  tipo_servicio: z
    .string()
    .min(1, 'Tipo de servicio es requerido')
    .max(100, 'Tipo de servicio muy largo'),
  notas_mecanico: z.string().max(1000).optional(),
  costo_cobrado: z.number().int().min(0).max(999999).optional(),
})

export type TallerRegisterInput = z.infer<typeof TallerRegisterSchema>

export const ChatMessageSchema = z.object({
  moto_id: z.string().uuid('ID de moto inválido'),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(5000),
    })
  ).min(1),
})

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>

export const DiagnosticoSchema = z.object({
  sintoma: z.string().min(10, 'Describe mejor el síntoma').max(500),
  moto_id: z.string().uuid('ID de moto inválido'),
})

export type DiagnosticoInput = z.infer<typeof DiagnosticoSchema>

export const ProductoFilterSchema = z.object({
  categoria: z.string().optional(),
  condicion: z.enum(['nuevo', 'usado']).optional(),
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().max(100).default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
})

export type ProductoFilterInput = z.infer<typeof ProductoFilterSchema>

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    return { success: false as const, errors }
  }
  
  return { success: true as const, data: result.data }
}