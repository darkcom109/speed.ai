/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

export type Theme = "dark"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(
  undefined
)

function applyDarkTheme() {
  const root = document.documentElement

  root.classList.remove("light")
  root.classList.add("dark")
  root.style.colorScheme = "dark"
  window.localStorage.setItem("theme", "dark")
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  React.useEffect(() => {
    applyDarkTheme()
  }, [])

  const setTheme = React.useCallback(() => {
    applyDarkTheme()
  }, [])

  const value = React.useMemo(
    () => ({ theme: "dark" as const, setTheme }),
    [setTheme]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
