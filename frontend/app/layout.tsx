import type React from "react"
import type { Metadata } from "next"
import { Jura } from "next/font/google"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"

const jura = Jura({
  subsets: ["latin"],
  variable: "--font-jura",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const fustat = localFont({
  src: [
    {
      path: "./fonts/Fustat-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Fustat-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Fustat-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-fustat",
  display: "swap",
  fallback: ["sans-serif"],
})

export const metadata: Metadata = {
  title: "Personaliz - Personalized Video Creation",
  description: "Create personalized videos with AI voice cloning and send them via WhatsApp",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jura.variable} ${inter.variable} ${fustat.variable} antialiased`} data-theme="dark">
      <body className="min-h-screen bg-black text-white font-inter">{children}</body>
    </html>
  )
}
