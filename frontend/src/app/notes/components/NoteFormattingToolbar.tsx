import type { ElementType } from "react"
import type { Editor } from "@tiptap/react"
import {
  BoldIcon,
  CalculatorIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
} from "lucide-react"
import { evaluate, format } from "mathjs"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NoteFormattingToolbarProps = {
  editor: Editor | null
}

type FormattingButton = {
  label: string
  icon: ElementType
  isActive: () => boolean
  onClick: () => void
}

export function NoteFormattingToolbar({ editor }: NoteFormattingToolbarProps) {
  if (!editor) {
    return null
  }

  const activeEditor = editor

  function calculateSelection() {
    const { from, to } = activeEditor.state.selection
    const expression = activeEditor.state.doc.textBetween(from, to, " ").trim()

    if (!expression) {
      toast.info("Select a calculation first")
      return
    }

    try {
      const result = evaluate(expression)
      const formattedResult = format(result, { precision: 14 })

      activeEditor
        .chain()
        .focus()
        .insertContentAt({ from, to }, `${expression} = ${formattedResult}`)
        .run()
    } catch {
      toast.error("Unable to calculate the selected text")
    }
  }

  const formattingButtons: FormattingButton[] = [
    {
      label: "Bold",
      icon: BoldIcon,
      isActive: () => editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: ItalicIcon,
      isActive: () => editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Heading 1",
      icon: Heading1Icon,
      isActive: () => editor.isActive("heading", { level: 1 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Heading 2",
      icon: Heading2Icon,
      isActive: () => editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3",
      icon: Heading3Icon,
      isActive: () => editor.isActive("heading", { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Heading 4",
      icon: Heading4Icon,
      isActive: () => editor.isActive("heading", { level: 4 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
    },
    {
      label: "Bullet list",
      icon: ListIcon,
      isActive: () => editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrderedIcon,
      isActive: () => editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Checklist",
      icon: ListTodoIcon,
      isActive: () => editor.isActive("taskList"),
      onClick: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      label: "Calculate selection",
      icon: CalculatorIcon,
      isActive: () => false,
      onClick: calculateSelection,
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-background/60 px-4 py-2">
      {formattingButtons.map((button) => {
        const Icon = button.icon

        return (
          <Button
            key={button.label}
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={button.label}
            title={button.label}
            onClick={button.onClick}
            className={cn(button.isActive() && "bg-muted text-foreground")}
          >
            <Icon />
          </Button>
        )
      })}
    </div>
  )
}
