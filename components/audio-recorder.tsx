"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, AudioWaveformIcon as Waveform, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QuickStudyModes from "@/components/QuickStudyModes"
import StudyMaterials from "@/components/StudyMaterials"

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [summary, setSummary] = useState("")
  const [studyGuide, setStudyGuide] = useState("")
  const [error, setError] = useState("")
  const [isSelectingTab, setIsSelectingTab] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = async () => {
    try {
      setError("")
      setIsSelectingTab(true)

      // Intentamos obtener el stream de audio del sistema
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 2,
          sampleSize: 16
        }
      })

      // Verificamos que el stream tenga tracks de audio
      const audioTracks = stream.getAudioTracks()
      if (!audioTracks.length) {
        throw new Error('No se pudo acceder al audio del sistema. Por favor, verifica los permisos de audio.')
      }

      // Verificamos que el track de audio esté habilitado
      const audioTrack = audioTracks[0]
      if (!audioTrack.enabled) {
        audioTrack.enabled = true
      }

      // Debug: Mostrar información sobre los tracks disponibles
      console.log('Tracks disponibles:', stream.getTracks().map(track => ({
        kind: track.kind,
        label: track.label,
        enabled: track.enabled,
        muted: track.muted
      })))
      
      setIsSelectingTab(false)
      streamRef.current = stream
      
      // Configuramos el MediaRecorder con el tipo MIME correcto
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Chunk de audio recibido:', event.data.size, 'bytes')
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('Grabación detenida, procesando audio...')
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        console.log('Tamaño total del audio:', audioBlob.size, 'bytes')
        await analyzeAudio(audioBlob)
      }

      // Iniciamos la grabación con un intervalo de 1 segundo
      mediaRecorder.start(1000)
      setIsRecording(true)
      console.log('Grabación iniciada')
    } catch (err) {
      setIsSelectingTab(false)
      console.error('Error detallado:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError("Se requieren permisos de audio. Por favor, permite el acceso al audio en tu navegador.")
        } else if (err.name === 'NotFoundError') {
          setError("No se encontró ningún dispositivo de audio.")
        } else if (err.name === 'NotReadableError') {
          setError("No se puede acceder al audio. Asegúrate de que el audio del sistema esté funcionando.")
        } else {
          setError(`Error al iniciar la grabación: ${err.message}`)
        }
      } else {
        setError("Error al iniciar la grabación. Por favor, intenta de nuevo.")
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('Deteniendo grabación...')
      mediaRecorderRef.current.stop()
      streamRef.current?.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      setIsAnalyzing(true)
      setIsTranscribing(true)
      // No limpiamos los estados anteriores para que no desaparezca el loader
      setError("")
      console.log('Iniciando transcripción de audio...')

      // Convert audio to base64
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string
        console.log('Audio convertido a base64, enviando a Whisper...')
        
        try {
          // First, transcribe the audio
          const transcriptionResponse = await fetch('/api/transcribe-audio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audioData: base64Audio
            })
          })

          if (!transcriptionResponse.ok) {
            const errorData = await transcriptionResponse.json()
            throw new Error(errorData.error || 'Error al transcribir el audio')
          }

          const transcriptionData = await transcriptionResponse.json()
          console.log('Transcripción recibida:', transcriptionData.text)
          setTranscription(transcriptionData.text)
          setIsTranscribing(false)

          // Then, analyze the transcribed text
          console.log('Enviando texto para análisis...')
          const analysisResponse = await fetch('/api/analyze-audio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: transcriptionData.text
            })
          })

          if (!analysisResponse.ok) {
            const errorData = await analysisResponse.json()
            throw new Error(errorData.error || 'Error al analizar el texto')
          }

          const analysisData = await analysisResponse.json()
          console.log('Análisis recibido:', analysisData)
          setSummary(analysisData.content[0].text)

          // Generate study guide
          console.log('Generando guía de estudio...')
          const studyGuideResponse = await fetch('/api/generate-study-guide', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: transcriptionData.text,
              summary: analysisData.content[0].text
            })
          })

          if (!studyGuideResponse.ok) {
            const errorData = await studyGuideResponse.json()
            throw new Error(errorData.error || 'Error al generar la guía de estudio')
          }

          const studyGuideData = await studyGuideResponse.json()
          console.log('Guía de estudio recibida:', studyGuideData)
          setStudyGuide(studyGuideData.content)

        } catch (err) {
          console.error('Error en el proceso:', err)
          setError(err instanceof Error ? err.message : "Error al procesar el audio. Por favor, intenta de nuevo.")
          // En caso de error, limpiamos los estados
          setTranscription("")
          setSummary("")
          setStudyGuide("")
        } finally {
          setIsAnalyzing(false)
          setIsTranscribing(false)
        }
      }
    } catch (err) {
      console.error('Error en el proceso:', err)
      setError(err instanceof Error ? err.message : "Error al procesar el audio. Por favor, intenta de nuevo.")
      setTranscription("")
      setSummary("")
      setStudyGuide("")
      setIsAnalyzing(false)
      setIsTranscribing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Grabación de Clase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center py-6">
              {isRecording ? (
                <div className="flex flex-col items-center">
                  <div className="h-24 w-full flex items-center justify-center">
                    <Waveform className="h-16 w-16 text-red-500 animate-pulse" />
                  </div>
                  <p className="text-red-500 font-medium">Recording...</p>
                </div>
              ) : isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                  <p className="text-blue-500 font-medium">Analyzing audio...</p>
                </div>
              ) : isSelectingTab ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                  <p className="text-blue-500 font-medium">Iniciando grabación...</p>
                  <p className="text-sm text-gray-500 mt-2">Por favor, permite el acceso al audio del sistema</p>
                </div>
              ) : (
                <div className="h-24 w-full flex items-center justify-center">
                  <Mic className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                disabled={isAnalyzing || isSelectingTab}
                className="w-32"
              >
                {isRecording ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Record
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle>Análisis de la Clase</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transcription" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transcription">Transcripción</TabsTrigger>
                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                <TabsTrigger value="studyGuide">Study Guide</TabsTrigger>
              </TabsList>
              <TabsContent value="transcription" className="mt-4">
                {!transcription && (isTranscribing || isAnalyzing) ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-blue-500 font-medium">Procesando audio...</p>
                    <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
                  </div>
                ) : transcription ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{transcription}</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No hay transcripción disponible
                  </div>
                )}
              </TabsContent>
              <TabsContent value="resumen" className="mt-4">
                {!summary && (isTranscribing || isAnalyzing) ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-blue-500 font-medium">Generando resumen...</p>
                    <p className="text-sm text-gray-500 mt-2">Analizando la grabación</p>
                  </div>
                ) : summary ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{summary}</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No hay resumen disponible
                  </div>
                )}
              </TabsContent>
              <TabsContent value="studyGuide" className="mt-4">
                {!studyGuide && (isTranscribing || isAnalyzing) ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-blue-500 font-medium">Generando guía de estudio...</p>
                    <p className="text-sm text-gray-500 mt-2">Analizando el contenido</p>
                  </div>
                ) : studyGuide ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{studyGuide}</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No hay guía de estudio disponible
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <QuickStudyModes transcription={transcription} summary={summary} />
      <StudyMaterials transcription={transcription} summary={summary} />
    </div>
  )
}

