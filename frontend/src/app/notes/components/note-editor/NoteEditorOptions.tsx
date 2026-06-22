import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { DeleteNoteDialog } from "@/app/notes/components/note-editor"
import handleExportNote from "@/app/notes/utils/export-note"

type NoteEditorOptionsProps = {
    folder: string
    title: string
    content: string
    handleDeleteNote: () => Promise<void>
}

export default function NoteEditorOptions({
    folder,
    title,
    content,
    handleDeleteNote
} : NoteEditorOptionsProps) {
    return (
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
    )
}