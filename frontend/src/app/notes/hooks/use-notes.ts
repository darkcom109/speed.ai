import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router"

import {
  createNote,
  getNotes,
} from "@/app/notes/api/notes-api"
import type { Note } from "@/app/notes/types/note"
import { apiClient } from "@/lib/api-client"
import axios from "axios"

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [title, setTitle] = useState("")
  const [folder, setFolder] = useState("General")
  const [activeFolder, setActiveFolder] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    async function loadNotes() {
      try {
        setError("")

        apiClient.get("/auth/me")

        const notes = await getNotes()
        setNotes(notes)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate("/login")
          return
        }
        
        setError(error instanceof Error ? error.message : "Unable to load notes")
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [navigate])

  async function handleCreateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setError("")

      const note = await createNote({
        title,
        folder: folder.trim() || "General",
      })

      setNotes((currentNotes) => [note, ...currentNotes])
      setActiveFolder(note.folder)
      setTitle("")
      navigate(`/notes/${note.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create note")
    }
  }

  const folders = useMemo(() => {
    const noteFolders = notes.map((note) => note.folder)

    return ["All", ...Array.from(new Set(noteFolders)).sort()]
  }, [notes])

  const filteredNotes = useMemo(() => {
    const folderNotes =
      activeFolder === "All"
        ? notes
        : notes.filter((note) => note.folder === activeFolder)

    const normalizedSearchQuery = searchQuery.trim().toLowerCase()

    if (!normalizedSearchQuery) {
      return folderNotes
    }

    return folderNotes.filter((note) => {
      return (
        note.title.toLowerCase().includes(normalizedSearchQuery) ||
        note.folder.toLowerCase().includes(normalizedSearchQuery) ||
        note.content.toLowerCase().includes(normalizedSearchQuery)
      )
    })
  }, [activeFolder, notes, searchQuery])

  return {
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
  }
}
