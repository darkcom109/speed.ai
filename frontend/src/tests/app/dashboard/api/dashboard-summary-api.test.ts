import { describe, expect, it, vi } from "vitest"

import { getDashboardSummary } from "@/app/dashboard/api/dashboard-summary-api"
import { apiClient } from "@/lib/api-client"

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe("getDashboardSummary", () => {
  it("returns the summary message", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { message: "Your workload is manageable." },
    })

    await expect(getDashboardSummary()).resolves.toBe(
      "Your workload is manageable."
    )
    expect(apiClient.get).toHaveBeenCalledWith("/assistant/dashboard-summary")
  })
})
