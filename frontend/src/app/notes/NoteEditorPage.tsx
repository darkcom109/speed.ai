import useNoteEditor from "@/app/notes/hooks/use-note-editor"
import Layout from "@/components/app/Layout"
import { NoteEditorOptions, NoteEditorForm } from "./components/note-editor"

export default function NoteEditorPage() {
  const {
    title,
    folder,
    content,
    error,
    isLoading,
    isSaving,
    didSave,
    setTitle,
    setFolder,
    setContent,
    handleSaveNote,
    handleDeleteNote
  } = useNoteEditor()

  return (
    <Layout>
      <NoteEditorOptions 
        folder={folder}
        title={title}
        content={content}
        handleDeleteNote={handleDeleteNote}
      />

      {isLoading && <p>Loading file...</p>}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isLoading && (
        <NoteEditorForm 
          folder={folder}
          title={title}
          content={content}
          isSaving={isSaving}
          didSave={didSave}
          setFolder={setFolder}
          setTitle={setTitle}
          setContent={setContent}
          handleSaveNote={handleSaveNote}
        />
      )}
    </Layout>
  )
}
