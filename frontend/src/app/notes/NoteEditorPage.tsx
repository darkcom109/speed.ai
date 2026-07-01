import { useEffect, useRef, useState } from "react"
import useNoteEditor from "@/app/notes/hooks/use-note-editor"
import type { NoteAiEdit } from "@/app/notes/types/note-insights"
import Layout from "@/components/app/Layout"
import { toast } from "@/lib/single-toast"
import {
  NoteAiInsights,
  NoteEditorForm,
  NoteEditorOptions,
} from "./components/note-editor"

export default function NoteEditorPage() {
  const [pendingAiEdit, setPendingAiEdit] = useState<NoteAiEdit | null>(null)
  const [isAiEditing, setIsAiEditing] = useState(false)
  const aiUndoDraftRef = useRef<NoteAiEdit | null>(null)
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

  function handlePreviewAiEdit(edit: NoteAiEdit) {
    aiUndoDraftRef.current = {
      title,
      folder,
      content,
      summaryOfChanges: "Restored the note before the AI edit.",
    }

    setTitle(edit.title)
    setFolder(edit.folder)
    setContent(edit.content)
    setPendingAiEdit(edit)
  }

  function handleKeepAiEdit() {
    if (!pendingAiEdit) {
      return
    }

    aiUndoDraftRef.current = null
    setPendingAiEdit(null)
  }

  function handleUndoAiEdit() {
    const undoDraft = aiUndoDraftRef.current

    if (!undoDraft) {
      setPendingAiEdit(null)
      return
    }

    setTitle(undoDraft.title)
    setFolder(undoDraft.folder)
    setContent(undoDraft.content)
    aiUndoDraftRef.current = null
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
        label: "Keep",
        onClick: () => {
          handleKeepAiEdit()
          toast.dismiss(toastId)
        },
      },
      cancel: {
        label: "Undo",
        onClick: () => {
          handleUndoAiEdit()
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
              onPreviewEdit={handlePreviewAiEdit}
              setIsAiEditing={setIsAiEditing}
              onKeepEdit={handleKeepAiEdit}
              onUndoEdit={handleUndoAiEdit}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}
