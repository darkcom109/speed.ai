import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type CreateNoteProps = {
  handleCreateNote: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  title: string
  folder: string
  setTitle: React.Dispatch<React.SetStateAction<string>>
  setFolder: React.Dispatch<React.SetStateAction<string>>
}

export default function CreateNote({
  handleCreateNote,
  title,
  folder,
  setTitle,
  setFolder,
}: CreateNoteProps) {
  return (
    <form
      onSubmit={handleCreateNote}
      className="grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-[12rem_minmax(0,1fr)_auto]"
    >
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
      <Button type="submit" className="h-9">
        Create file
      </Button>
    </form>
  )
}
