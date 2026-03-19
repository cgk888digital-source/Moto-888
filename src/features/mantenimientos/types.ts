import { Tables } from '@/types/database.types'

export type Mantenimiento = Tables<'mantenimientos'>

export const TIPOS_SERVICIO = [
  'Cambio de aceite',
  'Cambio de filtro de aceite',
  'Cambio de filtro de aire',
  'Revisión de frenos',
  'Cambio de pastillas de freno',
  'Cambio de cadena y piñones',
  'Cambio de neumáticos',
  'Revisión de bujías',
  'Ajuste de válvulas',
  'Cambio de líquido de frenos',
  'Revisión general',
  'Otro',
] as const
