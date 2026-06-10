import type { TflLineStatus } from "@/app/transport/types/tfl-status"

import LineStatusCard from "./LineStatusCard"

type DisruptedLinesSectionProps = {
  disruptedLines: TflLineStatus[]
}

export default function DisruptedLinesSection({
  disruptedLines,
}: DisruptedLinesSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Needs attention</h3>
        <p className="text-xs text-muted-foreground">
          Lines with delays, closures, or service changes.
        </p>
      </div>
      {disruptedLines.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {disruptedLines.map((line) => (
            <LineStatusCard key={line.id} line={line} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          No disruptions reported.
        </div>
      )}
    </section>
  )
}
