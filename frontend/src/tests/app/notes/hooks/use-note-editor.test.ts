import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { deleteNote, getNote, updateNote } from "@/app/notes/api/notes-api"
import useNoteEditor from "@/app/notes/hooks/use-note-editor"
import { apiClient } from "@/lib/api-client"

const navigate = vi.fn()

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
  useParams: () => ({ noteId: "1" }),
}))

vi.mock("@/app/notes/api/notes-api", () => ({
  deleteNote: vi.fn(),
  getNote: vi.fn(),
  updateNote: vi.fn(),
}))

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

function createFormEvent() {
  return {
    preventDefault: vi.fn(),
  } as unknown as React.FormEvent<HTMLFormElement>
}

describe("useNoteEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    vi.mocked(apiClient.get).mockResolvedValue({ data: {} })
    vi.mocked(getNote).mockResolvedValue({
      id: "1",
      title: "Trip list",
      content: "<p>Hello</p>",
      folder: "Travel",
      createdAt: "2026-06-16T09:00:00.000Z",
      updatedAt: "2026-06-16T09:00:00.000Z",
      userId: "user-1",
    })
  })

  it("loads the current note", async () => {
    const { result } = renderHook(() => useNoteEditor())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(apiClient.get).toHaveBeenCalledWith("/auth/me")
    expect(getNote).toHaveBeenCalledWith("1")
    expect(result.current.title).toBe("Trip list")
    expect(result.current.folder).toBe("Travel")
  })

  it("saves the note", async () => {
    vi.mocked(updateNote).mockResolvedValue({
      id: "1",
      title: "Updated note",
      content: "<p>Updated</p>",
      folder: "Travel",
      createdAt: "2026-06-16T09:00:00.000Z",
      updatedAt: "2026-06-16T09:00:00.000Z",
      userId: "user-1",
    })

    const { result } = renderHook(() => useNoteEditor())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setTitle("Updated note")
      result.current.setContent("<p>Updated</p>")
    })

    await act(async () => {
      await result.current.handleSaveNote(createFormEvent())
    })

    expect(updateNote).toHaveBeenCalledWith("1", {
      title: "Updated note",
      folder: "Travel",
      content: "<p>Updated</p>",
    })
  })

  it("deletes the note and navigates back", async () => {
    vi.mocked(deleteNote).mockResolvedValue(undefined)

    const { result } = renderHook(() => useNoteEditor())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleDeleteNote()
    })

    expect(deleteNote).toHaveBeenCalledWith("1")
    expect(navigate).toHaveBeenCalledWith("/notes")
  })
})
