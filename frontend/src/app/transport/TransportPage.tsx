import type { CSSProperties } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  DisruptedLinesSection,
  TransportHeader,
  TransportLoadingGrid,
  TransportSummaryCards,
} from "@/app/transport/components/status"
import useTransportStatus from "@/app/transport/hooks/use-transport-status"

export default function TransportPage() {
  const {
    lines,
    error,
    isLoading,
    disruptedLines,
    goodServiceLines,
    loadTflStatus,
  } = useTransportStatus()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Transport" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <TransportHeader isLoading={isLoading} onRefresh={loadTflStatus} />

          <TransportSummaryCards
            lines={lines}
            goodServiceLines={goodServiceLines}
            disruptedLines={disruptedLines}
          />

          {isLoading && <TransportLoadingGrid />}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!isLoading && !error && (
            <DisruptedLinesSection disruptedLines={disruptedLines} />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
