import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

const OCR_PROMPT = `Analiza esta imagen de un título de propiedad venezolano de motocicleta.
Extrae exactamente los siguientes campos en formato JSON:
{
  "marca": string,
  "modelo": string,
  "ano": number,
  "serial_motor": string,
  "placa": string,
  "nombre_propietario": string,
  "fecha_documento": string
}
Si algún campo no es legible o no aparece en la imagen, ponlo como null.
Responde SOLO con el JSON, sin explicaciones adicionales.`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('imagen') as File | null
    if (!file) return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 })

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen no puede superar 10MB' }, { status: 400 })
    }

    // Convertir a base64 para Gemini Vision
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      { inlineData: { mimeType: file.type, data: base64 } },
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
    console.error('Error OCR título:', err)
    return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 })
  }
}
