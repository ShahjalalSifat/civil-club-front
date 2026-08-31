"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setTimeout(() => setMounted(true), 0)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <button
      onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
      aria-label="Toggle theme"
    >
      {currentTheme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-primary" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-primary-light" />
      )}
    </button>
  )
}
