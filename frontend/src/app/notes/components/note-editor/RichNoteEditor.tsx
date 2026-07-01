import { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import {
  Loader2Icon,
} from "lucide-react"

import { NoteFormattingToolbar } from "@/app/notes/components/note-editor"
import type { NoteAiEdit } from "@/app/notes/types/note-insights"

type RichNoteEditorProps = {
  noteId: string
  content: string
  onChange: (content: string) => void
  aiEditPreview: NoteAiEdit | null
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

function sanitizePreviewHtml(content: string) {
  return content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
}

export default function RichNoteEditor({
  noteId,
  content,
  onChange,
  aiEditPreview,
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
        <EditorContent
          editor={editor}
          className="w-full max-w-3xl [&_.ProseMirror_a]:cursor-pointer [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-2 dark:[&_.ProseMirror_a]:text-blue-400 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_h1]:mt-10 [&_.ProseMirror_h1]:mb-5 [&_.ProseMirror_h1]:text-5xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:mt-8 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:text-4xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:mt-6 [&_.ProseMirror_h3]:mb-3 [&_.ProseMirror_h3]:text-3xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h4]:mt-5 [&_.ProseMirror_h4]:mb-2 [&_.ProseMirror_h4]:text-2xl [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_ol]:my-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p]:my-2 [&_.ProseMirror_ul]:my-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror>h1:first-child]:mt-0"
        />

        {isAiEditing && !aiEditPreview && (
          <div className="pointer-events-none absolute inset-0 flex justify-center bg-background/20 px-4 py-5 backdrop-blur-[1px]">
            <div className="flex min-h-[34rem] w-full max-w-3xl items-start rounded-md border border-primary/30 bg-background/80 px-6 py-8 shadow-sm sm:px-10 lg:min-h-[calc(100vh-23rem)]">
              <div className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium shadow-sm">
                <Loader2Icon className="size-4 animate-spin text-primary" />
                AI is editing this note...
              </div>
            </div>
          </div>
        )}

        {aiEditPreview && (
          <div className="absolute inset-0 flex justify-center overflow-y-auto bg-muted/40 px-4 py-5">
            <div className="relative min-h-[34rem] w-full max-w-3xl rounded-md border border-primary/40 bg-background px-6 pb-8 pt-10 text-base leading-7 shadow-lg sm:px-10 lg:min-h-[calc(100vh-23rem)]">
              <div
                className="note-editor-content [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h1]:mt-10 [&_h1]:mb-5 [&_h1]:text-5xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-4xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-3xl [&_h3]:font-semibold [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-2xl [&_h4]:font-semibold [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{
                  __html: sanitizePreviewHtml(aiEditPreview.content),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
