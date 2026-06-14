import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { useTheme } from "@/components/theme-provider"
import { clearGoogleSession } from "@/app/login/utils/clear-google-session"
import { apiClient } from "@/lib/api-client"

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
      setError("")

      await apiClient.post("/auth/logout")

      clearGoogleSession()
      navigate("/login")
    } catch {
      setError("Unable to log out")
    }
  }

  async function handleDeleteAccount() {
    try {
      await apiClient.delete("/auth/me")

      clearGoogleSession()
      navigate("/signup")
    } catch {
      setError("Unable to delete account")
    }
  }

  useEffect(() => {
    async function loadUser() {
      try {
        setError("")

        const { data } = await apiClient.get<{ user: User }>("/auth/me")
        
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
    handleDeleteAccount
  }
}