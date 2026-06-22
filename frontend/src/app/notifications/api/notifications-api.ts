import type { AppNotification } from "@/app/notifications/types/notification";
import { apiClient } from "@/lib/api-client";

export async function getNotifications(): Promise<AppNotification[]> {
    const { data } = await apiClient.get<{ notifications: AppNotification[] }>("/notifications")

    return data.notifications
}