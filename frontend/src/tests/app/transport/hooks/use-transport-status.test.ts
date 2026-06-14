import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getTflStatus } from "@/app/transport/api/tfl-api"
import type { TflLineStatus } from "@/app/transport/types/tfl-status"

import useTransportStatus from "@/app/transport/hooks/use-transport-status"

vi.mock("@/app/transport/api/tfl-api", () => ({
  getTflStatus: vi.fn(),
}))

function createLine(overrides: Partial<TflLineStatus> = {}): TflLineStatus {
  return {
    id: "central",
    name: "Central",
    modeName: "tube",
    status: "Good Service",
    statusSeverity: 10,
    reason: null,
    ...overrides,
  }
}

describe("useTransportStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("loads and groups TfL line status", async () => {
    vi.mocked(getTflStatus).mockResolvedValue({
      lines: [
        createLine({ id: "central", status: "Good Service" }),
        createLine({ id: "district", status: "Minor Delays" }),
      ],
    })

    const { result } = renderHook(() => useTransportStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.lines).toHaveLength(2)
    expect(result.current.goodServiceLines).toHaveLength(1)
    expect(result.current.disruptedLines).toHaveLength(1)
  })
})
