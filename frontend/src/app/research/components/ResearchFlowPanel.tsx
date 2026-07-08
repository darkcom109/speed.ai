import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon, Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import type { ResearchStep } from "../types"

type ResearchFlowPanelProps = {
  title: string
  badge: string
  description: string
  steps: ResearchStep[]
  message?: string
  progress?: number
  running?: boolean
}

function StagePill({ step }: { step: ResearchStep }) {
  const tone =
    step.state === "done"
      ? "bg-emerald-500"
      : step.state === "running"
        ? "bg-primary"
        : "bg-muted-foreground/50"

  return <span className={cn("mt-1.5 size-2 rounded-full", tone)} />
}

export default function ResearchFlowPanel({
  title,
  badge,
  description,
  steps,
  message,
  progress = 0,
  running = false,
}: ResearchFlowPanelProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-muted/70 bg-card shadow-sm">
        <div className="space-y-2 border-b border-border/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {running ? <Loader2Icon className="size-4 animate-spin text-primary" /> : null}
              <p className="text-base font-semibold">{title}</p>
            </div>
            <Badge variant="outline">{badge}</Badge>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-4 p-4">
          {message ? (
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
              <div className="flex items-center gap-3">
                <Loader2Icon className="size-5 animate-spin text-primary" />
                <p className="text-sm font-medium">{message}</p>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "rounded-xl border border-border/70 bg-card p-3.5 transition-colors",
                  step.state === "running" && "border-primary/40 bg-primary/5 shadow-sm",
                  step.state === "done" && "bg-muted/25"
                )}
              >
                <div className="flex items-center gap-2">
                  <StagePill step={step} />
                  <p className="text-sm font-medium">{step.title}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-muted/70 bg-card shadow-sm">
        <div className="border-b border-border/70 p-4">
          <div className="flex items-center gap-2">
            <ArrowRightIcon className="size-4 text-primary" />
            <p className="text-base font-semibold">Active run</p>
          </div>
        </div>
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between rounded-2xl border border-dashed border-border/80 px-4 py-3 text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            The agent is planning, searching, fetching, and synthesizing in the background.
          </div>
        </div>
      </div>
    </section>
  )
}
