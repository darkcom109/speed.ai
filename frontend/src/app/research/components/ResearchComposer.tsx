import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BrainCircuitIcon, Loader2Icon, PlayIcon, SparklesIcon } from "lucide-react"
import type { ResearchStep } from "../types"
import { makeInitialSteps, quickPrompts } from "../utils"

type ResearchComposerProps = {
  prompt: string
  setPrompt: (value: string) => void
  onRun: () => void
  isRunning: boolean
  steps?: ResearchStep[]
}

export default function ResearchComposer({
  prompt,
  setPrompt,
  onRun,
  isRunning,
  steps,
}: ResearchComposerProps) {
  const previewSteps = steps ?? makeInitialSteps(prompt)

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6 p-6 sm:p-8 lg:p-10">
          <div className="space-y-3">
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
              <SparklesIcon className="mr-1.5 size-3.5" />
              Recursive research
            </Badge>
            <div className="space-y-2">
              <h3 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                What should the agent research?
              </h3>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Add a person, company, topic, or question. We&apos;ll move straight into the
                loading state and then show the finished result.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-border/70 bg-background/80 p-4 shadow-sm">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask the research engine to research a person, company, topic, or question..."
              className="min-h-36 resize-none border-0 bg-transparent px-1 py-1.5 text-base shadow-none focus-visible:ring-0 sm:px-2 sm:py-2"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {quickPrompts.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-background/70"
                  onClick={() => setPrompt(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              The flow will only show one stage at a time.
            </p>
            <div className="flex items-center gap-2">
              <Button onClick={onRun} disabled={isRunning} className="rounded-full px-5">
                {isRunning ? <Loader2Icon className="size-4 animate-spin" /> : <PlayIcon />}
                Run research
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 bg-muted/20 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
          <div className="flex items-center gap-2">
            <BrainCircuitIcon className="size-4 text-primary" />
            <p className="text-sm font-medium">How it works</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Planning, search, inspection, and synthesis run as one flow.
          </p>

          <div className="mt-6 space-y-3">
            {previewSteps.map((step, index) => (
              <div
                key={step.id}
                className="rounded-2xl border border-border/70 bg-background/80 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-7 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{step.title}</span>
                      <span
                        className={`size-2 rounded-full ${
                          step.state === "done"
                            ? "bg-emerald-500"
                            : step.state === "running"
                              ? "bg-primary"
                              : "bg-muted-foreground"
                        }`}
                      />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
