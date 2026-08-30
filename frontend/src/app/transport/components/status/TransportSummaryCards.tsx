import {
  ActivityIcon,
  AlertTriangleIcon,
  CircleCheckIcon,
  TrainFrontIcon,
} from "lucide-react"

import type { TflLineStatus } from "@/app/transport/types/tfl-status"

type TransportSummaryCardsProps = {
  lines: TflLineStatus[]
  goodServiceLines: TflLineStatus[]
  disruptedLines: TflLineStatus[]
}

export default function TransportSummaryCards({
  lines,
  goodServiceLines,
  disruptedLines,
}: TransportSummaryCardsProps) {
  const servicePercentage = lines.length
    ? Math.round((goodServiceLines.length / lines.length) * 100)
    : 0
  const hasDisruptions = disruptedLines.length > 0

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="grid divide-y sm:grid-cols-[1.3fr_0.7fr_0.7fr] sm:divide-x sm:divide-y-0">
        <div className="flex min-w-0 items-center gap-3 p-4 sm:p-5">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-md ${
              hasDisruptions
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {hasDisruptions ? (
              <ActivityIcon className="size-5" />
            ) : (
              <CircleCheckIcon className="size-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="font-medium">
                  {hasDisruptions ? "Service disruptions" : "Good service"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {goodServiceLines.length} of {lines.length} lines operating
                  normally
                </p>
              </div>
              <span className="text-sm font-medium tabular-nums">
                {servicePercentage}%
              </span>
            </div>
            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-destructive/70">
              <div
                className="bg-emerald-500 transition-[width] duration-500"
                style={{ width: `${servicePercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 sm:p-5">
          <TrainFrontIcon className="size-4 text-muted-foreground" />
          <div>
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {lines.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Lines tracked</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 sm:p-5">
          <AlertTriangleIcon
            className={`size-4 ${
              hasDisruptions ? "text-destructive" : "text-muted-foreground"
            }`}
          />
          <div>
            <p className="text-2xl leading-none font-semibold tabular-nums">
              {disruptedLines.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Disrupted lines
            </p>
          </div>
        </div>
      </div>

      <div className="sr-only">
        <span>{goodServiceLines.length} good</span>
        <span>{disruptedLines.length} issues</span>
      </div>
    </section>
  )
}
