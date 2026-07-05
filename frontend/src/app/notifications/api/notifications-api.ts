import type { AppNotification } from "@/app/notifications/types/notification";
import { apiClient } from "@/lib/api-client";

export async function getNotifications(): Promise<AppNotification[]> {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const { data } = await apiClient.get<{ notifications: AppNotification[] }>("/notifications", {
        params: {
            timeZone,
        },
    })

    return data.notifications
}
