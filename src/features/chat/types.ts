export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  diagnostico?: {
    nivel_urgencia: 'bajo' | 'medio' | 'alto' | 'critico'
    resumen: string
  } | null
  timestamp: Date
}
