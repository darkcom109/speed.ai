import type { Note } from "@/app/notes/types/note"
import { FolderIcon } from "lucide-react"

type RenderFoldersProps = {
    folders: string[]
    notes: Note[]
    activeFolder: string
    setActiveFolder: React.Dispatch<React.SetStateAction<string>>
}

export default function RenderFolders({
    folders,
    notes,
    activeFolder,
    setActiveFolder
} : RenderFoldersProps) {
    return (
        <section className="flex h-[min(34rem,calc(100vh-18rem))] min-h-80 flex-col rounded-lg border bg-background">
          <div className="border-b bg-muted/40 px-3 py-2">
            <h3 className="text-sm font-medium">Folders</h3>
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
            {folders.map((folderName) => {
              const noteCount =
                folderName === "All"
                  ? notes.length
                  : notes.filter((note) => note.folder === folderName).length

              return (
                <button
                  key={folderName}
                  type="button"
                  onClick={() => setActiveFolder(folderName)}
                  className={
                    activeFolder === folderName
                      ? "flex w-full items-center justify-between gap-2 rounded-md bg-primary/10 px-2 py-2 text-left text-sm text-foreground"
                      : "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <FolderIcon className="size-4 shrink-0" />
                    <span className="truncate">{folderName}</span>
                  </span>
                  <span className="text-xs">{noteCount}</span>
                </button>
              )
            })}
          </div>
        </section>
    )
}