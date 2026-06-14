import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckIcon } from "lucide-react"
import { RichNoteEditor } from "@/app/notes/components/note-editor"
import type { FormEvent } from "react"

type NoteEditorFormProps = {
    folder: string
    title: string
    content: string
    isSaving: boolean
    didSave: boolean
    setFolder: React.Dispatch<React.SetStateAction<string>>
    setTitle: React.Dispatch<React.SetStateAction<string>>
    setContent: React.Dispatch<React.SetStateAction<string>>
    handleSaveNote: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

export default function NoteEditorForm({
    folder,
    title,
    content,
    isSaving,
    didSave,
    setFolder,
    setTitle,
    setContent,
    handleSaveNote
} : NoteEditorFormProps) {
    return (
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
    )
}