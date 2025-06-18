import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { CattleProvider } from "@/lib/cattle-context"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GanaTech - Sistema de Gestión Ganadera",
  description: "Plataforma para el monitoreo y gestión de ganado en tiempo real",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/cow-icon.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <CattleProvider>{children}</CattleProvider>
          </AuthProvider>
        </ThemeProvider>
        {/* Movido el Toaster fuera de los providers para asegurar que esté en la parte superior del DOM */}
        <Toaster />
      </body>
    </html>
  )
}
