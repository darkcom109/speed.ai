import useNoteEditor from "@/app/notes/hooks/use-note-editor"
import Layout from "@/components/app/Layout"
import {
  NoteAiInsights,
  NoteEditorForm,
  NoteEditorOptions,
} from "./components/note-editor"

export default function NoteEditorPage() {
  const {
    noteId,
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
      <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-5">
        <NoteEditorOptions 
          folder={folder}
          title={title}
          content={content}
          handleDeleteNote={handleDeleteNote}
        />

        {isLoading && <p>Loading file...</p>}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!isLoading && noteId && (
          <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_20rem]">
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
            <NoteAiInsights
              noteId={noteId}
              title={title}
              folder={folder}
              content={content}
              setTitle={setTitle}
              setFolder={setFolder}
              setContent={setContent}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}
