import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { audioData } = await request.json()
    
    if (!audioData) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún audio para transcribir' },
        { status: 400 }
      )
    }

    console.log('Enviando audio a Whisper API...')
    
    // Convertir el base64 a un Blob
    const base64Data = audioData.split(',')[1]
    const binaryData = Buffer.from(base64Data, 'base64')
    
    // Crear un FormData con el archivo de audio
    const formData = new FormData()
    formData.append('file', new Blob([binaryData], { type: 'audio/webm' }), 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'es')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error de Whisper API:', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'Error al transcribir el audio' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Transcripción recibida:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en el endpoint:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el audio' },
      { status: 500 }
    )
  }
} 