import { apiClient } from "@/lib/api-client"

let pendingDashboardSummary: Promise<string> | null = null

export async function getDashboardSummary() {
  if (pendingDashboardSummary) {
    return pendingDashboardSummary
  }

  pendingDashboardSummary = apiClient
    .get<{ message: string }>("/assistant/dashboard-summary")
    .then(({ data }) => data.message)
    .finally(() => {
      pendingDashboardSummary = null
    })

  return pendingDashboardSummary
}
