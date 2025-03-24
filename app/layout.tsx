import './globals.css'
import { Poppins } from 'next/font/google'
import AuthProvider from '@/components/auth/AuthProvider'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata = {
  title: 'Hoid AI',
  description: 'Your AI-powered study companion',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
