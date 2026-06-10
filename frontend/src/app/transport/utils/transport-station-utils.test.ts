import { describe, expect, it } from "vitest"
import {
  formatArrivalTime,
  groupArrivalsByDirection,
} from "@/app/transport/utils/transport-station-utils"
import type { TflArrival } from "@/app/transport/types/tfl-station"

function createArrival(overrides: Partial<TflArrival> = {}): TflArrival {
  return {
    id: "arrival-1",
    lineName: "Central",
    platformName: "Platform 1",
    destinationName: "Oxford Circus",
    direction: "inbound",
    timeToStation: 120,
    expectedArrival: "2026-06-10T12:00:00.000Z",
    ...overrides,
  }
}

describe("formatArrivalTime", () => {
  it("returns Due for 0 seconds", () => {
    expect(formatArrivalTime(0)).toBe("Due")
  })

  it("rounds seconds into minutes", () => {
    expect(formatArrivalTime(125)).toBe("2 min")
  })

  it("does not return negative minutes", () => {
    expect(formatArrivalTime(-60)).toBe("Due")
  })
})

describe("groupArrivalsByDirection", () => {
  it("groups arrivals by direction", () => {
    const groups = groupArrivalsByDirection([
      createArrival({ id: "1", direction: "inbound" }),
      createArrival({ id: "2", direction: "outbound" }),
      createArrival({ id: "3", direction: "inbound" }),
    ])

    expect(groups.inbound).toHaveLength(2)
    expect(groups.outbound).toHaveLength(1)
  })

  it("falls back to platform name when direction is missing", () => {
    const groups = groupArrivalsByDirection([
      createArrival({ direction: "", platformName: "Platform 2" }),
    ])

    expect(groups["Platform 2"]).toHaveLength(1)
  })
})
