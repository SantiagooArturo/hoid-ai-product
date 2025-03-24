"use client"

import AudioRecorder from "@/components/audio-recorder"
import Sidebar from "@/components/sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hoid AI</h1>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              <AudioRecorder />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

