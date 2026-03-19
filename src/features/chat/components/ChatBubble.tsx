import { ChatMessage } from '../types'
import { URGENCIA_CONFIG, NivelUrgencia } from '@/features/diagnosticos/types'

interface Props {
  message: ChatMessage
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {/* Avatar IA */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-sm mt-1">
          ⚡
        </div>
      )}

      <div className={`max-w-[80%] space-y-2`}>
        {/* Burbuja */}
        <div className={`rounded-2xl px-4 py-3 text-sm font-body leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-accent text-black rounded-tr-sm'
            : 'bg-surface border border-border text-text-base rounded-tl-sm'
        }`}>
          {message.content}
        </div>

        {/* Badge urgencia si hay diagnóstico */}
        {message.diagnostico && (
          <DiagnosticoBadge
            nivel={message.diagnostico.nivel_urgencia}
            resumen={message.diagnostico.resumen}
          />
        )}
      </div>

      {/* Avatar usuario */}
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-sm mt-1">
          👤
        </div>
      )}
    </div>
  )
}

function DiagnosticoBadge({ nivel, resumen }: { nivel: NivelUrgencia; resumen: string }) {
  const cfg = URGENCIA_CONFIG[nivel]
  return (
    <div className={`rounded-xl border px-3 py-2 space-y-1 ${cfg.bg}`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-display font-bold uppercase tracking-wider ${cfg.color}`}>
          {cfg.icon} Urgencia {cfg.label}
        </span>
      </div>
      <p className="text-xs font-body text-text-muted">{resumen}</p>
    </div>
  )
}
