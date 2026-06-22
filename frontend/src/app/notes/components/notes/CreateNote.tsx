import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderIcon } from "lucide-react"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CreateNoteProps = {
  handleCreateNote: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  title: string
  folder: string
  folders: string[]
  setTitle: React.Dispatch<React.SetStateAction<string>>
  setFolder: React.Dispatch<React.SetStateAction<string>>
}

export default function CreateNote({
  handleCreateNote,
  title,
  folder,
  folders,
  setTitle,
  setFolder,
}: CreateNoteProps) {
  const [isCustomFolder, setIsCustomFolder] = useState(false)
  const selectableFolders = Array.from(
    new Set(["General", ...folders.filter((folderName) => folderName !== "All")])
  )

  function handleFolderSelect(value: string) {
    if (value === "custom") {
      setIsCustomFolder(true)
      setFolder("")
      return
    }

    setIsCustomFolder(false)
    setFolder(value)
  }

  return (
    <form
      onSubmit={handleCreateNote}
      className="grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-[12rem_minmax(0,1fr)_auto]"
    >
      {isCustomFolder ? (
        <div className="flex gap-2">
          <Input
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            placeholder="Custom folder"
            required
            autoFocus
          />
          <Button
            type="button"
            variant="outline"
            className="h-8 shrink-0"
            aria-label="Choose existing folder"
            title="Choose existing folder"
            onClick={() => {
              setIsCustomFolder(false)
              setFolder("General")
            }}
          >
            <FolderIcon className="size-4" />
          </Button>
        </div>
      ) : (
        <Select value={folder} onValueChange={handleFolderSelect}>
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Choose folder" />
          </SelectTrigger>
          <SelectContent>
            {selectableFolders.map((folderName) => (
              <SelectItem key={folderName} value={folderName}>
                {folderName}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom folder</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="File name"
        required
      />
      <Button type="submit" className="h-8">
        Create file
      </Button>
    </form>
  )
}
