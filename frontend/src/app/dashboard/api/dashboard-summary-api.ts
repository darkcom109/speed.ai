export async function getDashboardSummary() {
  const response = await fetch(
    "http://localhost:3001/api/assistant/dashboard-summary",
    {
      credentials: "include",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to load dashboard summary")
  }

  return data.message
}
