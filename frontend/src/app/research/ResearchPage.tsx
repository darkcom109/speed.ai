import { ChevronLeftIcon } from "lucide-react"
import { flushSync } from "react-dom"
import { Link } from "react-router"

import Layout from "@/components/app/Layout"
import { Button } from "@/components/ui/button"

import ResearchComposer from "./components/ResearchComposer"
import ResearchFlowPanel from "./components/ResearchFlowPanel"
import ResearchResultsPanel from "./components/ResearchResultsPanel"
import useResearchEngine from "./hooks/useResearchEngine"

export default function ResearchPage() {
  const {
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
  } = useResearchEngine()

  const stage = isRunning ? "running" : result ? "results" : "compose"

  function transitionStage(update: () => void) {
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => void
    }

    if (!transitionDocument.startViewTransition) {
      update()
      return
    }

    transitionDocument.startViewTransition(() => {
      flushSync(update)
    })
  }

  function handleRun() {
    transitionStage(() => {
      void runLoop()
    })
  }

  function handleReset() {
    transitionStage(resetResearch)
  }

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Research</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Explore a topic, compare evidence, and build a sourced answer.
            </p>
          </div>

          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link to="/dashboard">
              <ChevronLeftIcon className="size-4" />
              Back
            </Link>
          </Button>
        </header>

        <div
          key={stage}
          className="research-stage animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          {!isRunning && !result ? (
            <ResearchComposer
              prompt={prompt}
              setPrompt={setPrompt}
              onRun={handleRun}
              isRunning={isRunning}
            />
          ) : isRunning ? (
            <ResearchFlowPanel
              title="Researching your question"
              badge={`${progress}% complete`}
              description="Reviewing the question, gathering sources, and preparing a concise answer."
              steps={steps}
              message={finding}
              progress={progress}
              running
            />
          ) : (
            <ResearchResultsPanel
              steps={steps}
              finding={finding}
              iteration={iteration}
              onReset={handleReset}
              result={{
                findings: result?.findings || [],
                loop:
                  result?.loop || {
                    iterations: [],
                    searches: [],
                    fetches: [],
                    findings: [],
                    sources: [],
                  },
                sources: result?.sources || [],
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
