export type ResearchStep = {
  id: string
  title: string
  detail: string
  state: "pending" | "running" | "done"
}

export type ResearchSource = {
  title: string
  url: string
  snippet: string
}

export type ResearchLoop = {
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

export type ResearchResponse = {
  goal: string
  prompt?: string
  message: string
  findings: string[]
  sources: ResearchSource[]
  loop: ResearchLoop
  done: boolean
}
