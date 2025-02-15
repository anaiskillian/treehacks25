"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Inter, Orbitron } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <html lang="en" className={`${orbitron.variable}`}>
      <body className={inter.className}>
        {children}
        <div className="cursor-trail">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                left: cursorPosition.x,
                top: cursorPosition.y,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
        <footer className="bg-primary-900 text-primary-100 py-4 text-center">
          <p className="cyberpunk-text text-sm">
            This is a project made at TreeHacks 2025 by Jeet Dekivadia, Anais Killian, Eric Wang, and Pratham Pilli
          </p>
        </footer>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
