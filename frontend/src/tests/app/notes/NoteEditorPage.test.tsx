import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import NoteEditorPage from "@/app/notes/NoteEditorPage"
import useNoteEditor from "@/app/notes/hooks/use-note-editor"

vi.mock("@/components/app/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

vi.mock("@/app/notes/hooks/use-note-editor", () => ({
  default: vi.fn(),
}))

vi.mock("@/app/notes/components/note-editor", () => ({
  NoteAiInsights: () => <section>AI insights</section>,
  NoteEditorOptions: () => <section>Editor options</section>,
  NoteEditorForm: () => <section>Editor form</section>,
}))

describe("NoteEditorPage", () => {
  it("renders note editor sections and errors", () => {
    vi.mocked(useNoteEditor).mockReturnValue({
      noteId: "note-1",
      title: "Trip list",
      folder: "Travel",
      content: "<p>Hello</p>",
      error: "Unable to load file",
      isLoading: false,
      isSaving: false,
      didSave: false,
      setTitle: vi.fn(),
      setFolder: vi.fn(),
      setContent: vi.fn(),
      handleSaveNote: vi.fn(),
      handleDeleteNote: vi.fn(),
    })

    render(<NoteEditorPage />)

    expect(screen.getByText("Editor options")).toBeInTheDocument()
    expect(screen.getByText("Editor form")).toBeInTheDocument()
    expect(screen.getByText("AI insights")).toBeInTheDocument()
    expect(screen.getByText("Unable to load file")).toBeInTheDocument()
  })
})
