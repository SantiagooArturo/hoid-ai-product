"use client"

import React from 'react'
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Sidebar from "@/components/sidebar"
import { PricingPlansTest } from '@/components/pricing-plans-test';

export default function TestSubscriptionPage() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prueba de MercadoPago</h1>
            </div>
            
            <div className="mt-8">
              <PricingPlansTest />
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
              <h3 className="font-medium text-yellow-800">Notas de implementación:</h3>
              <ul className="list-disc ml-5 mt-2 text-sm text-yellow-700 space-y-1">
                <li>Esta página es solo para pruebas y no se incluirá en producción</li>
                <li>Usa el endpoint /api/subscription/test que no requiere autenticación de Firebase</li>
                <li>Los pagos realizados aquí no se registrarán en la base de datos</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 