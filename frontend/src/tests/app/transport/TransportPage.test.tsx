import type { ReactNode } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import useTransportStatus from "@/app/transport/hooks/use-transport-status"
import type { TflLineStatus } from "@/app/transport/types/tfl-status"

import TransportPage from "@/app/transport/TransportPage"

vi.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar" />,
}))

vi.mock("@/components/site-header", () => ({
  SiteHeader: ({ title }: { title: string }) => <header>{title}</header>,
}))

vi.mock("@/components/ui/sidebar", () => ({
  SidebarInset: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarProvider: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}))

vi.mock("@/app/transport/components/status", () => ({
  DisruptedLinesSection: ({
    disruptedLines,
  }: {
    disruptedLines: unknown[]
  }) => <section>Disrupted lines: {disruptedLines.length}</section>,
  TransportHeader: ({
    isLoading,
    onRefresh,
  }: {
    isLoading: boolean
    onRefresh: () => void
  }) => (
    <button type="button" disabled={isLoading} onClick={onRefresh}>
      Refresh
    </button>
  ),
  TransportLoadingGrid: () => <section>Loading transport</section>,
  TransportSummaryCards: ({
    lines,
    goodServiceLines,
    disruptedLines,
  }: {
    lines: unknown[]
    goodServiceLines: unknown[]
    disruptedLines: unknown[]
  }) => (
    <section>
      Summary: {lines.length}/{goodServiceLines.length}/{disruptedLines.length}
    </section>
  ),
}))

vi.mock("@/app/transport/hooks/use-transport-status", () => ({
  default: vi.fn(),
}))

const mockedUseTransportStatus = vi.mocked(useTransportStatus)

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

describe("TransportPage", () => {
  it("renders the loading state", () => {
    mockedUseTransportStatus.mockReturnValue({
      lines: [],
      error: "",
      isLoading: true,
      disruptedLines: [],
      goodServiceLines: [],
      loadTflStatus: vi.fn(),
    })

    render(<TransportPage />)

    expect(screen.getByText("Loading transport")).toBeInTheDocument()
    expect(screen.queryByText(/Disrupted lines:/)).not.toBeInTheDocument()
  })

  it("renders loaded summary and refresh handler", () => {
    const loadTflStatus = vi.fn()

    mockedUseTransportStatus.mockReturnValue({
      lines: [createLine({ id: "central" })],
      error: "",
      isLoading: false,
      disruptedLines: [createLine({ id: "district", status: "Minor Delays" })],
      goodServiceLines: [createLine({ id: "central" })],
      loadTflStatus,
    })

    render(<TransportPage />)

    expect(screen.getByText("Summary: 1/1/1")).toBeInTheDocument()
    expect(screen.getByText("Disrupted lines: 1")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /refresh/i }))

    expect(loadTflStatus).toHaveBeenCalledOnce()
  })

  it("renders errors instead of disrupted lines", () => {
    mockedUseTransportStatus.mockReturnValue({
      lines: [],
      error: "Unable to load TfL status",
      isLoading: false,
      disruptedLines: [],
      goodServiceLines: [],
      loadTflStatus: vi.fn(),
    })

    render(<TransportPage />)

    expect(screen.getByText("Unable to load TfL status")).toBeInTheDocument()
    expect(screen.queryByText(/Disrupted lines:/)).not.toBeInTheDocument()
  })
})
