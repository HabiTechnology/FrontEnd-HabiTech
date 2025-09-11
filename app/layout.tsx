import type React from "react"
import { Roboto_Mono } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import { V0Provider } from "@/lib/v0-context"
import { AuthProvider } from "@/lib/auth-context-simple-fixed"
import { PrivyWrapper } from "@/components/privy-wrapper"
import { RoleDebugInfo } from "@/components/role-guard"
import localFont from "next/font/local"
import LayoutWrapper from "@/components/layout-wrapper"

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
})

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
})

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false

export const metadata: Metadata = {
  title: {
    template: "%s – HABITECH",
    default: "HABITECH",
  },
  description: "Gestión Inteligente, Convivencia Inteligente - Sistema de administración residencial.",
  generator: 'v0.app',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preload" href="/fonts/Rebels-Fett.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased`}>
        <PrivyWrapper>
          <AuthProvider>
            <V0Provider isV0={isV0}>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <RoleDebugInfo />
            </V0Provider>
          </AuthProvider>
        </PrivyWrapper>
      </body>
    </html>
  )
}
