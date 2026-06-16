import { apiClient } from "@/lib/api-client"

export async function getDashboardSummary() {
  const { data } = await apiClient.get<{ message: string }>("/assistant/dashboard-summary")

  return data.message
}
