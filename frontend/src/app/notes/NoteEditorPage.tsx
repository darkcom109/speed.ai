import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  deleteNote,
  getNote,
  updateNote,
} from "@/app/notes/api/notes-api"

export default function NoteEditorPage() {
  const { noteId } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [folder, setFolder] = useState("General")
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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

  async function handleSaveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!noteId) {
      return
    }

    try {
      setError("")
      setIsSaving(true)

      const note = await updateNote(noteId, {
        title,
        folder: folder.trim() || "General",
        content,
      })

      setTitle(note.title)
      setFolder(note.folder)
      setContent(note.content)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save file")
    } finally {
      setIsSaving(false)
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

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">/{folder}</p>
              <h2 className="text-xl font-semibold tracking-tight">
                {title || "Untitled file"}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button asChild type="button" variant="outline">
                <Link to="/notes">Back to files</Link>
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteNote}
              >
                Delete
              </Button>
            </div>
          </div>

          {isLoading && <p>Loading file...</p>}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!isLoading && (
            <form
              onSubmit={handleSaveNote}
              className="flex min-h-[calc(100vh-12rem)] flex-col gap-3 rounded-lg border bg-card p-3"
            >
              <div className="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)_auto]">
                <Input
                  value={folder}
                  onChange={(event) => setFolder(event.target.value)}
                  placeholder="Folder"
                  required
                />
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="File name"
                  required
                />
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing..."
                className="min-h-96 flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </form>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
