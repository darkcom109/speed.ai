import { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

import { NoteFormattingToolbar } from "@/app/notes/components/NoteFormattingToolbar"

type RichNoteEditorProps = {
  content: string
  onChange: (content: string) => void
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

export function RichNoteEditor({ content, onChange }: RichNoteEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: normalizeContent(content),
    editorProps: {
      attributes: {
        class:
          "min-h-[44rem] w-full rounded-md border bg-background px-10 py-8 text-base leading-7 shadow-sm outline-none",
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
      <NoteFormattingToolbar editor={editor} />
      <div className="flex flex-1 justify-center overflow-y-auto bg-muted/30 px-4 py-6">
        <EditorContent
          editor={editor}
          className="w-full max-w-3xl [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-muted-foreground [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_h1]:text-5xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:text-4xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:text-3xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h4]:text-2xl [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6"
        />
      </div>
    </>
  )
}
