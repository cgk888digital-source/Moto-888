import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimitMiddleware } from '@/lib/rate-limit'

const OCR_PROMPT = `Analiza esta imagen de un documento o título de propiedad de motocicleta.
Extrae exactamente los siguientes campos en formato JSON:
{
  "marca": string,
  "modelo": string,
  "ano": number,
  "serial_motor": string,
  "placa": string,
  "tipo_motor": string,
  "cilindrada": string,
  "nombre_propietario": string,
  "fecha_documento": string
}
Si algún campo no es legible o no aparece en la imagen, ponlo como null.
Responde SOLO con el JSON, sin texto adicional.`

export async function POST(req: NextRequest) {
  const rateLimit = rateLimitMiddleware(req, 'api/ocr-titulo')
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta más tarde.', retryAfter: rateLimit.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('imagen') as File | null
    if (!file) return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 })

    // Validar tamaño
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen no puede superar 10MB' }, { status: 400 })
    }

    // Convertir a base64 para Gemini Vision
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    // Normalizar mimeType — HEIC/HEIF de iPhone no es soportado, convertir a jpeg
    let mimeType = file.type
    if (!mimeType || mimeType === 'application/octet-stream' || mimeType.includes('heic') || mimeType.includes('heif')) {
      mimeType = 'image/jpeg'
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
    // gemini-1.5-flash tiene soporte multimodal (visión) más estable
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64 } },
      { text: OCR_PROMPT },
    ])

    const responseText = result.response.text().trim()

    // Extraer JSON de la respuesta (puede venir con ```json ... ```)
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ?? responseText.match(/(\{[\s\S]*\})/)
    const jsonStr = jsonMatch ? jsonMatch[1] ?? jsonMatch[0] : responseText

    let datos: Record<string, string | number | null>
    try {
      datos = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({ error: 'No se pudo leer el título. Intenta con mejor iluminación.' }, { status: 422 })
    }

    // Guardar la foto en Supabase Storage como respaldo
    let titulo_foto_url: string | null = null
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `titulos/${user.id}/${Date.now()}.${ext}`
    const { data: uploadData } = await supabase.storage
      .from('motos-docs')
      .upload(path, bytes, { contentType: file.type, upsert: true })

    if (uploadData) {
      const { data: urlData } = supabase.storage.from('motos-docs').getPublicUrl(path)
      titulo_foto_url = urlData.publicUrl
    }

    return NextResponse.json({ datos, titulo_foto_url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Error OCR título:', msg)
    return NextResponse.json({ error: 'No se pudo analizar la imagen. Asegúrate que el título sea legible y vuelve a intentarlo.' }, { status: 500 })
  }
}
