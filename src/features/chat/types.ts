export type ChatRole = 'user' | 'assistant'

export interface MLRepuesto {
  titulo: string
  precio: number
  moneda: string
  condicion: string
  vendedor_rating: number | null
  url: string
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  diagnostico?: {
    nivel_urgencia: 'bajo' | 'medio' | 'alto' | 'critico'
    resumen: string
    repuestos?: string[]
  } | null
  ml_resultados?: Record<string, MLRepuesto[]> | null
  timestamp: Date
}
