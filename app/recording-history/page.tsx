"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, Search, Filter, Calendar, Download, Trash2, X, FileText, BookOpen, Lightbulb, Brain } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

// Tipo para los contenidos generados
interface GeneratedContent {
  transcription?: string;
  summary?: string;
  studyGuide?: string;
  quickReview?: string;
  mindMap?: string;
}

// Tipo para grabaciones con contenido asociado
interface Recording {
  id: number;
  title: string;
  date: string;
  duration: string;
  size: string;
  content?: GeneratedContent;
}

export default function RecordingHistoryPage() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  // Cargar grabaciones desde localStorage
  useEffect(() => {
    const loadRecordings = () => {
      try {
        setIsLoading(true)
        if (typeof window !== 'undefined') {
          const savedRecordings = localStorage.getItem('recordings')
          if (savedRecordings) {
            const parsedRecordings: Recording[] = JSON.parse(savedRecordings)
            setRecordings(parsedRecordings)
          }
        }
      } catch (error) {
        console.error('Error al cargar las grabaciones:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecordings()
  }, [])

  // Filtrar grabaciones por término de búsqueda
  const filteredRecordings = recordings.filter(
    recording => recording.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Función para eliminar una grabación
  const deleteRecording = (id: number) => {
    try {
      const updatedRecordings = recordings.filter(recording => recording.id !== id)
      setRecordings(updatedRecordings)
      localStorage.setItem('recordings', JSON.stringify(updatedRecordings))
    } catch (error) {
      console.error('Error al eliminar la grabación:', error)
    }
  }

  // Función para descargar contenido
  const downloadContent = (content: string, fileName: string) => {
    try {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar el contenido:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <History className="mr-2 h-6 w-6" />
                Historial de Grabaciones
              </h1>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar grabaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <CardTitle className="text-lg">Tus Grabaciones</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-500">Cargando grabaciones...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Título</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duración</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tamaño</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredRecordings.map((recording) => (
                          <tr key={recording.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{recording.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">{recording.date}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">{recording.duration}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">{recording.size}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                      onClick={() => setSelectedRecording(recording)}
                                    >
                                      Ver
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2 text-xl">
                                        <FileText className="h-5 w-5" />
                                        {recording.title}
                                      </DialogTitle>
                                      <div className="flex gap-2 text-sm text-gray-500">
                                        <span>Fecha: {recording.date}</span>
                                        <span>•</span>
                                        <span>Duración: {recording.duration}</span>
                                      </div>
                                    </DialogHeader>
                                    <Tabs defaultValue="transcription" className="mt-4">
                                      <TabsList className="grid grid-cols-4">
                                        <TabsTrigger value="transcription" className="flex gap-1 items-center">
                                          <FileText className="h-4 w-4" />
                                          <span>Transcripción</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="summary" className="flex gap-1 items-center">
                                          <BookOpen className="h-4 w-4" />
                                          <span>Resumen</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="studyGuide" className="flex gap-1 items-center">
                                          <Lightbulb className="h-4 w-4" />
                                          <span>Guía de Estudio</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="quickReview" className="flex gap-1 items-center">
                                          <Brain className="h-4 w-4" />
                                          <span>Repaso Rápido</span>
                                        </TabsTrigger>
                                      </TabsList>
                                      
                                      <TabsContent value="transcription" className="mt-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-lg">Transcripción</CardTitle>
                                          </CardHeader>
                                          <CardContent className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                                            <pre className="whitespace-pre-wrap font-sans">
                                              {recording.content?.transcription || "No hay transcripción disponible"}
                                            </pre>
                                            <div className="mt-4 flex justify-end">
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="gap-1"
                                                onClick={() => recording.content?.transcription && 
                                                  downloadContent(
                                                    recording.content.transcription, 
                                                    `transcripcion_${recording.title.replace(/\s+/g, '_')}.txt`
                                                  )
                                                }
                                              >
                                                <Download className="h-4 w-4" />
                                                Descargar
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                      
                                      <TabsContent value="summary" className="mt-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-lg">Resumen</CardTitle>
                                          </CardHeader>
                                          <CardContent className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                                            <p className="whitespace-pre-wrap">
                                              {recording.content?.summary || "No hay resumen disponible"}
                                            </p>
                                            <div className="mt-4 flex justify-end">
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="gap-1"
                                                onClick={() => recording.content?.summary && 
                                                  downloadContent(
                                                    recording.content.summary, 
                                                    `resumen_${recording.title.replace(/\s+/g, '_')}.txt`
                                                  )
                                                }
                                              >
                                                <Download className="h-4 w-4" />
                                                Descargar
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                      
                                      <TabsContent value="studyGuide" className="mt-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-lg">Guía de Estudio</CardTitle>
                                          </CardHeader>
                                          <CardContent className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                                            <pre className="whitespace-pre-wrap font-sans">
                                              {recording.content?.studyGuide || "No hay guía de estudio disponible"}
                                            </pre>
                                            <div className="mt-4 flex justify-end">
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="gap-1"
                                                onClick={() => recording.content?.studyGuide && 
                                                  downloadContent(
                                                    recording.content.studyGuide, 
                                                    `guia_estudio_${recording.title.replace(/\s+/g, '_')}.txt`
                                                  )
                                                }
                                              >
                                                <Download className="h-4 w-4" />
                                                Descargar
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                      
                                      <TabsContent value="quickReview" className="mt-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-lg">Repaso Rápido Pre-Examen</CardTitle>
                                          </CardHeader>
                                          <CardContent className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                                            <p className="whitespace-pre-wrap">
                                              {recording.content?.quickReview || "No hay repaso rápido disponible"}
                                            </p>
                                            <div className="mt-4 flex justify-end">
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="gap-1"
                                                onClick={() => recording.content?.quickReview && 
                                                  downloadContent(
                                                    recording.content.quickReview, 
                                                    `repaso_rapido_${recording.title.replace(/\s+/g, '_')}.txt`
                                                  )
                                                }
                                              >
                                                <Download className="h-4 w-4" />
                                                Descargar
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </TabsContent>
                                    </Tabs>
                                  </DialogContent>
                                </Dialog>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                  onClick={() => {
                                    const allContent = [
                                      recording.content?.transcription,
                                      recording.content?.summary,
                                      recording.content?.studyGuide,
                                      recording.content?.quickReview
                                    ].filter(Boolean).join('\n\n---\n\n');
                                    downloadContent(allContent, `grabacion_${recording.title.replace(/\s+/g, '_')}.txt`);
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => deleteRecording(recording.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!isLoading && filteredRecordings.length === 0 && (
                  <div className="py-12 text-center">
                    <History className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {searchTerm ? "No se encontraron grabaciones" : "No hay grabaciones"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm 
                        ? `No hay resultados para "${searchTerm}"`
                        : "Aún no has realizado ninguna grabación"
                      }
                    </p>
                    <Button onClick={() => router.push('/dashboard')}>
                      Grabar ahora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {filteredRecordings.length > 0 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Mostrando {filteredRecordings.length} {filteredRecordings.length === 1 ? 'grabación' : 'grabaciones'}
                  {recordings.length !== filteredRecordings.length && ` (de ${recordings.length} total)`}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline">
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 