import { BotIcon } from "lucide-react"

type DashboardSummaryCardProps = {
  summary: string
  error: string
  isLoading: boolean
}

export default function DashboardSummaryCard({
  summary,
  error,
  isLoading,
}: DashboardSummaryCardProps) {
  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md bg-muted">
          <BotIcon className="size-4 text-muted-foreground" />
        </span>
        <div>
          <h3 className="text-base font-semibold">AI summary</h3>
          <p className="text-sm text-muted-foreground">
            Tasks and finances at a glance.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {summary || "No summary available yet."}
        </p>
      )}
    </section>
  )
}
