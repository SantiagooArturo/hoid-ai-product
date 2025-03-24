"use client"

import * as React from 'react'
import { createPortal } from 'react-dom'

// Tipos para el sistema de toast
export type ToastVariant = 'default' | 'destructive' | 'success'

export interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface Toast extends ToastProps {
  id: string
  visible: boolean
}

// Contexto para el sistema de toast
interface ToastContextType {
  toasts: Toast[]
  toast: (props: ToastProps) => void
  dismissToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

// Hook personalizado para usar el sistema de toast
export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    // Si se usa fuera del provider, devolver una versión simulada
    return {
      toast: (props: ToastProps) => console.log('Toast:', props),
      toasts: [],
      dismissToast: () => {}
    }
  }
  return context
}

// Componente para un toast individual
function ToastComponent({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const variantClasses = {
    default: 'bg-white border-gray-200 text-gray-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 ${
        toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${variantClasses[toast.variant || 'default']}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.description && (
              <p className="mt-1 text-sm text-gray-500">{toast.description}</p>
            )}
          </div>
          <button
            type="button"
            className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onDismiss}
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Proveedor de toast
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  // Añadir un nuevo toast
  const toast = React.useCallback((props: ToastProps) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const newToast: Toast = {
      id,
      visible: false,
      variant: props.variant || 'default',
      duration: props.duration || 5000,
      ...props
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // Hacerlo visible después de un instante (para animación)
    setTimeout(() => {
      setToasts((prevToasts) =>
        prevToasts.map((t) => (t.id === id ? { ...t, visible: true } : t))
      )
    }, 50)

    // Eliminarlo después de la duración
    setTimeout(() => {
      dismissToast(id)
    }, newToast.duration)
  }, [])

  // Eliminar un toast
  const dismissToast = React.useCallback((id: string) => {
    // Hacer invisible primero (para animación)
    setToasts((prevToasts) =>
      prevToasts.map((t) => (t.id === id ? { ...t, visible: false } : t))
    )

    // Eliminar después de la animación
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
    }, 300)
  }, [])

  // Renderizar los toasts en un portal
  const ToastContainer = () => {
    // Solo renderizar en el cliente
    if (typeof window === 'undefined') return null

    return createPortal(
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-4 pointer-events-none">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>,
      document.body
    )
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export { ToastProvider } 