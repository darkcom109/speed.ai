import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import NotesPage from "@/app/notes/NotesPage"
import { useNotes } from "@/app/notes/hooks/use-notes"

vi.mock("@/components/app/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

vi.mock("@/app/notes/hooks/use-notes", () => ({
  useNotes: vi.fn(),
}))

vi.mock("@/app/notes/components/notes", () => ({
  NotesHeader: () => <header>Notes header</header>,
  CreateNote: () => <section>Create note</section>,
  RenderFolders: () => <section>Folders</section>,
  RenderFiles: () => <section>Files</section>,
}))

describe("NotesPage", () => {
  it("renders note sections and errors", () => {
    vi.mocked(useNotes).mockReturnValue({
      notes: [],
      filteredNotes: [],
      folders: ["All"],
      error: "Unable to load notes",
      isLoading: false,
      title: "",
      folder: "General",
      activeFolder: "All",
      searchQuery: "",
      setTitle: vi.fn(),
      setFolder: vi.fn(),
      setActiveFolder: vi.fn(),
      setSearchQuery: vi.fn(),
      handleCreateNote: vi.fn(),
    })

    render(<NotesPage />)

    expect(screen.getByText("Notes header")).toBeInTheDocument()
    expect(screen.getByText("Create note")).toBeInTheDocument()
    expect(screen.getByText("Folders")).toBeInTheDocument()
    expect(screen.getByText("Files")).toBeInTheDocument()
    expect(screen.getByText("Unable to load notes")).toBeInTheDocument()
  })
})
