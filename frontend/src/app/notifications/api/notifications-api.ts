import type { AppNotification } from "../types/notification";

export async function getNotifications(): Promise<AppNotification[]> {
    const response = await fetch("http://localhost:3001/api/notifications", {
        credentials: "include"
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Unable to load notifications")
    }

    return data.notifications
}