import { 
  NotesHeader,
  CreateNote,
  RenderFolders, 
  RenderFiles
} from "@/app/notes/components/notes"
import { useNotes } from "@/app/notes/hooks/use-notes"
import Layout from "@/components/app/Layout"

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
    <Layout>
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
        <RenderFolders 
          folders={folders}
          notes={notes}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
        />

        <RenderFiles 
          isLoading={isLoading}
          error={error}
          filteredNotes={filteredNotes}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
    </Layout>
  )
}
