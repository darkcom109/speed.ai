import { useMemo, useState } from "react"
import {
  BrainCircuitIcon,
  Loader2Icon,
  PlayIcon,
  SearchIcon,
  SparklesIcon,
  WandSparklesIcon,
  ChevronRightIcon,
} from "lucide-react"

import Layout from "@/components/app/Layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import { toast } from "@/lib/single-toast"
import { cn } from "@/lib/utils"

type ResearchStep = {
  id: string
  title: string
  detail: string
  state: "pending" | "running" | "done"
}

type ResearchSource = {
  title: string
  url: string
  snippet: string
}

type ResearchLoop = {
  iterations: Array<
    | { type: "search"; query: string; reason?: string }
    | { type: "fetch"; url: string; reason?: string }
  >
  searches: Array<{
    query: string
    results: ResearchSource[]
  }>
  fetches: Array<{
    title: string
    content: string
    links: string[]
  }>
  findings: string[]
  sources: ResearchSource[]
}

type ResearchResponse = {
  goal: string
  prompt?: string
  message: string
  findings: string[]
  sources: ResearchSource[]
  loop: ResearchLoop
  done: boolean
}

function makeInitialSteps(goal: string): ResearchStep[] {
  const label = goal.trim() || "your goal"

  return [
    {
      id: "plan",
      title: "Plan the research",
      detail: `Break ${label} into the smallest useful questions.`,
      state: "pending",
    },
    {
      id: "search",
      title: "Search for signals",
      detail: "Gather source candidates and filter the noise.",
      state: "pending",
    },
    {
      id: "fetch",
      title: "Fetch and inspect sources",
      detail: "Pull the strongest pages and extract useful context.",
      state: "pending",
    },
    {
      id: "synth",
      title: "Synthesize findings",
      detail: "Turn evidence into a concise answer with next actions.",
      state: "pending",
    },
  ]
}

function makeSources(goal: string): ResearchSource[] {
  void goal

  return []
}

function makeStepsFromLoop(goal: string, loop?: ResearchLoop): ResearchStep[] {
  const label = goal.trim() || "your goal"

  const steps: ResearchStep[] = [
    {
      id: "plan",
      title: "Plan the research",
      detail: `Break ${label} into the smallest useful questions.`,
      state: loop?.iterations.length ? "done" : "pending",
    },
    {
      id: "search",
      title: "Search for signals",
      detail: loop?.searches[0]
        ? `Search query: ${loop.searches[0].query}`
        : "Gather source candidates and filter the noise.",
      state: loop?.searches.length ? "done" : "pending",
    },
    {
      id: "fetch",
      title: "Fetch and inspect sources",
      detail: loop?.fetches.length
        ? `Fetched ${loop.fetches.length} source${loop.fetches.length === 1 ? "" : "s"}.`
        : "Pull the strongest pages and extract useful context.",
      state: loop?.fetches.length ? "done" : "pending",
    },
    {
      id: "synth",
      title: "Synthesize findings",
      detail: loop?.findings[0]
        ? loop.findings[0]
        : "Turn evidence into a concise answer with next actions.",
      state: loop?.findings.length ? "done" : "pending",
    },
  ]

  if (loop?.iterations.length) {
    const lastIteration = loop.iterations[loop.iterations.length - 1]
    if (lastIteration?.type === "search") {
      steps[1].state = "running"
    } else if (lastIteration?.type === "fetch") {
      steps[2].state = "running"
    } else {
      steps[3].state = "running"
    }
  } else {
    steps[0].state = "running"
  }

  return steps
}

export default function ResearchPage() {
  const [goal, setGoal] = useState("Research the best way to build a recursive AI agent")
  const [prompt, setPrompt] = useState(
    "Find a strong architecture, recommend a model, and outline the iterative loop."
  )
  const [isRunning, setIsRunning] = useState(false)
  const [iteration, setIteration] = useState(0)
  const [steps, setSteps] = useState<ResearchStep[]>(() => makeInitialSteps(goal))
  const [finding, setFinding] = useState(
    "Ready to begin. Give the agent a goal, then let it plan, search, verify, and refine."
  )
  const [result, setResult] = useState<ResearchResponse | null>(null)

  const progress = useMemo(() => {
    if (result?.done) {
      return 100
    }

    const doneCount = steps.filter((step) => step.state === "done").length

    return Math.round((doneCount / steps.length) * 100)
  }, [result, steps])

  async function runLoop() {
    if (isRunning) {
      return
    }

    setIsRunning(true)
    setIteration(0)

    try {
      setFinding("Running the research agent...")
      setSteps(makeInitialSteps(goal))

      const { data } = await apiClient.post<ResearchResponse>("/assistant/research", {
        goal,
        prompt,
        maxIterations: 6,
      })

      setResult(data)
      setIteration(data.loop.iterations.length)
      setSteps(
        data.done
          ? makeInitialSteps(goal).map((step) => ({
              ...step,
              state: "done",
            }))
          : makeStepsFromLoop(goal, data.loop)
      )
      setFinding(data.message)

      toast.success("Research complete")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to run the research agent"

      setFinding(message)
      toast.error(message)
    } finally {
      setIsRunning(false)
    }
  }

  function resetLoop() {
    setIsRunning(false)
    setIteration(0)
    setSteps(makeInitialSteps(goal))
    setFinding("Reset complete. You can try another research goal.")
    setResult(null)
  }

  return (
    <Layout>
      <div className="space-y-5 pb-2">
        <section className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Research Engine</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Give the agent a goal and let it iterate through planning, search, inspection, and synthesis.
          </p>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
          <Card className="border-muted/70 shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BrainCircuitIcon className="size-4 text-primary" />
                    Agent loop
                  </CardTitle>
                  <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                    This is the recursive control room for long-running research tasks.
                  </p>
                </div>
                <Badge variant="outline">{progress}% complete</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Goal</label>
                  <Input
                    value={goal}
                    onChange={(event) => {
                      const nextGoal = event.target.value
                      setGoal(nextGoal)

                      if (!result) {
                        setSteps(makeInitialSteps(nextGoal))
                        setSources(makeSources(nextGoal))
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    className="min-h-28"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={runLoop} disabled={isRunning}>
                  {isRunning ? <Loader2Icon className="animate-spin" /> : <PlayIcon />}
                  {isRunning ? "Running loop" : "Run research loop"}
                </Button>
                <Button variant="outline" onClick={resetLoop} disabled={isRunning}>
                  Reset
                </Button>
              </div>

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
                      <span
                        className={cn(
                          "size-2.5 rounded-full",
                          step.state === "done" && "bg-emerald-500",
                          step.state === "running" && "bg-primary",
                          step.state === "pending" && "bg-muted-foreground/50"
                        )}
                      />
                      <p className="text-sm font-medium">{step.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-muted/70 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <SparklesIcon className="size-4 text-primary" />
                  Live summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {result?.findings?.length ? (
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-sm font-medium">Findings</p>
                    <ul className="mt-2 space-y-2.5 text-sm leading-6 text-muted-foreground">
                      {result.findings.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 size-1.5 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm leading-6">
                  {finding}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-dashed border-border/80 px-3 py-2 text-sm text-muted-foreground">
                  <span>Iterations</span>
                  <span>{iteration}</span>
                </div>
                <Badge variant="outline" className="w-fit">
                  {result?.done ? "Done" : "Ready"}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SearchIcon className="size-4" />
                  Research mode: recursive planning and verification
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
              <CardContent className="space-y-3">
                {result?.loop?.iterations?.length ? (
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-sm font-medium">Loop log</p>
                    <ul className="mt-2 space-y-2.5 text-sm leading-6 text-muted-foreground">
                      {result.loop.iterations.map((item, index) => (
                        <li key={`${item.type}-${index}`} className="flex gap-2">
                          <span className="mt-1 size-1.5 rounded-full bg-primary" />
                          <span>
                            {item.type === "search"
                              ? `Search: ${item.query}`
                              : `Fetch: ${item.url}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {result?.done ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                    Research finished successfully.
                  </div>
                ) : null}
                {result?.sources?.length ? (
                  result.sources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{source.title}</p>
                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{source.snippet}</p>
                    </a>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border/80 p-3 text-sm text-muted-foreground">
                    Sources will appear here after the agent runs.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}
