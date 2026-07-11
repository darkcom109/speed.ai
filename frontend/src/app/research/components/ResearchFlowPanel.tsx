import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckIcon, CircleIcon, Loader2Icon } from "lucide-react"

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

function StepStatus({ step }: { step: ResearchStep }) {
  if (step.state === "done") {
    return (
      <span className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-emerald-400">
        <CheckIcon className="size-4" />
      </span>
    )
  }

  if (step.state === "running") {
    return (
      <span className="flex size-8 items-center justify-center rounded-md border border-border bg-card">
        <Loader2Icon className="size-4 animate-spin" />
      </span>
    )
  }

  return (
    <span className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
      <CircleIcon className="size-3" />
    </span>
  )
}

export default function ResearchFlowPanel({
  title,
  badge,
  description,
  steps,
  message,
  progress = 0,
}: ResearchFlowPanelProps) {
  return (
    <section className="mx-auto w-full max-w-7xl py-10 sm:py-14">
      <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Live research
          </div>
          <h3 className="mt-3 text-3xl font-semibold">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="w-fit px-3 py-1.5 text-xs">
          {badge}
        </Badge>
      </header>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-foreground transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "grid gap-4 px-5 py-5 transition-colors duration-300 sm:grid-cols-[2.5rem_2.5rem_minmax(0,1fr)_5rem] sm:items-start",
              index !== steps.length - 1 && "border-b border-border",
              step.state === "running" && "bg-muted/25"
            )}
          >
            <span className="pt-1 text-xs font-medium text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <StepStatus step={step} />
            <div className="min-w-0">
              <p className="text-sm font-medium">{step.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.detail}</p>
            </div>
            <span className="text-left text-xs capitalize text-muted-foreground sm:pt-2 sm:text-right">
              {step.state}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-card px-5 py-4">
        <Loader2Icon className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" />
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">Current activity</p>
          <p className="mt-1 break-all text-sm leading-6 text-foreground/80">
            {message || "Preparing the research request..."}
          </p>
        </div>
      </div>
    </section>
  )
}
