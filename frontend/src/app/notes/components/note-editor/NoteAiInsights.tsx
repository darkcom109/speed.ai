import {
  useState,
  type FormEvent,
  type KeyboardEvent,
  type Dispatch,
  type SetStateAction,
} from "react"
import { Link } from "react-router"
import { toast } from "@/lib/single-toast"
import {
  ArrowDownToLineIcon,
  CheckIcon,
  LightbulbIcon,
  Loader2Icon,
  PlusIcon,
  SendIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"

import {
  getNoteInsights,
  runNoteAiCommand,
} from "@/app/notes/api/notes-api"
import type {
  NoteAiEdit,
  NoteInsights,
} from "@/app/notes/types/note-insights"
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
import { Textarea } from "@/components/ui/textarea"

type NoteAiInsightsProps = {
  noteId: string
  title: string
  folder: string
  content: string
  pendingEdit: NoteAiEdit | null
  onPreviewEdit: (edit: NoteAiEdit) => void
  setIsAiEditing: Dispatch<SetStateAction<boolean>>
  onKeepEdit: () => void
  onUndoEdit: () => void
}

export default function NoteAiInsights({
  noteId,
  title,
  folder,
  content,
  pendingEdit,
  onPreviewEdit,
  setIsAiEditing,
  onKeepEdit,
  onUndoEdit,
}: NoteAiInsightsProps) {
  const [insights, setInsights] = useState<NoteInsights | null>(null)
  const [instruction, setInstruction] = useState("")
  const [error, setError] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRunningCommand, setIsRunningCommand] = useState(false)
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

  async function handleRunCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!instruction.trim()) {
      return
    }

    try {
      setError("")
      setIsRunningCommand(true)
      setIsAiEditing(true)

      const edit = await runNoteAiCommand(noteId, {
        instruction,
        title,
        folder,
        content,
      })

      onPreviewEdit(edit)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to edit note")
    } finally {
      setIsRunningCommand(false)
      setIsAiEditing(false)
    }
  }

  function handleApplyEdit() {
    if (!pendingEdit) {
      return
    }

    onKeepEdit()
    setInstruction("")
    toast.success("AI edit kept")
  }

  function handleUndoEdit() {
    onUndoEdit()
    toast.info("AI edit undone")
  }

  function handleCommandKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return
    }

    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
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
    <Card className="w-full min-w-0 self-start rounded-xl border bg-card shadow-sm 2xl:sticky 2xl:top-20 2xl:max-h-[calc(100vh-7rem)] 2xl:overflow-auto 2xl:[scrollbar-width:none] 2xl:[&::-webkit-scrollbar]:hidden">
      <CardHeader className="px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between 2xl:flex-col">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="size-4" />
              AI insights
            </CardTitle>
            <CardDescription className="mt-1 text-xs leading-5">
              Summarise this note and extract useful follow-ups.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            className="w-fit"
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

      <CardContent className="space-y-4 px-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <section className="space-y-2">
          <h3 className="text-sm font-medium">Edit this note</h3>
          <form className="space-y-2" onSubmit={handleRunCommand}>
            <Textarea
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              onKeyDown={handleCommandKeyDown}
              placeholder="Turn this into a checklist..."
              className="min-h-20 resize-none text-sm"
            />
            <Button
              type="submit"
              size="sm"
              className="w-full"
              disabled={isRunningCommand || !instruction.trim()}
            >
              {isRunningCommand ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <SendIcon />
              )}
              Generate edit
            </Button>
          </form>
        </section>

        {pendingEdit && (
          <section className="space-y-2 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-medium">Preview edit</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {pendingEdit.summaryOfChanges}
                </p>
              </div>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={handleUndoEdit}
                aria-label="Undo AI edit"
              >
                <XIcon />
              </Button>
            </div>
            <div className="space-y-1 rounded-md border bg-background p-2 text-xs">
              <p className="truncate">
                <span className="text-muted-foreground">Title: </span>
                {pendingEdit.title}
              </p>
              <p className="truncate">
                <span className="text-muted-foreground">Folder: </span>
                {pendingEdit.folder}
              </p>
              <p className="line-clamp-3 text-muted-foreground">
                {pendingEdit.content.replace(/<[^>]+>/g, " ")}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={handleApplyEdit}
            >
              <ArrowDownToLineIcon />
              Keep changes
            </Button>
          </section>
        )}

        {!insights && !error && (
          <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Generate insights after writing or editing the note.
          </div>
        )}

        {insights && (
          <>
            <section className="space-y-2">
              <h3 className="text-sm font-medium">Summary</h3>
              <p className="rounded-lg border bg-muted/30 p-3 text-sm leading-6 text-muted-foreground">
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
                            className="shrink-0"
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
