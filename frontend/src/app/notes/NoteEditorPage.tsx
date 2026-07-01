import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import useNoteEditor from "@/app/notes/hooks/use-note-editor"
import type { NoteAiEdit } from "@/app/notes/types/note-insights"
import Layout from "@/components/app/Layout"
import {
  NoteAiInsights,
  NoteEditorForm,
  NoteEditorOptions,
} from "./components/note-editor"

export default function NoteEditorPage() {
  const [pendingAiEdit, setPendingAiEdit] = useState<NoteAiEdit | null>(null)
  const [isAiEditing, setIsAiEditing] = useState(false)
  const aiDraftToastIdRef = useRef<string | number | null>(null)

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

  function handleApplyAiEdit() {
    if (!pendingAiEdit) {
      return
    }

    setTitle(pendingAiEdit.title)
    setFolder(pendingAiEdit.folder)
    setContent(pendingAiEdit.content)
    setPendingAiEdit(null)
  }

  useEffect(() => {
    if (aiDraftToastIdRef.current) {
      toast.dismiss(aiDraftToastIdRef.current)
      aiDraftToastIdRef.current = null
    }

    if (!pendingAiEdit) {
      return
    }

    let toastId: string | number

    toastId = toast("AI draft preview", {
      description: pendingAiEdit.summaryOfChanges,
      duration: Infinity,
      action: {
        label: "Apply",
        onClick: () => {
          handleApplyAiEdit()
          toast.dismiss(toastId)
        },
      },
      cancel: {
        label: "Discard",
        onClick: () => {
          setPendingAiEdit(null)
          toast.dismiss(toastId)
        },
      },
    })

    aiDraftToastIdRef.current = toastId

    return () => {
      toast.dismiss(toastId)
    }
  }, [pendingAiEdit])

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
              noteId={noteId}
              folder={folder}
              title={title}
              content={content}
              isSaving={isSaving}
              didSave={didSave}
              setFolder={setFolder}
              setTitle={setTitle}
              setContent={setContent}
              handleSaveNote={handleSaveNote}
              isAiEditing={isAiEditing}
            />
            <NoteAiInsights
              noteId={noteId}
              title={title}
              folder={folder}
              content={content}
              pendingEdit={pendingAiEdit}
              setPendingEdit={setPendingAiEdit}
              setIsAiEditing={setIsAiEditing}
              onApplyEdit={handleApplyAiEdit}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}
