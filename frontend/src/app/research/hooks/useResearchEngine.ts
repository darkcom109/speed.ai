import { useMemo, useState } from "react"

import { apiClient } from "@/lib/api-client"
import { toast } from "@/lib/single-toast"

import { makeInitialSteps, makeStepsFromLoop } from "../utils"
import type { ResearchLoop, ResearchResponse, ResearchStep } from "../types"

export default function useResearchEngine() {
  const [goal, setGoal] = useState("")
  const [prompt, setPrompt] = useState("")
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

    const effectiveGoal = goal.trim() || prompt.trim()

    if (!effectiveGoal) {
      toast.error("Add a goal or prompt before running research")
      return
    }

    setIsRunning(true)
    setIteration(0)
    setResult(null)

    try {
      setFinding("Running the research agent...")
      setSteps(makeInitialSteps(effectiveGoal))

      const response = await fetch(`${apiClient.defaults.baseURL}/assistant/research?stream=1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-stream-progress": "1",
        },
        body: JSON.stringify({
          goal: effectiveGoal,
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
              sources?: { title: string; url: string; snippet: string }[]
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
          setSteps(makeStepsFromLoop(effectiveGoal, event.loop))
        }

        if (event.message) {
          setFinding(event.message)
        }

        if (event.type === "done") {
          const finishedSteps = makeInitialSteps(effectiveGoal).map((step) => ({
            ...step,
            state: "done" as const,
          }))

          setSteps(finishedSteps)
          setResult({
            goal: effectiveGoal,
            prompt,
            message: event.message || "Research complete.",
            findings: event.findings || [],
            sources: event.sources || [],
            loop:
              event.loop || {
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

  function resetResearch() {
    setGoal("")
    setPrompt("")
    setIsRunning(false)
    setIteration(0)
    setSteps(makeInitialSteps(""))
    setFinding("Ready to begin. Give the agent a goal, then let it plan, search, verify, and refine.")
    setResult(null)
  }

  return {
    goal,
    setGoal,
    prompt,
    setPrompt,
    isRunning,
    iteration,
    steps,
    finding,
    result,
    progress,
    runLoop,
    resetResearch,
  }
}
