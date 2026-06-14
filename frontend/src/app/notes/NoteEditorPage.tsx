import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckIcon } from "lucide-react"
import { DeleteNoteDialog } from "@/app/notes/components/note-editor/DeleteNoteDialog"
import { RichNoteEditor } from "@/app/notes/components/note-editor/RichNoteEditor"
import handleExportNote from "@/app/notes/utils/export-note"
import useNoteEditor from "./hooks/use-note-editor"
import Layout from "@/components/app/Layout"

export default function NoteEditorPage() {
  const {
    title,
    folder,
    content,
    error,
    isLoading,
    isSaving,
    didSave,
    setTitle,
    setFolder,
    setContent,
    handleSaveNote,
    handleDeleteNote
  } = useNoteEditor()

  return (
    <Layout>
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
          <Button
            type="button"
            variant="outline"
            onClick={() => handleExportNote(title, content)}
          >
            Export
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
    </Layout>
  )
}
