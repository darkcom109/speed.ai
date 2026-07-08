import type { ResearchLoop, ResearchStep } from "./types"

export const quickPrompts = [
  "Compare three approaches and recommend one",
  "Turn this goal into an execution plan",
  "Find the best local model for this use case",
  "Research current best practices and pitfalls",
]

export function makeInitialSteps(goal: string): ResearchStep[] {
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

export function makeStepsFromLoop(goal: string, loop?: ResearchLoop): ResearchStep[] {
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
