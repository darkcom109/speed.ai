import type { CreateNotePayload } from "@/app/notes/types/create-note-payload"
import type { Note } from "@/app/notes/types/note"
import type { NoteInsights } from "@/app/notes/types/note-insights"
import type { UpdateNotePayload } from "@/app/notes/types/update-note-payload"
import { apiClient } from "@/lib/api-client"

export async function getNotes(): Promise<Note[]> {
  const { data } = await apiClient.get<{ notes: Note[] }>("/notes")

  return data.notes
}

export async function getNote(noteId: string): Promise<Note> {
  const { data } = await apiClient.get<{ note: Note }>(`/notes/${noteId}`)

  return data.note
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const { data } = await apiClient.post<{ note: Note }>("/notes", payload)

  return data.note
}

export async function updateNote(
  noteId: string,
  payload: UpdateNotePayload
): Promise<Note> {
  const { data } = await apiClient.patch<{ note: Note }>(
    `/notes/${noteId}`,
    payload
  )

  return data.note
}

export async function deleteNote(noteId: string): Promise<void> {
  await apiClient.delete(`/notes/${noteId}`)
}

export async function getNoteInsights(noteId: string): Promise<NoteInsights> {
  const { data } = await apiClient.post<{ insights: NoteInsights }>(
    `/notes/${noteId}/insights`
  )

  return data.insights
}
