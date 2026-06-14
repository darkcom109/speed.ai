import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type UpdateNoteProps = {
  handleUpdateNote: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  editTitle: string
  editContent: string
  editFolder: string
  setEditTitle: React.Dispatch<React.SetStateAction<string>>
  setEditContent: React.Dispatch<React.SetStateAction<string>>
  setEditFolder: React.Dispatch<React.SetStateAction<string>>
  setEditingNoteId: React.Dispatch<React.SetStateAction<string | null>>
}

export default function UpdateNote({
  handleUpdateNote,
  editTitle,
  editContent,
  editFolder,
  setEditTitle,
  setEditContent,
  setEditFolder,
  setEditingNoteId,
}: UpdateNoteProps) {
  return (
    <form onSubmit={handleUpdateNote} className="flex flex-1 flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <Input
          value={editFolder}
          onChange={(event) => setEditFolder(event.target.value)}
          required
        />
        <Input
          value={editTitle}
          onChange={(event) => setEditTitle(event.target.value)}
          required
        />
      </div>
      <textarea
        value={editContent}
        onChange={(event) => setEditContent(event.target.value)}
        required
        className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditingNoteId(null)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
