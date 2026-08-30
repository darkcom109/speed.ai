import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { clearGoogleSession } from "@/app/login/utils/clear-google-session"
import { apiClient } from "@/lib/api-client"
import { clearSidebarUser } from "@/lib/sidebar-user-store"

type User = {
  name: string
  email: string
}

export default function useSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      setError("")

      await apiClient.post("/auth/logout")

      clearGoogleSession()
      clearSidebarUser()
      navigate("/login")
    } catch {
      setError("Unable to log out")
    }
  }

  async function handleDeleteAccount() {
    try {
      await apiClient.delete("/auth/me")

      clearGoogleSession()
      clearSidebarUser()
      navigate("/signup")
    } catch {
      setError("Unable to delete account")
    }
  }

  useEffect(() => {
    async function loadUser() {
      try {
        setError("")
        setIsLoading(true)

        const { data } = await apiClient.get<{ user: User }>("/auth/me")

        setUser(data.user)
      } catch {
        setError("Unable to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [navigate])

  return {
    user,
    error,
    isLoading,
    handleLogout,
    handleDeleteAccount,
  }
}
