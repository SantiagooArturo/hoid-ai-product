import { NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type StudyMaterialType = 'mindMap' | 'flashcards' | 'keyPoints' | 'diagrams' | 'memes';

export async function POST(request: Request) {
  try {
    const { type, transcription, summary } = await request.json()

    if (!type || !['mindMap', 'flashcards', 'keyPoints', 'diagrams', 'memes'].includes(type)) {
      return NextResponse.json(
        { error: 'Se requiere especificar un tipo válido de material' },
        { status: 400 }
      )
    }

    if (!transcription || !summary) {
      return NextResponse.json(
        { error: 'Se requiere la transcripción y el resumen de la clase' },
        { status: 400 }
      )
    }

    const prompts: Record<StudyMaterialType, string> = {
      mindMap: `Basándote en esta transcripción de clase: "${transcription}"
         
         Y este resumen: "${summary}"

         Genera un mapa mental estructurado que siga EXACTAMENTE este formato:

         # TEMA CENTRAL DEL MAPA
         - Concepto Principal 1
            * Subconcepto 1.1
            * Subconcepto 1.2
            * Subconcepto 1.3
         - Concepto Principal 2
            * Subconcepto 2.1
            * Subconcepto 2.2
         - Concepto Principal 3
            * Subconcepto 3.1
            * Subconcepto 3.2
         - Concepto Principal 4
            * Subconcepto 4.1
            * Subconcepto 4.2

         Sigue EXACTAMENTE este formato con:
         1. La primera línea con el tema central precedido por #
         2. Cada concepto principal en su propia línea precedido por - (no más de 8 conceptos principales)
         3. Cada subconcepto en su propia línea precedido por * y con sangría (2-4 subconceptos por concepto principal)
         4. Usa conceptos claros, concisos y directamente relacionados al tema
         5. Evita puntos, números o cualquier otro formato que no sea el especificado
         
         Este formato específico es crucial para la visualización del mapa mental. 
         No añadas información adicional, instrucciones o texto fuera del formato.`,

      flashcards: `Basándote en esta transcripción de clase: "${transcription}"
         
         Y este resumen: "${summary}"

         Genera un conjunto de 5-7 tarjetas de estudio estilo Anki que incluyan:
         1. Pregunta clara y concisa en el frente
         2. Respuesta completa pero concisa en el reverso
         3. Mezcla de preguntas conceptuales y prácticas
         
         Formatea cada tarjeta así:
         
         TARJETA #
         Pregunta: [pregunta]
         Respuesta: [respuesta]`,

      keyPoints: `Basándote en esta transcripción de clase: "${transcription}"
         
         Y este resumen: "${summary}"

         Genera una lista organizada de puntos clave que incluya:
         1. Conceptos fundamentales (3-4)
         2. Definiciones importantes (2-3)
         3. Ejemplos prácticos (2-3)
         4. Puntos a recordar (2-3)
         
         Usa viñetas y categorías claras para organizar la información.`,

      diagrams: `Basándote en esta transcripción de clase: "${transcription}"
         
         Y este resumen: "${summary}"

         Genera una representación visual usando ASCII art que incluya:
         1. Diagrama principal del concepto central
         2. Flechas y líneas para mostrar relaciones
         3. Etiquetas claras para cada elemento
         4. Notas explicativas breves
         
         Usa caracteres ASCII para crear diagramas claros y legibles.`,

      memes: `Basándote en esta transcripción de clase: "${transcription}"
         
         Y este resumen: "${summary}"

         Genera 3-4 conceptos de memes educativos que incluyan:
         1. Situación o formato del meme
         2. Texto superior e inferior
         3. Explicación del concepto que ilustra
         4. Por qué es memorable o divertido
         
         Mantén un tono educativo pero entretenido.
         Formatea cada meme claramente separado.`
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompts[type as StudyMaterialType]
        }
      ]
    })

    // Extract text content from the response
    const contentText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'No se pudo generar el contenido'

    return NextResponse.json({ content: contentText })
  } catch (error) {
    console.error('Error al generar el material de estudio:', error)
    return NextResponse.json(
      { error: 'Error al generar el material' },
      { status: 500 }
    )
  }
} 