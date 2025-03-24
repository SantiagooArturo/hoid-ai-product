import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún texto para analizar' },
        { status: 400 }
      )
    }

    console.log('Enviando texto a Claude API...')
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Por favor, genera un resumen conciso y claro del siguiente texto, destacando los puntos más importantes: "${text}"`
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error de Claude API:', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'Error al analizar el texto con Claude' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Respuesta recibida de Claude API')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en el endpoint:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el texto' },
      { status: 500 }
    )
  }
} 