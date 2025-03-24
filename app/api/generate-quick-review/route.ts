import { NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { mode, transcription, summary } = await request.json()

    if (!mode || !['lastMinute', 'oneHour'].includes(mode)) {
      return NextResponse.json(
        { error: 'Se requiere especificar un modo válido (lastMinute u oneHour)' },
        { status: 400 }
      )
    }

    if (!transcription || !summary) {
      return NextResponse.json(
        { error: 'Se requiere la transcripción y el resumen de la clase' },
        { status: 400 }
      )
    }

    const prompt = mode === 'lastMinute' 
      ? `Basándote en esta transcripción de clase: "${transcription}"
         
         Y este resumen: "${summary}"

         Genera un repaso express de 10 minutos que incluya:
         1. Los 5 conceptos más importantes de la clase (máximo 1 línea cada uno)
         2. 3 fórmulas o definiciones clave mencionadas en la clase (si aplica)
         3. 2 puntos que seguramente aparecerán en el examen basados en el énfasis dado en la clase
         
         El formato debe ser conciso y fácil de leer en 10 minutos.
         Usa viñetas o números para cada punto.`
      : `Basándote en esta transcripción de clase: "${transcription}"
         
         Y este resumen: "${summary}"

         Genera un plan de estudio estructurado para 1 hora que incluya:
         1. Lista de temas cubiertos en la clase (5-7 temas)
         2. Tiempo recomendado para repasar cada tema
         3. Ejercicios prácticos sugeridos basados en el contenido de la clase
         4. Puntos de autoevaluación para verificar la comprensión
         
         El plan debe ser realista para completarse en 1 hora.
         Incluye tiempos específicos para cada actividad.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    return NextResponse.json({ content: message.content[0].text })
  } catch (error) {
    console.error('Error al generar el repaso rápido:', error)
    return NextResponse.json(
      { error: 'Error al generar el repaso' },
      { status: 500 }
    )
  }
} 