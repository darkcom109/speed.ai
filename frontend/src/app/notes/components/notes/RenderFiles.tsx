import { Input } from "@/components/ui/input"
import { FileTextIcon, SearchIcon } from "lucide-react"
import { Link } from "react-router"
import type { Note } from "@/app/notes/types/note"

type RenderFilesProps = {
    isLoading: boolean
    error: string
    filteredNotes: Note[]
    searchQuery: string
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>
}

export default function RenderFiles({
    isLoading,
    error,
    filteredNotes,
    searchQuery,
    setSearchQuery,
} : RenderFilesProps) {
    return (
        <section className="flex h-[min(34rem,calc(100vh-18rem))] min-h-80 flex-col rounded-lg border bg-background">
            <div className="flex flex-col gap-2 border-b bg-muted/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-medium">Files</h3>
            <div className="relative w-full sm:max-w-64">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search files"
                className="h-8 pl-8"
                />
            </div>
            </div>
            <div className="grid min-h-0 flex-1 auto-rows-min gap-3 overflow-y-auto p-3 sm:grid-cols-2 xl:grid-cols-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
            {!isLoading && !error && filteredNotes.length === 0 && (
                <p className="p-2 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                {searchQuery ? "No files match your search." : "No files in this folder."}
                </p>
            )}

            {filteredNotes.map((note) => (
                <Link
                key={note.id}
                to={`/notes/${note.id}`}
                className="flex min-h-24 items-start gap-3 rounded-md border bg-card p-3 text-left shadow-xs transition-colors hover:bg-muted"
                >
                <FileTextIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                    {note.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                    {note.folder}
                    </span>
                    <span className="mt-2 block truncate text-xs text-muted-foreground">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                </span>
                </Link>
            ))}
            </div>
        </section>
    )
}