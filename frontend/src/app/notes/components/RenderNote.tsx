import { Button } from "@/components/ui/button"
import type { Note } from "@/app/notes/types/note"

type RenderNoteProps = {
  note: Note
  startEditingNote: (note: Note) => void
  handleDeleteNote: (noteId: string) => Promise<void>
}

export default function RenderNote({
  note,
  startEditingNote,
  handleDeleteNote,
}: RenderNoteProps) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-medium">{note.title}</h3>
          <p className="text-xs text-muted-foreground">
            Updated {new Date(note.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {note.content}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => startEditingNote(note)}
        >
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => handleDeleteNote(note.id)}
        >
          Delete
        </Button>
      </div>
    </>
  )
}
