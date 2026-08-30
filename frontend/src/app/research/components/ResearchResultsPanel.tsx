import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRightIcon,
  CheckIcon,
  HistoryIcon,
  PlusIcon,
  SearchCheckIcon,
  SparklesIcon,
} from "lucide-react"

import type { ResearchLoop, ResearchSource, ResearchStep } from "../types"

type ResearchResultsPanelProps = {
  steps: ResearchStep[]
  result: {
    findings: string[]
    loop: ResearchLoop
    sources: ResearchSource[]
  }
  finding: string
  iteration: number
  onReset: () => void
}

function getSourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export default function ResearchResultsPanel({
  steps,
  result,
  finding,
  iteration,
  onReset,
}: ResearchResultsPanelProps) {
  return (
    <section className="mx-auto w-full max-w-6xl py-4 sm:py-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
            <SearchCheckIcon className="size-4" />
            Research complete
          </div>
          <h3 className="mt-2 text-3xl font-semibold">Research summary</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.sources.length} sources reviewed across {iteration} iterations.
          </p>
        </div>
        <Button variant="outline" onClick={onReset}>
          <PlusIcon className="size-4" />
          New research
        </Button>
      </header>

      <div className="grid items-start gap-5 py-6 lg:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)]">
        <div className="space-y-5">
          <article className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4 text-amber-400" />
                <h4 className="text-sm font-medium">Answer</h4>
              </div>
              <Badge variant="outline">Verified</Badge>
            </div>

            <div className="p-6 sm:p-7">
              {result.findings.length ? (
                <ul className="space-y-5">
                  {result.findings.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-foreground/90">
                      <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-emerald-400">
                        <CheckIcon className="size-3.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-7 text-foreground/90">{finding}</p>
              )}
            </div>

            <div className="grid border-t border-border bg-muted/10 sm:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-2.5 border-b border-border px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
                >
                  <span className="flex size-5 items-center justify-center rounded bg-emerald-500/10 text-[10px] font-semibold text-emerald-400">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </article>

          {result.loop.iterations.length ? (
            <section className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Research activity</h4>
                </div>
                <span className="text-xs text-muted-foreground">
                  {result.loop.iterations.length} events
                </span>
              </div>
              <div className="divide-y divide-border">
                {result.loop.iterations.map((item, index) => (
                  <div key={`${item.type}-${index}`} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="mt-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                      {item.type}
                    </span>
                    <p className="min-w-0 break-all text-xs leading-5 text-muted-foreground">
                      {item.type === "search" ? item.query : item.url}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h4 className="text-sm font-medium">Sources</h4>
            <span className="text-xs text-muted-foreground">{result.sources.length} found</span>
          </div>

          <div className="divide-y divide-border">
            {result.sources.length ? (
              result.sources.map((source, index) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border border-border text-[10px] text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-2 text-sm font-medium leading-5">{source.title}</p>
                        <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{getSourceHost(source.url)}</p>
                      {source.snippet ? (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {source.snippet}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No sources were returned.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
