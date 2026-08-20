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
        <div className="grid w-full min-w-0 gap-3 2xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:gap-5">
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">/{folder}</p>
                <h2 className="truncate text-xl font-semibold tracking-tight">
                    {title || "Untitled file"}
                </h2>
            </div>
            <div className="flex flex-wrap gap-2 2xl:justify-end">
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
