import { AlertTriangleIcon, TrainFrontIcon } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

import type { TflLineStatus } from "@/app/transport/types/tfl-status"
import { chartConfig } from "@/app/transport/utils/chart-config"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

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
  const chartData = [
    {
      status: "Good service",
      value: goodServiceLines.length,
      fill: "var(--color-good)",
    },
    {
      status: "Disrupted",
      value: disruptedLines.length,
      fill: "var(--color-disrupted)",
    },
  ]

  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(min(18rem,100%),1fr))] gap-4">
      <div className="flex min-h-28 items-center rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <TrainFrontIcon className="size-5" />
          </div>
          <div>
            <p className="text-3xl font-semibold leading-none">
              {lines.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Lines tracked</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-28 items-center rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangleIcon className="size-5" />
          </div>
          <div>
            <p className="text-3xl font-semibold leading-none">
              {disruptedLines.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Disrupted lines
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-28 items-center rounded-lg border bg-card p-4">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_6rem] items-center gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-medium">Network split</h3>
            <p className="text-xs text-muted-foreground">
              Good service vs disruption
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-primary" />
                {goodServiceLines.length} good
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-destructive" />
                {disruptedLines.length} issues
              </span>
            </div>
          </div>
          <div className="flex justify-end">
            <ChartContainer
              config={chartConfig}
              className="aspect-square h-24 w-24"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="status"
                  innerRadius={28}
                  outerRadius={44}
                  strokeWidth={0}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
