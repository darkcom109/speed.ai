import type { TflLineStatus } from "@/app/transport/types/tfl-status"

import LineStatusCard from "./LineStatusCard"

type DisruptedLinesSectionProps = {
  disruptedLines: TflLineStatus[]
}

export default function DisruptedLinesSection({
  disruptedLines,
}: DisruptedLinesSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4 border-b pb-3">
        <div>
          <h3 className="text-base font-semibold">Needs attention</h3>
          <p className="text-sm text-muted-foreground">
            Delays, closures, and service changes across the network.
          </p>
        </div>
        <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
          {disruptedLines.length}{" "}
          {disruptedLines.length === 1 ? "line" : "lines"}
        </span>
      </div>
      {disruptedLines.length > 0 ? (
        <div className="grid gap-2 lg:grid-cols-2">
          {disruptedLines.map((line) => (
            <LineStatusCard key={line.id} line={line} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          All tracked lines are reporting good service.
          <span className="sr-only">No disruptions reported.</span>
        </div>
      )}
    </section>
  )
}
