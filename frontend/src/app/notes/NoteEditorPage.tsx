import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckIcon } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DeleteNoteDialog } from "@/app/notes/components/DeleteNoteDialog"
import { RichNoteEditor } from "@/app/notes/components/RichNoteEditor"
import {
  deleteNote,
  getNote,
  updateNote,
} from "@/app/notes/api/notes-api"

type NoteDraft = {
  title: string
  folder: string
  content: string
}

export default function NoteEditorPage() {
  const { noteId } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [folder, setFolder] = useState("General")
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [didSave, setDidSave] = useState(false)
  const savedDraftRef = useRef<NoteDraft | null>(null)
  const saveFeedbackTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    async function loadNote() {
      if (!noteId) {
        navigate("/notes")
        return
      }

      try {
        setError("")

        const response = await fetch("http://localhost:3001/api/auth/me", {
          credentials: "include",
        })

        if (!response.ok) {
          navigate("/login")
          return
        }

        const note = await getNote(noteId)

        savedDraftRef.current = {
          title: note.title,
          folder: note.folder,
          content: note.content,
        }

        setTitle(note.title)
        setFolder(note.folder)
        setContent(note.content)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load file")
      } finally {
        setIsLoading(false)
      }
    }

    loadNote()
  }, [navigate, noteId])

  useEffect(() => {
    return () => {
      if (saveFeedbackTimeoutRef.current) {
        window.clearTimeout(saveFeedbackTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isLoading || !noteId || !title.trim()) {
      return
    }

    const draft = {
      title,
      folder: folder.trim() || "General",
      content,
    }
    const savedDraft = savedDraftRef.current

    if (
      savedDraft &&
      savedDraft.title === draft.title &&
      savedDraft.folder === draft.folder &&
      savedDraft.content === draft.content
    ) {
      return
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        await saveNoteDraft(draft)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to auto-save file")
      }
    }, 900)

    return () => window.clearTimeout(timeoutId)
  }, [content, folder, isLoading, noteId, title])

  function showSavedFeedback() {
    setDidSave(true)

    if (saveFeedbackTimeoutRef.current) {
      window.clearTimeout(saveFeedbackTimeoutRef.current)
    }

    saveFeedbackTimeoutRef.current = window.setTimeout(() => {
      setDidSave(false)
    }, 1200)
  }

  async function saveNoteDraft(draft: NoteDraft) {
    if (!noteId) {
      return null
    }

    setError("")
    setIsSaving(true)

    try {
      const note = await updateNote(noteId, draft)

      savedDraftRef.current = {
        title: note.title,
        folder: note.folder,
        content: note.content,
      }
      showSavedFeedback()

      return note
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!noteId) {
      return
    }

    try {
      const note = await saveNoteDraft({
        title,
        folder: folder.trim() || "General",
        content,
      })

      if (note) {
        setTitle(note.title)
        setFolder(note.folder)
        setContent(note.content)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save file")
    }
  }

  async function handleDeleteNote() {
    if (!noteId) {
      return
    }

    try {
      setError("")

      await deleteNote(noteId)
      navigate("/notes")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete file")
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Notes" />

        <main className="flex flex-1 flex-col bg-muted/30 p-4 lg:p-6">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">/{folder}</p>
              <h2 className="truncate text-xl font-semibold tracking-tight">
                {title || "Untitled file"}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button asChild type="button" variant="outline">
                <Link to="/notes">Back to files</Link>
              </Button>
              <DeleteNoteDialog noteTitle={title} onDelete={handleDeleteNote} />
            </div>
          </div>

          {isLoading && <p>Loading file...</p>}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!isLoading && (
            <form
              onSubmit={handleSaveNote}
              className="mx-auto mt-6 flex min-h-[calc(100vh-14rem)] w-full max-w-5xl flex-col rounded-xl border bg-card shadow-sm"
            >
              <div className="grid gap-3 border-b bg-background/60 p-4 sm:grid-cols-[12rem_minmax(0,1fr)_auto]">
                <Input
                  value={folder}
                  onChange={(event) => setFolder(event.target.value)}
                  placeholder="Folder"
                  required
                  className="h-10 bg-background"
                />
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="File name"
                  required
                  className="h-10 bg-background"
                />
                <Button type="submit" className="h-10" disabled={isSaving}>
                  {didSave ? (
                    <CheckIcon className="size-4" />
                  ) : isSaving ? (
                    "Saving..."
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
              <RichNoteEditor content={content} onChange={setContent} />
            </form>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
