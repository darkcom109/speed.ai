import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { deleteNote, getNote, updateNote } from "@/app/notes/api/notes-api"
import { apiClient } from "@/lib/api-client"
import axios from "axios"

type NoteDraft = {
  title: string
  folder: string
  content: string
}

export default function useNoteEditor() {
  const { noteId } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [folder, setFolder] = useState("General")
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [didSave, setDidSave] = useState(false)
  const savedDraftRef = useRef<NoteDraft | null>(null)
  const saveFeedbackTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    async function loadNote() {
      if (!noteId) {
        navigate("/notes")
        return
      }

      try {
        setError("")

        await apiClient.get("/auth/me")

        const note = await getNote(noteId)

        savedDraftRef.current = {
          title: note.title,
          folder: note.folder,
          content: note.content,
        }

        setTitle(note.title)
        setFolder(note.folder)
        setContent(note.content)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status == 401) {
            navigate("/login")
            return
        }
        
        setError(error instanceof Error ? error.message : "Unable to load file")
      } finally {
        setIsLoading(false)
      }
    }

    loadNote()
  }, [navigate, noteId])

  useEffect(() => {
    return () => {
      if (saveFeedbackTimeoutRef.current) {
        window.clearTimeout(saveFeedbackTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isLoading || !noteId || !title.trim()) {
      return
    }

    const draft = {
      title,
      folder: folder.trim() || "General",
      content,
    }
    const savedDraft = savedDraftRef.current

    if (
      savedDraft &&
      savedDraft.title === draft.title &&
      savedDraft.folder === draft.folder &&
      savedDraft.content === draft.content
    ) {
      return
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        await saveNoteDraft(draft)
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to auto-save file"
        )
      }
    }, 900)

    return () => window.clearTimeout(timeoutId)
  }, [content, folder, isLoading, noteId, title])

  function showSavedFeedback() {
    setDidSave(true)

    if (saveFeedbackTimeoutRef.current) {
      window.clearTimeout(saveFeedbackTimeoutRef.current)
    }

    saveFeedbackTimeoutRef.current = window.setTimeout(() => {
      setDidSave(false)
    }, 1200)
  }

  async function saveNoteDraft(draft: NoteDraft) {
    if (!noteId) {
      return null
    }

    setError("")
    setIsSaving(true)

    try {
      const note = await updateNote(noteId, draft)

      savedDraftRef.current = {
        title: note.title,
        folder: note.folder,
        content: note.content,
      }
      showSavedFeedback()

      return note
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!noteId) {
      return
    }

    try {
      const note = await saveNoteDraft({
        title,
        folder: folder.trim() || "General",
        content,
      })

      if (note) {
        setTitle(note.title)
        setFolder(note.folder)
        setContent(note.content)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save file")
    }
  }

  async function handleDeleteNote() {
    if (!noteId) {
      return
    }

    try {
      setError("")

      await deleteNote(noteId)
      navigate("/notes")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to delete file")
    }
  }

  return {
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
  }
}