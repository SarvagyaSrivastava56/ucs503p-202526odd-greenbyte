"use client"

import * as React from "react"
import { type ThemeProviderProps } from "next-themes/dist/types"

const ThemeContext = React.createContext<
  | {
      theme: string
      setTheme: (theme: string) => void
    }
  | undefined
>(undefined)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState("system")
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    const storedTheme = localStorage.getItem(props.storageKey || "theme")
    if (storedTheme) {
      setThemeState(storedTheme)
    }
  }, [props.storageKey])

  const setTheme = (newTheme: string) => {
    localStorage.setItem(props.storageKey || "theme", newTheme)
    setThemeState(newTheme)
  }

  React.useEffect(() => {
    if (isMounted) {
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }
  }, [theme, isMounted])

  if (!isMounted) return null

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
