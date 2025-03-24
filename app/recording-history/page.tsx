"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, Search, Filter, Calendar, Download, Trash2 } from "lucide-react"

export default function RecordingHistoryPage() {
  // Placeholder data for recordings
  const [recordings] = useState([
    {
      id: 1,
      title: "Introducción a la Física Cuántica",
      date: "2023-11-15",
      duration: "45:32",
      size: "12.4 MB",
    },
    {
      id: 2,
      title: "Ecuaciones Diferenciales Avanzadas",
      date: "2023-11-10",
      duration: "52:18",
      size: "15.7 MB",
    },
    {
      id: 3,
      title: "Historia del Arte Contemporáneo",
      date: "2023-11-05",
      duration: "38:45",
      size: "10.2 MB",
    },
    {
      id: 4,
      title: "Programación Orientada a Objetos",
      date: "2023-10-28",
      duration: "61:07",
      size: "18.3 MB",
    },
  ])

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
                      {recordings.map((recording) => (
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
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                Ver
                              </Button>
                              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {recordings.length === 0 && (
                  <div className="py-12 text-center">
                    <History className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay grabaciones</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Aún no has realizado ninguna grabación</p>
                    <Button>
                      Grabar ahora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {recordings.length} grabaciones
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
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 