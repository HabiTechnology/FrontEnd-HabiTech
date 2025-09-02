"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("habitech-theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("habitech-theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 bg-white/80 dark:bg-[#1A2E49]/80 backdrop-blur-sm border-[#A0AAB4]/50 hover:bg-[#F5F7FA] dark:hover:bg-[#1A2E49] hover:border-[#007BFF]"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-[#1A2E49]" />
      ) : (
        <Sun className="h-4 w-4 text-[#F5F7FA]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
