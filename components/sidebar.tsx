"use client"

import { Home, Settings, History, HelpCircle, Moon, Sun, LogOut, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Sidebar() {
  const [darkMode, setDarkMode] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Hoid AI</h2>
        {user && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {user.email}
          </p>
        )}
      </div>
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          <Link href="/dashboard" className="w-full">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/recording-history" className="w-full">
            <Button variant="ghost" className="w-full justify-start">
              <History className="mr-2 h-4 w-4" />
              Recording History
            </Button>
          </Link>
          <Link href="/dashboard/subscription" className="w-full">
            <Button variant="ghost" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Suscripción
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </Button>
        </div>
      </nav>
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={toggleDarkMode}>
          {darkMode ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark Mode
            </>
          )}
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

