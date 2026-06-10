import { describe, expect, it } from "vitest"
import {
  formatModeName,
  getLineColor,
  getLineStatusGroups,
  getStatusStyles,
} from "./transport-utils"
import type { TflLineStatus } from "@/app/transport/types/tfl-status"

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

describe("transport utils", () => {
  it("formats dashed mode names", () => {
    expect(formatModeName("elizabeth-line")).toBe("Elizabeth Line")
  })

  it("returns the colour for a known line", () => {
    expect(getLineColor(createLine())).toBe("#E32017")
  })

  it("returns the fallback colour for an unknown line", () => {
    expect(getLineColor(createLine({ id: "unknown" }))).toBe("var(--primary)")
  })

  it("returns destructive styles for disrupted lines", () => {
    const styles = getStatusStyles(createLine({ status: "Minor Delays" }))

    expect(styles.card).toBe("border-destructive/40 bg-destructive/5")
  })

  it("groups good and disrupted lines", () => {
    const groups = getLineStatusGroups([
      createLine({ id: "central", status: "Good Service" }),
      createLine({ id: "district", status: "Minor Delays" }),
    ])

    expect(groups.goodServiceLines).toHaveLength(1)
    expect(groups.disruptedLines).toHaveLength(1)
  })
})
