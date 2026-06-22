import { useEffect, useState } from "react"
import { getNotifications } from "@/app/notifications/api/notifications-api"
import type { AppNotification } from "@/app/notifications/types/notification"

export default function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  async function loadNotifications() {
    try {
      setError("")
      const loadedNotifications = await getNotifications()

      setNotifications(loadedNotifications)
    } 
    catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to load notifications"
      )
    } 
    finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()

    window.addEventListener("tasks-updated", loadNotifications)

    return () => {
      window.removeEventListener("tasks-updated", loadNotifications)
    }
  }, [])

  return {
    notifications,
    error,
    isLoading
  }
}