import { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Table } from "@tiptap/extension-table"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableRow } from "@tiptap/extension-table-row"
import {
  Loader2Icon,
} from "lucide-react"

import { NoteFormattingToolbar } from "@/app/notes/components/note-editor"

type RichNoteEditorProps = {
  noteId: string
  content: string
  onChange: (content: string) => void
  isAiEditing: boolean
}

function isHtmlContent(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content)
}

function escapeHtml(content: string) {
  return content
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function normalizeContent(content: string) {
  if (!content.trim()) {
    return "<p></p>"
  }

  if (isHtmlContent(content)) {
    return content
  }

  return content
    .split("\n")
    .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
    .join("")
}

export default function RichNoteEditor({
  noteId,
  content,
  onChange,
  isAiEditing,
}: RichNoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList.configure({
        HTMLAttributes: {
          class: "note-task-list",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "note-task-item",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "note-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: normalizeContent(content),
    editorProps: {
      attributes: {
        class:
          "note-editor-content min-h-[34rem] w-full rounded-md border bg-background px-6 pb-8 pt-10 text-base leading-7 shadow-sm outline-none sm:px-10 lg:min-h-[calc(100vh-23rem)]",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) {
      return
    }

    const nextContent = normalizeContent(content)

    if (editor.getHTML() === nextContent) {
      return
    }

    editor.commands.setContent(nextContent, { emitUpdate: false })
  }, [content, editor])

  return (
    <>
      <NoteFormattingToolbar editor={editor} noteId={noteId} />
      <div className="relative flex flex-1 justify-center overflow-y-auto bg-muted/30 px-4 py-5">
        <div className="w-full max-w-3xl">
          <EditorContent
            editor={editor}
            className="w-full [&_.ProseMirror_a]:cursor-pointer [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-2 dark:[&_.ProseMirror_a]:text-blue-400 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_h1]:mt-10 [&_.ProseMirror_h1]:mb-5 [&_.ProseMirror_h1]:text-5xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:mt-8 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:text-4xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:mt-6 [&_.ProseMirror_h3]:mb-3 [&_.ProseMirror_h3]:text-3xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h4]:mt-5 [&_.ProseMirror_h4]:mb-2 [&_.ProseMirror_h4]:text-2xl [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_ol]:my-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p]:my-2 [&_.ProseMirror_table]:my-4 [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:overflow-hidden [&_.ProseMirror_table]:rounded-md [&_.ProseMirror_table]:border [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-border [&_.ProseMirror_td]:px-3 [&_.ProseMirror_td]:py-2 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-border [&_.ProseMirror_th]:bg-muted/50 [&_.ProseMirror_th]:px-3 [&_.ProseMirror_th]:py-2 [&_.ProseMirror_ul]:my-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror>h1:first-child]:mt-0"
          />
        </div>

        {isAiEditing && (
          <div className="pointer-events-none absolute inset-0 flex justify-center bg-background/20 px-4 py-5 backdrop-blur-[1px]">
            <div className="flex min-h-[34rem] w-full max-w-3xl items-start rounded-md border border-primary/30 bg-background/80 px-6 py-8 shadow-sm sm:px-10 lg:min-h-[calc(100vh-23rem)]">
              <div className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm">
                <Loader2Icon className="size-4 animate-spin text-primary" />
                AI is editing this note...
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
