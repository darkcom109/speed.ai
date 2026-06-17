import { describe, expect, it, vi } from "vitest"

import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  updateNote,
} from "@/app/notes/api/notes-api"
import { apiClient } from "@/lib/api-client"

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe("notes-api", () => {
  it("returns notes from getNotes", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        notes: [
          {
            id: "1",
            title: "Trip list",
            content: "<p>Hello</p>",
            folder: "Travel",
            createdAt: "2026-06-16T09:00:00.000Z",
            updatedAt: "2026-06-16T09:00:00.000Z",
            userId: "user-1",
          },
        ],
      },
    })

    const notes = await getNotes()

    expect(apiClient.get).toHaveBeenCalledWith("/notes")
    expect(notes[0]?.title).toBe("Trip list")
  })

  it("maps note responses for create, get, update, and delete", async () => {
    const note = {
      id: "1",
      title: "Trip list",
      content: "<p>Hello</p>",
      folder: "Travel",
      createdAt: "2026-06-16T09:00:00.000Z",
      updatedAt: "2026-06-16T09:00:00.000Z",
      userId: "user-1",
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { note } })
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { note } })
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { note } })
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} })

    expect(await createNote({ title: "Trip list", folder: "Travel" })).toEqual(
      note
    )
    expect(await getNote("1")).toEqual(note)
    expect(
      await updateNote("1", {
        title: "Trip list",
        folder: "Travel",
        content: "<p>Hello</p>",
      })
    ).toEqual(note)
    await expect(deleteNote("1")).resolves.toBeUndefined()

    expect(apiClient.post).toHaveBeenCalledWith("/notes", {
      title: "Trip list",
      folder: "Travel",
    })
    expect(apiClient.get).toHaveBeenCalledWith("/notes/1")
    expect(apiClient.patch).toHaveBeenCalledWith("/notes/1", {
      title: "Trip list",
      folder: "Travel",
      content: "<p>Hello</p>",
    })
    expect(apiClient.delete).toHaveBeenCalledWith("notes/1")
  })
})
