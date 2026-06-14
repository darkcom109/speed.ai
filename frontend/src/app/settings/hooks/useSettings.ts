import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { useTheme } from "@/components/theme-provider"
import { clearGoogleSession } from "@/app/login/utils/clear-google-session"

type User = {
  name: string
  email: string
}

export default function useSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  async function handleLogout() {
    try {
      const response = await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Unable to log out")
        return
      }

      clearGoogleSession()
      navigate("/login")
    } catch {
      setError("Unable to log out")
    }
  }

  async function handleDeleteAccount() {
    try {
      const response = await fetch("http://localhost:3001/api/auth/me", {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Unable to delete account")
        return
      }

      clearGoogleSession()
      navigate("/signup")
    } catch {
      setError("Unable to delete account")
    }
  }

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("http://localhost:3001/api/auth/me", {
          credentials: "include",
        })

        if (!response.ok) {
          navigate("/login")
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch {
        setError("Unable to load settings")
      }
    }

    loadUser()
  }, [navigate])

  return {
    user,
    error,
    theme,
    setTheme,
    handleLogout,
    handleDeleteAccount,
  }
}
