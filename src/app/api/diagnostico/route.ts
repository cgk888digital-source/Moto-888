import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { MANUAL_KNOWLEDGE } from '@/lib/knowledge'

// Para cambiar a Claude Haiku en producción:
// 1. npm install @anthropic-ai/sdk
// 2. Reemplazar el bloque de llamada AI con la versión Anthropic
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const SYSTEM_PROMPT = `Eres Bikevzla 888 AI, un mecánico experto en motocicletas con 20 años de experiencia.
Responde SIEMPRE en español, de forma clara y directa para un motociclista común.

---
MANUAL DE REFERENCIA (BASA TUS RESPUESTAS EN ESTO):
${MANUAL_KNOWLEDGE}
---

Tu respuesta debe ser un JSON válido con exactamente esta estructura:
{
  "pregunta_enriquecida": "reformulación técnica del síntoma descrito por el usuario",
  "respuesta": "diagnóstico claro con posibles causas y qué hacer",
  "nivel_urgencia": "bajo|medio|alto|critico",
  "accion_recomendada": "qué debe hacer el usuario ahora mismo"
}
Niveles de urgencia:
- bajo: puede seguir usando la moto, revisar pronto
- medio: revisar esta semana, no posponer más
- alto: no usar la moto hasta revisar
- critico: peligro inmediato, detener la moto ya`

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
      return NextResponse.json({ error: 'El diagnóstico requiere plan Pro' }, { status: 403 })
    }

    const { sintoma, moto_id } = await req.json()
    if (!sintoma || !moto_id) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Contexto de la moto
    const { data: moto, error: motoError } = await supabase
      .from('motos')
      .select('marca, modelo, ano, km_actuales, tipo_aceite')
      .eq('id', moto_id)
      .eq('user_id', user.id)
      .single()

    if (motoError || !moto) {
      return NextResponse.json({ error: 'Moto no encontrada' }, { status: 404 })
    }

    const motoContexto = `${moto.marca} ${moto.modelo} ${moto.ano} — ${moto.km_actuales.toLocaleString()} km — aceite ${moto.tipo_aceite}`

    // Llamar a Gemini Flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await model.generateContent(
      `Moto: ${motoContexto}\n\nSíntoma reportado: ${sintoma}`
    )

    const rawText = result.response.text()

    // Parsear JSON
    let parsed: {
      pregunta_enriquecida: string
      respuesta: string
      nivel_urgencia: 'bajo' | 'medio' | 'alto' | 'critico'
      accion_recomendada: string
    }

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText)
    } catch {
      return NextResponse.json({ error: 'Error procesando respuesta de IA' }, { status: 500 })
    }

    // Guardar en Supabase
    const { data: diagnostico, error: insertError } = await supabase
      .from('diagnosticos')
      .insert({
        user_id: user.id,
        moto_id,
        sintoma_original: sintoma,
        pregunta_enriquecida: parsed.pregunta_enriquecida,
        respuesta_ai: `${parsed.respuesta}\n\n**Acción recomendada:** ${parsed.accion_recomendada}`,
        nivel_urgencia: parsed.nivel_urgencia,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ diagnostico, nivel_urgencia: parsed.nivel_urgencia })
  } catch (err: any) {
    console.error('Error en diagnóstico AI:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
