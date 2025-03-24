"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Clock, Zap, Volume2, BookOpen } from "lucide-react"

interface QuickStudyModesProps {
  transcription: string
  summary: string
}

export default function QuickStudyModes({ transcription, summary }: QuickStudyModesProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastMinuteContent, setLastMinuteContent] = useState("")
  const [oneHourContent, setOneHourContent] = useState("")
  const [error, setError] = useState("")

  const generateContent = async (mode: 'lastMinute' | 'oneHour') => {
    if (!transcription || !summary) {
      setError("Necesitas grabar y analizar una clase primero")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      const response = await fetch('/api/generate-quick-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mode,
          transcription,
          summary 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al generar el contenido')
      }

      const data = await response.json()
      
      if (mode === 'lastMinute') {
        setLastMinuteContent(data.content)
      } else {
        setOneHourContent(data.content)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar el contenido. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Repaso Rápido Pre-Examen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lastMinute" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lastMinute" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Repaso Express (10min)
            </TabsTrigger>
            <TabsTrigger value="oneHour" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Repaso Completo (1h)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lastMinute" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Repaso ultra rápido con los conceptos clave para revisar justo antes del examen.
              </p>
              <div className="flex justify-between items-center gap-4">
                <Button
                  onClick={() => generateContent('lastMinute')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generar Resumen Rápido
                    </>
                  )}
                </Button>
                {lastMinuteContent && (
                  <Button variant="outline" size="icon">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {lastMinuteContent ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
                  <pre className="text-sm whitespace-pre-wrap font-mono">{lastMinuteContent}</pre>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Genera un resumen para ver el contenido
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="oneHour" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Plan de repaso estructurado para aprovechar al máximo una hora de estudio.
              </p>
              <div className="flex justify-between items-center gap-4">
                <Button
                  onClick={() => generateContent('oneHour')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Generar Plan de 1 Hora
                    </>
                  )}
                </Button>
                {oneHourContent && (
                  <Button variant="outline" size="icon">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {oneHourContent ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/50">
                  <pre className="text-sm whitespace-pre-wrap font-mono">{oneHourContent}</pre>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Genera un plan de estudio para ver el contenido
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 text-red-500 text-sm text-center">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 