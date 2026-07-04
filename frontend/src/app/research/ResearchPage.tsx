import { useMemo, useState } from "react"
import {
  ArrowRightIcon,
  BrainCircuitIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  Loader2Icon,
  PlayIcon,
  SearchIcon,
  SparklesIcon,
  WandSparklesIcon,
} from "lucide-react"
import { Link } from "react-router"

import Layout from "@/components/app/Layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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

const quickPrompts = [
  "Compare three approaches and recommend one",
  "Turn this goal into an execution plan",
  "Find the best local model for this use case",
  "Research current best practices and pitfalls",
]

function makeInitialSteps(goal: string): ResearchStep[] {
  const label = goal.trim() || "your goal"

  return [
    {
      id: "plan",
      title: "Plan",
      detail: `Break ${label} into the smallest useful questions.`,
      state: "pending",
    },
    {
      id: "search",
      title: "Search",
      detail: "Gather source candidates and filter the noise.",
      state: "pending",
    },
    {
      id: "fetch",
      title: "Inspect",
      detail: "Pull the strongest pages and extract useful context.",
      state: "pending",
    },
    {
      id: "synth",
      title: "Synthesize",
      detail: "Turn evidence into a concise answer with next actions.",
      state: "pending",
    },
  ]
}

function makeStepsFromLoop(goal: string, loop?: ResearchLoop): ResearchStep[] {
  const label = goal.trim() || "your goal"
  const steps: ResearchStep[] = [
    {
      id: "plan",
      title: "Plan",
      detail: `Break ${label} into the smallest useful questions.`,
      state: loop?.iterations.length ? "done" : "pending",
    },
    {
      id: "search",
      title: "Search",
      detail: loop?.searches[0]
        ? `Search query: ${loop.searches[0].query}`
        : "Gather source candidates and filter the noise.",
      state: loop?.searches.length ? "done" : "pending",
    },
    {
      id: "fetch",
      title: "Inspect",
      detail: loop?.fetches.length
        ? `Fetched ${loop.fetches.length} source${loop.fetches.length === 1 ? "" : "s"}.`
        : "Pull the strongest pages and extract useful context.",
      state: loop?.fetches.length ? "done" : "pending",
    },
    {
      id: "synth",
      title: "Synthesize",
      detail: loop?.findings[0]
        ? loop.findings[0]
        : "Turn evidence into a concise answer with next actions.",
      state: loop?.findings.length ? "done" : "pending",
    },
  ]

  if (loop?.iterations.length) {
    const lastIteration = loop.iterations[loop.iterations.length - 1]
    if (lastIteration?.type === "search") steps[1].state = "running"
    else if (lastIteration?.type === "fetch") steps[2].state = "running"
    else steps[3].state = "running"
  } else {
    steps[0].state = "running"
  }

  return steps
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
    if (result?.done) return 100
    const doneCount = steps.filter((step) => step.state === "done").length
    return Math.round((doneCount / steps.length) * 100)
  }, [result, steps])

  async function runLoop() {
    if (isRunning) return

    setIsRunning(true)
    setIteration(0)
    setResult(null)

    try {
      setFinding("Running the research agent...")
      setSteps(makeInitialSteps(goal))

      const response = await fetch(`${apiClient.defaults.baseURL}/assistant/research?stream=1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-stream-progress": "1",
        },
        body: JSON.stringify({
          goal,
          prompt,
          maxIterations: 6,
        }),
      })

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Unable to run the research agent")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      const handleEvent = (
        event:
          | { type: "status"; message?: string; loop?: ResearchLoop }
          | { type: "step"; message?: string; loop?: ResearchLoop }
          | {
              type: "done"
              message?: string
              findings?: string[]
              sources?: ResearchSource[]
              loop?: ResearchLoop
              done?: boolean
            }
          | { type: "error"; error?: string }
      ) => {
        if (event.type === "error") {
          throw new Error(event.error || "Unable to run the research agent")
        }

        if (event.loop) {
          setIteration(event.loop.iterations.length)
          setSteps(makeStepsFromLoop(goal, event.loop))
        }

        if (event.message) {
          setFinding(event.message)
        }

        if (event.type === "done") {
          const finishedSteps = makeInitialSteps(goal).map((step) => ({
            ...step,
            state: "done" as const,
          }))

          setSteps(finishedSteps)
          setResult({
            goal,
            prompt,
            message: event.message || "Research complete.",
            findings: event.findings || [],
            sources: event.sources || [],
            loop: event.loop || {
              iterations: [],
              searches: [],
              fetches: [],
              findings: [],
              sources: [],
            },
            done: true,
          })
          setIteration((event.loop?.iterations.length || iteration) || 0)
          setFinding(event.message || "Research complete.")
        }
      }

      while (true) {
        const { value, done } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          handleEvent(JSON.parse(trimmed))
        }
      }

      const trailing = buffer.trim()
      if (trailing) {
        handleEvent(JSON.parse(trailing))
      }

      setFinding((current) => current || "Research complete.")
      toast.success("Research complete")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to run the research agent"
      setFinding(message)
      toast.error(message)
    } finally {
      setIsRunning(false)
    }
  }

  const activeSteps = isRunning ? steps : result ? steps : []

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Research Engine</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Give the agent a goal and let it iterate through planning, search, inspection, and synthesis.
            </p>
          </div>

          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link to="/dashboard">
              <ChevronLeftIcon className="size-4" />
              Back
            </Link>
          </Button>
        </header>

        {!isRunning && !result ? (
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
                      Add a question, compare options, or hand it a goal. We’ll move straight into
                      the loading state and then show the finished result.
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-border/70 bg-background/80 p-4 shadow-sm">
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask the research engine to build, compare, explain, or verify..."
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
                    <Button onClick={runLoop} disabled={isRunning} className="rounded-full px-5">
                      {isRunning ? <Loader2Icon className="size-4 animate-spin" /> : <PlayIcon />}
                      Run research
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/70 bg-muted/20 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuitIcon className="size-4 text-primary" />
                    <p className="text-sm font-medium">How it works</p>
                  </div>
                  <Badge variant="outline">{progress}%</Badge>
                </div>

                <div className="mt-5 space-y-3">
                  {makeInitialSteps(goal).map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-3"
                    >
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background">
                        <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <StagePill step={step} />
                          <p className="text-sm font-medium">{step.title}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : isRunning ? (
          <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-muted/70 shadow-sm">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Loader2Icon className="size-4 animate-spin text-primary" />
                    Research in progress
                  </CardTitle>
                  <Badge variant="outline">{progress}% complete</Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  The agent is planning, searching, fetching, and synthesizing in the background.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                  <div className="flex items-center gap-3">
                    <Loader2Icon className="size-5 animate-spin text-primary" />
                    <p className="text-sm font-medium">{finding}</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {activeSteps.map((step) => (
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
              </CardContent>
            </Card>

            <Card className="border-muted/70 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <SearchIcon className="size-4 text-primary" />
                  Active run
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Current prompt</p>
                    <Badge variant="outline">Running</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{prompt}</p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-sm font-medium">What the agent is doing</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    <li className="flex gap-2">
                      <ArrowRightIcon className="mt-1 size-3.5 shrink-0 text-primary" />
                      Planning the smallest useful questions.
                    </li>
                    <li className="flex gap-2">
                      <ArrowRightIcon className="mt-1 size-3.5 shrink-0 text-primary" />
                      Searching, fetching, and comparing sources.
                    </li>
                    <li className="flex gap-2">
                      <ArrowRightIcon className="mt-1 size-3.5 shrink-0 text-primary" />
                      Summarizing the strongest evidence.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : (
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
                  The run is finished. Here’s the concise answer and the path it took.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                  <p className="text-sm font-medium">Summary</p>
                  {result?.findings.length ? (
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
                    <div
                      key={step.id}
                      className="rounded-xl border border-border/70 bg-card p-3.5"
                    >
                      <div className="flex items-center gap-2">
                        <StagePill step={step} />
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
                  {result?.loop.iterations.length ? (
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
                  {result?.sources.length ? (
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
        )}
      </div>
    </Layout>
  )
}
