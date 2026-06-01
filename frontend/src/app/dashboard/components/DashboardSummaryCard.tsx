import { BotIcon, SparklesIcon } from "lucide-react"

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-muted">
            <BotIcon className="size-5 text-muted-foreground" />
          </span>
          <div>
            <h3 className="text-base font-semibold">AI summary</h3>
            <p className="text-sm text-muted-foreground">
              Tasks and finances at a glance.
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center gap-1 rounded-md border px-2.5 py-1 text-xs text-muted-foreground">
          <SparklesIcon className="size-3.5" />
          Workspace insight
        </span>
      </div>

      {isLoading ? (
        <div className="mt-5 space-y-2 border-l border-border pl-4">
          <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      ) : error ? (
        <p className="mt-5 border-l border-red-500/60 pl-4 text-sm text-red-500">
          {error}
        </p>
      ) : (
        <p className="mt-5 max-w-4xl border-l border-primary/50 pl-4 text-sm leading-7 text-foreground/80">
          {summary || "No summary available yet."}
        </p>
      )}
    </section>
  )
}
