import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import {
  CheckIcon,
  LightbulbIcon,
  Loader2Icon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react"

import { getNoteInsights } from "@/app/notes/api/notes-api"
import type { NoteInsights } from "@/app/notes/types/note-insights"
import { createTask } from "@/app/tasks/api/tasks-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type NoteAiInsightsProps = {
  noteId: string
}

export default function NoteAiInsights({ noteId }: NoteAiInsightsProps) {
  const [insights, setInsights] = useState<NoteInsights | null>(null)
  const [error, setError] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [creatingTaskIndex, setCreatingTaskIndex] = useState<number | null>(null)
  const [createdTaskIndexes, setCreatedTaskIndexes] = useState<number[]>([])

  async function handleGenerateInsights() {
    try {
      setError("")
      setIsGenerating(true)

      const nextInsights = await getNoteInsights(noteId)

      setInsights(nextInsights)
      setCreatedTaskIndexes([])
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to generate insights"
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCreateTask(index: number) {
    const task = insights?.suggestedTasks[index]

    if (!task) {
      return
    }

    try {
      setCreatingTaskIndex(index)

      await createTask({
        title: task.title,
        description: task.description || undefined,
      })

      setCreatedTaskIndexes((currentIndexes) => [...currentIndexes, index])
      toast.success("Task created")
    } catch {
      toast.error("Unable to create task")
    } finally {
      setCreatingTaskIndex(null)
    }
  }

  return (
    <Card className="mt-6 w-full max-w-5xl self-center lg:sticky lg:top-20 lg:mt-0 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-auto">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="size-4" />
              AI insights
            </CardTitle>
            <CardDescription>
              Summarize this note and extract useful follow-ups.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleGenerateInsights}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <LightbulbIcon />
            )}
            Generate
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!insights && !error && (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Generate insights after writing or editing the note.
          </div>
        )}

        {insights && (
          <>
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Summary</h3>
              <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                {insights.summary}
              </p>
            </section>

            {(insights.tags.length > 0 || insights.suggestedFolder) && (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">Organization</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.suggestedFolder && (
                    <Badge variant="secondary">{insights.suggestedFolder}</Badge>
                  )}
                  {insights.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-2">
              <h3 className="text-sm font-medium">Suggested tasks</h3>
              {insights.suggestedTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  No task suggestions found.
                </p>
              ) : (
                <div className="space-y-2">
                  {insights.suggestedTasks.map((task, index) => {
                    const isCreated = createdTaskIndexes.includes(index)
                    const isCreating = creatingTaskIndex === index

                    return (
                      <div
                        key={`${task.title}-${index}`}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium leading-snug">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="outline"
                            onClick={() => handleCreateTask(index)}
                            disabled={isCreated || isCreating}
                            aria-label="Create task"
                          >
                            {isCreated ? (
                              <CheckIcon />
                            ) : isCreating ? (
                              <Loader2Icon className="animate-spin" />
                            ) : (
                              <PlusIcon />
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-medium">Related notes</h3>
              {insights.relatedNotes.length === 0 ? (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  No related notes found.
                </p>
              ) : (
                <div className="space-y-2">
                  {insights.relatedNotes.map((note) => (
                    <Link
                      key={note.id}
                      to={`/notes/${note.id}`}
                      className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <p className="font-medium leading-snug">{note.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {note.reason}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </CardContent>
    </Card>
  )
}
