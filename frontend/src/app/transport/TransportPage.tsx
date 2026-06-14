import {
  DisruptedLinesSection,
  TransportHeader,
  TransportLoadingGrid,
  TransportSummaryCards,
} from "@/app/transport/components/status"
import useTransportStatus from "@/app/transport/hooks/use-transport-status"
import Layout from "@/components/app/Layout"

/**
 * Page shell for live TfL line status.
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
    <Layout>
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
    </Layout>
  )
}
