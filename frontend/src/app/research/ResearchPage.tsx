import { ChevronLeftIcon } from "lucide-react"
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
  } = useResearchEngine()

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
          <ResearchComposer
            prompt={prompt}
            setPrompt={setPrompt}
            onRun={runLoop}
            isRunning={isRunning}
            steps={steps}
          />
        ) : isRunning ? (
          <ResearchFlowPanel
            title="Research in progress"
            badge={`${progress}% complete`}
            description="The agent is planning, searching, fetching, and synthesizing in the background."
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
    </Layout>
  )
}
