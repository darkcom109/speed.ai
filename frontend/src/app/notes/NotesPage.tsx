import { AppSidebar } from "@/components/app-sidebar"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { FileTextIcon, FolderIcon, SearchIcon } from "lucide-react"
import { Link } from "react-router"

import CreateNote from "@/app/notes/components/CreateNote"
import NotesHeader from "@/app/notes/components/NotesHeader"
import { useNotes } from "@/app/notes/hooks/use-notes"

export default function NotesPage() {
  const {
    notes,
    filteredNotes,
    folders,
    error,
    isLoading,
    title,
    folder,
    activeFolder,
    searchQuery,
    setTitle,
    setFolder,
    setActiveFolder,
    setSearchQuery,
    handleCreateNote,
  } = useNotes()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Notes" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <NotesHeader />

          <CreateNote
            handleCreateNote={handleCreateNote}
            title={title}
            folder={folder}
            folders={folders}
            setTitle={setTitle}
            setFolder={setFolder}
          />

          {isLoading && <p>Loading notes...</p>}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid min-h-0 gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
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
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
