import type { CreateNotePayload } from "@/app/notes/types/create-note-payload"
import type { Note } from "@/app/notes/types/note"
import type { UpdateNotePayload } from "@/app/notes/types/update-note-payload"

export async function getNotes(): Promise<Note[]> {
  const response = await fetch("http://localhost:3001/api/notes", {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to load notes")
  }

  return data.notes
}

export async function getNote(noteId: string): Promise<Note> {
  const response = await fetch(`http://localhost:3001/api/notes/${noteId}`, {
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to load note")
  }

  return data.note
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const response = await fetch("http://localhost:3001/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to create note")
  }

  return data.note
}

export async function updateNote(
  noteId: string,
  payload: UpdateNotePayload
): Promise<Note> {
  const response = await fetch(`http://localhost:3001/api/notes/${noteId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to update note")
  }

  return data.note
}

export async function deleteNote(noteId: string): Promise<void> {
  const response = await fetch(`http://localhost:3001/api/notes/${noteId}`, {
    method: "DELETE",
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Unable to delete note")
  }
}
