import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { MANUAL_KNOWLEDGE } from '@/lib/knowledge'
import type { MLRepuesto } from '@/features/chat/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

// Placeholder: reemplaza con tu ID de afiliado de MercadoLibre cuando lo tengas
const ML_AFFILIATE_ID = process.env.ML_AFFILIATE_ID ?? ''

function buildSystemPrompt(motoCtx: string, historialCtx: string): string {
  return `Eres MotoVerse AI, un mecánico experto en motocicletas con 20 años de experiencia.
Estás hablando con el dueño de esta moto: ${motoCtx}

${historialCtx}

---
MANUAL DE REFERENCIA (BASA TUS RESPUESTAS EN ESTO):
${MANUAL_KNOWLEDGE}
---

REGLAS:
- Responde SIEMPRE en español, de forma clara y directa
- Eres conversacional: puedes hacer preguntas de seguimiento para entender mejor el problema
- Cuando tengas suficiente información para un diagnóstico, termina tu respuesta con un bloque JSON así:

\`\`\`json
{"nivel_urgencia":"bajo|medio|alto|critico","resumen":"una frase corta del diagnóstico","repuestos":["repuesto1 modelo","repuesto2 modelo"]}
\`\`\`

Niveles de urgencia:
- bajo: puede seguir usando la moto, revisar pronto
- medio: revisar esta semana, no posponer más
- alto: no usar la moto hasta revisar
- critico: peligro inmediato, detener la moto ya

En "repuestos" incluye los nombres específicos de piezas necesarias, incluyendo el modelo de la moto (ej: "kit válvulas Bera SBR 150", "filtro aceite Yamaha YBR 125").
Máximo 3 repuestos. Si no se necesitan repuestos, usa [].

Si aún no tienes suficiente información, NO incluyas el bloque JSON — solo pregunta.`
}

async function buscarEnML(repuesto: string): Promise<MLRepuesto[]> {
  try {
    const query = encodeURIComponent(repuesto)
    const res = await fetch(
      `https://api.mercadolibre.com/sites/MLV/search?q=${query}&limit=5`,
      { next: { revalidate: 3600 } } // cache 1 hora
    )
    if (!res.ok) return []
    const data = await res.json()

    return (data.results ?? []).slice(0, 5).map((item: any) => {
      const url = ML_AFFILIATE_ID
        ? `${item.permalink}?referrer=${ML_AFFILIATE_ID}`
        : item.permalink
      return {
        titulo: item.title,
        precio: item.price,
        moneda: item.currency_id,
        condicion: item.condition === 'new' ? 'Nuevo' : 'Usado',
        vendedor_rating: item.seller?.seller_reputation?.transactions?.ratings?.positive ?? null,
        url,
      } as MLRepuesto
    })
  } catch {
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Check plan
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan === 'free') {
      return NextResponse.json({ error: 'El chat requiere plan Pro' }, { status: 403 })
    }

    const { moto_id, messages } = await req.json() as {
      moto_id: string
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!moto_id || !messages?.length) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Contexto de la moto
    const { data: moto } = await supabase
      .from('motos')
      .select('marca, modelo, ano, km_actuales, tipo_aceite, es_nueva')
      .eq('id', moto_id)
      .eq('user_id', user.id)
      .single()

    if (!moto) return NextResponse.json({ error: 'Moto no encontrada' }, { status: 404 })

    const motoCtx = `${moto.marca} ${moto.modelo} ${moto.ano} | ${moto.km_actuales.toLocaleString()} km | aceite ${moto.tipo_aceite} | ${moto.es_nueva ? 'moto nueva' : 'segunda mano'}`

    // Últimos mantenimientos como contexto
    const { data: mantenimientos } = await supabase
      .from('mantenimientos')
      .select('tipo_servicio, km_al_servicio, fecha, proximo_km')
      .eq('moto_id', moto_id)
      .order('fecha', { ascending: false })
      .limit(3)

    const historialCtx = mantenimientos?.length
      ? `Últimos servicios registrados:\n${mantenimientos.map(m =>
          `- ${m.tipo_servicio} a los ${m.km_al_servicio.toLocaleString()} km (${m.fecha})${m.proximo_km ? ` → próximo a los ${m.proximo_km.toLocaleString()} km` : ''}`
        ).join('\n')}`
      : 'Sin historial de mantenimientos registrado.'

    // Convertir todo el historial al formato de Gemini
    const history = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }))

    const lastMessage = history.pop()

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: buildSystemPrompt(motoCtx, historialCtx),
    })

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(lastMessage!.parts[0].text)
    const responseText = result.response.text()

    // Detectar si hay diagnóstico embebido
    const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/)
    let diagnostico: { nivel_urgencia: string; resumen: string; repuestos?: string[] } | null = null
    let ml_resultados: Record<string, MLRepuesto[]> | null = null

    if (jsonMatch) {
      try {
        diagnostico = JSON.parse(jsonMatch[1])

        // Buscar repuestos en MercadoLibre en paralelo
        const repuestos = diagnostico?.repuestos ?? []
        if (repuestos.length > 0) {
          const searches = repuestos.slice(0, 3).map(r => buscarEnML(r))
          const resultados = await Promise.all(searches)
          ml_resultados = {}
          repuestos.slice(0, 3).forEach((r, i) => {
            if (resultados[i].length > 0) ml_resultados![r] = resultados[i]
          })
          if (Object.keys(ml_resultados).length === 0) ml_resultados = null
        }
      } catch {
        // ignorar parse errors
      }
    }

    // Limpiar el JSON del texto para no mostrarlo crudo al usuario
    const cleanText = responseText.replace(/```json[\s\S]*?```/g, '').trim()

    return NextResponse.json({
      reply: cleanText,
      diagnostico,
      ml_resultados,
    })
  } catch (err: any) {
    console.error('Error en chat AI:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
