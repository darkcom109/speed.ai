import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ResearchLoop, ResearchSource, ResearchStep } from "../types"
import { ArrowRightIcon, ChevronRightIcon, SparklesIcon, WandSparklesIcon } from "lucide-react"

type ResearchResultsPanelProps = {
  steps: ResearchStep[]
  result: {
    findings: string[]
    loop: ResearchLoop
    sources: ResearchSource[]
  }
  finding: string
  iteration: number
}

export default function ResearchResultsPanel({
  steps,
  result,
  finding,
  iteration,
}: ResearchResultsPanelProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-muted/70 shadow-sm">
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <SparklesIcon className="size-4 text-primary" />
              Research summary
            </CardTitle>
            <Badge variant="outline">Done</Badge>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            The run is finished. Here&apos;s the concise answer and the path it took.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
            <p className="text-sm font-medium">Summary</p>
            {result.findings.length ? (
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                {result.findings.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{finding}</p>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {steps.map((step) => (
              <div key={step.id} className="rounded-xl border border-border/70 bg-card p-3.5">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      step.state === "done"
                        ? "mt-1.5 size-2 rounded-full bg-emerald-500"
                        : step.state === "running"
                          ? "mt-1.5 size-2 rounded-full bg-primary"
                          : "mt-1.5 size-2 rounded-full bg-muted-foreground/50"
                    }
                  />
                  <p className="text-sm font-medium">{step.title}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <WandSparklesIcon className="size-4 text-primary" />
            Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-dashed border-border/80 px-4 py-3 text-sm text-muted-foreground">
            <span>Iterations</span>
            <span>{iteration}</span>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-sm font-medium">Loop log</p>
            {result.loop.iterations.length ? (
              <ul className="mt-3 space-y-2.5 text-sm leading-6 text-muted-foreground">
                {result.loop.iterations.map((item, index) => (
                  <li key={`${item.type}-${index}`} className="flex gap-2">
                    <ArrowRightIcon className="mt-1 size-3.5 shrink-0 text-primary" />
                    <span>{item.type === "search" ? `Search: ${item.query}` : `Fetch: ${item.url}`}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Sources</p>
            {result.sources.length ? (
              result.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{source.title}</p>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{source.snippet}</p>
                </a>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
                No sources were returned.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
