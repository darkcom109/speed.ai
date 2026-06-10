import {
  DisruptedLinesSection,
  TransportHeader,
  TransportLoadingGrid,
  TransportSummaryCards,
} from "@/app/transport/components/status"
import useTransportStatus from "@/app/transport/hooks/use-transport-status"
import TransportLayout from "@/app/transport/components/TransportLayout"

/**
 * Page shell for live Tfl line status.
 * 
 * @returns The transport status page layout.
 */
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
    <TransportLayout>
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
    </TransportLayout>
  )
}
