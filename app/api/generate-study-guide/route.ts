import { NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { text, summary } = await request.json()

    if (!text || !summary) {
      return NextResponse.json(
        { error: 'Se requiere texto y resumen para generar la guía de estudio' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Actúa como un profesor experto y genera una guía de estudio estructurada basada en esta transcripción de clase: "${text}"

          El resumen de la clase es: "${summary}"

          Por favor, genera una guía de estudio que incluya:
          1. Conceptos Clave: Lista los conceptos más importantes
          2. Puntos a Recordar: Destaca los puntos principales que los estudiantes deben recordar
          3. Preguntas de Comprensión: 2-3 preguntas que ayuden a verificar el entendimiento
          4. Recursos Adicionales: Sugerencias de temas relacionados para profundizar

          Formatea la respuesta de manera clara y fácil de leer, usando saltos de línea para separar secciones.`
        }
      ]
    })

    return NextResponse.json({ content: message.content[0].text })
  } catch (error) {
    console.error('Error al generar la guía de estudio:', error)
    return NextResponse.json(
      { error: 'Error al generar la guía de estudio' },
      { status: 500 }
    )
  }
} 