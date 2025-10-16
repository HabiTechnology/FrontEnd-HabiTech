import type React from "react"
import { Roboto_Mono } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import { V0Provider } from "@/lib/v0-context"
import { AuthProvider } from "@/lib/auth-context-simple-fixed"
import { PrivyWrapper } from "@/components/privy-wrapper"
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
    template: "%s — HABITECH",
    default: "HABITECH",
  },
  description: "Gestión Inteligente, Convivencia Inteligente - Sistema de administración residencial.",
  generator: 'v0.app',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    locale: 'es_MX',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-MX" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <link rel="preload" href="/fonts/Rebels-Fett.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://apitaller.onrender.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased`}>
        <PrivyWrapper>
          <AuthProvider>
            <V0Provider isV0={isV0}>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </V0Provider>
          </AuthProvider>
        </PrivyWrapper>
      </body>
    </html>
  )
}
