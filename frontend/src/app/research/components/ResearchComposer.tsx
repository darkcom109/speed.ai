import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowRightIcon,
  BookOpenCheckIcon,
  GitCompareArrowsIcon,
  ListChecksIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react"

import { quickPrompts } from "../utils"

type ResearchComposerProps = {
  prompt: string
  setPrompt: (value: string) => void
  onRun: () => void
  isRunning: boolean
}

const suggestionIcons = [
  GitCompareArrowsIcon,
  ListChecksIcon,
  SearchIcon,
  BookOpenCheckIcon,
]

const workflow = [
  { label: "Plan", detail: "Define the question" },
  { label: "Search", detail: "Find useful sources" },
  { label: "Inspect", detail: "Check the evidence" },
  { label: "Answer", detail: "Build the response" },
]

export default function ResearchComposer({
  prompt,
  setPrompt,
  onRun,
  isRunning,
}: ResearchComposerProps) {
  function submitResearch() {
    if (!prompt.trim() || isRunning) return
    onRun()
  }

  return (
    <section className="mx-auto w-full max-w-7xl py-10 sm:py-14">
      <div className="text-center">
        <p className="text-xs font-medium uppercase text-muted-foreground">New research</p>
        <h3 className="mt-3 text-3xl font-semibold sm:text-4xl">What are you researching?</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Enter a focused question or describe the outcome you need.
        </p>
      </div>

      <div className="mt-10 rounded-lg border border-border bg-card shadow-sm transition-colors focus-within:border-ring">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3 text-xs font-medium text-muted-foreground">
          <SearchIcon className="size-3.5" />
          Question or topic
        </div>
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="What would you like to understand?"
          className="min-h-52 resize-none border-0 bg-transparent px-6 py-5 text-base leading-7 shadow-none focus-visible:ring-0"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              submitResearch()
            }
          }}
        />
        <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Enter to submit <span className="mx-1 text-border">|</span> Shift + Enter for a new line
          </p>
          <Button type="button" onClick={submitResearch} disabled={isRunning || !prompt.trim()}>
            {isRunning ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SearchIcon className="size-4" />
            )}
            Start research
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {quickPrompts.map((item, index) => {
          const Icon = suggestionIcons[index]

          return (
            <Button
              key={item}
              type="button"
              variant="outline"
              className="group h-auto justify-between gap-3 bg-transparent px-4 py-3.5 text-left font-normal"
              onClick={() => setPrompt(item)}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{item}</span>
              </span>
              <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Button>
          )
        })}
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {workflow.map((step, index) => (
            <div key={step.label} className="flex items-center gap-3 px-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-xs font-semibold text-muted-foreground">
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{step.label}</p>
                <p className="truncate text-xs text-muted-foreground">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
