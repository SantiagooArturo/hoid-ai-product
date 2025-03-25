"use client"

import { useState } from "react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Sidebar from "@/components/sidebar"
import { SubscriptionStatus } from "@/components/subscription-status"
import PricingPlans from "@/components/subscription/pricing-plans"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("current");

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suscripción</h1>
            </div>
            
            <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                <TabsTrigger value="current">Plan Actual</TabsTrigger>
                <TabsTrigger value="upgrade">Actualizar Plan</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="mt-0">
                <SubscriptionStatus />
              </TabsContent>
              
              <TabsContent value="upgrade" className="mt-0">
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    Elige el plan que mejor se adapte a tus necesidades para desbloquear todas las funcionalidades de Hoid AI.
                  </p>
                  <PricingPlans />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 