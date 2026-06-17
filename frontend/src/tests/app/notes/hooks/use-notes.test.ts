import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createNote, getNotes } from "@/app/notes/api/notes-api"
import { useNotes } from "@/app/notes/hooks/use-notes"
import { apiClient } from "@/lib/api-client"

const navigate = vi.fn()

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
}))

vi.mock("@/app/notes/api/notes-api", () => ({
  createNote: vi.fn(),
  getNotes: vi.fn(),
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

describe("useNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.get).mockResolvedValue({ data: {} })
    vi.mocked(getNotes).mockResolvedValue([
      {
        id: "1",
        title: "Trip list",
        content: "<p>Hello</p>",
        folder: "Travel",
        createdAt: "2026-06-16T09:00:00.000Z",
        updatedAt: "2026-06-16T09:00:00.000Z",
        userId: "user-1",
      },
      {
        id: "2",
        title: "Budget",
        content: "<p>Money</p>",
        folder: "General",
        createdAt: "2026-06-16T09:00:00.000Z",
        updatedAt: "2026-06-16T09:00:00.000Z",
        userId: "user-1",
      },
    ])
  })

  it("loads notes and filters them by folder and search", async () => {
    const { result } = renderHook(() => useNotes())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setActiveFolder("Travel")
      result.current.setSearchQuery("trip")
    })

    expect(result.current.notes).toHaveLength(2)
    expect(result.current.filteredNotes).toHaveLength(1)
    expect(result.current.filteredNotes[0]?.title).toBe("Trip list")
    expect(result.current.folders).toEqual(["All", "General", "Travel"])
  })

  it("creates a note and navigates to the editor", async () => {
    vi.mocked(createNote).mockResolvedValue({
      id: "3",
      title: "Packing",
      content: "",
      folder: "Travel",
      createdAt: "2026-06-16T09:00:00.000Z",
      updatedAt: "2026-06-16T09:00:00.000Z",
      userId: "user-1",
    })

    const { result } = renderHook(() => useNotes())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setTitle("Packing")
      result.current.setFolder("Travel")
    })

    await act(async () => {
      await result.current.handleCreateNote(createFormEvent())
    })

    expect(createNote).toHaveBeenCalledWith({
      title: "Packing",
      folder: "Travel",
    })
    expect(navigate).toHaveBeenCalledWith("/notes/3")
  })
})
