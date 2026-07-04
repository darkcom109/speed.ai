import { useState, type ElementType } from "react"
import type { Editor } from "@tiptap/react"
import {
  BoldIcon,
  CalculatorIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ItalicIcon,
  LayoutTemplateIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  Loader2Icon,
  Table2Icon,
  SparklesIcon,
} from "lucide-react"
import { evaluate, format } from "mathjs"

import { runNoteSelectionAiCommand } from "@/app/notes/api/notes-api"
import { getNoteTemplates } from "@/app/notes/templates/note-templates"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/lib/single-toast"
import { cn } from "@/lib/utils"

type NoteFormattingToolbarProps = {
  editor: Editor | null
  noteId: string
}

type FormattingButton = {
  label: string
  icon: ElementType
  isActive: () => boolean
  onClick: () => void
}

function trimHtmlTextNodes(html: string) {
  const template = document.createElement("template")
  template.innerHTML = html.trim()

  const textNodes: Text[] = []
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT)

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }

  textNodes.forEach((textNode) => {
    textNode.textContent = textNode.textContent?.replace(/\s+/g, " ") ?? ""
  })

  const firstTextNode = textNodes[0]
  const lastTextNode = textNodes[textNodes.length - 1]

  if (firstTextNode?.textContent) {
    firstTextNode.textContent = firstTextNode.textContent.trimStart()
  }

  if (lastTextNode?.textContent) {
    lastTextNode.textContent = lastTextNode.textContent.trimEnd()
  }

  return template.innerHTML
}

function normalizeSelectionReplacement(html: string, selectedText: string) {
  const trimmedHtml = trimHtmlTextNodes(html)
  const template = document.createElement("template")
  template.innerHTML = trimmedHtml

  const childElements = Array.from(template.content.children)
  const isSingleParagraph =
    childElements.length === 1 && childElements[0].tagName.toLowerCase() === "p"
  const isInlineSelection = !selectedText.includes("\n")

  if (isInlineSelection && isSingleParagraph) {
    return childElements[0].innerHTML.trim()
  }

  return trimmedHtml
}

export default function NoteFormattingToolbar({
  editor,
  noteId,
}: NoteFormattingToolbarProps) {
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null)

  if (!editor) {
    return null
  }

  const activeEditor = editor
  const noteTemplates = getNoteTemplates()
  const selectionAiActions = [
    {
      label: "Rewrite clearly",
      instruction: "Rewrite the selected text to be clearer while keeping the same meaning.",
    },
    {
      label: "Make shorter",
      instruction: "Make the selected text shorter and more concise.",
    },
    {
      label: "Make professional",
      instruction: "Rewrite the selected text in a more professional tone.",
    },
    {
      label: "Turn into checklist",
      instruction: "Turn the selected text into a clear checklist.",
    },
    {
      label: "Explain simply",
      instruction: "Explain the selected text in simpler wording.",
    },
  ]

  const tableActions = [
    {
      label: "Insert 3x3 table",
      onClick: () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    { label: "Add row before", onClick: () => editor.chain().focus().addRowBefore().run() },
    { label: "Add row after", onClick: () => editor.chain().focus().addRowAfter().run() },
    { label: "Add column before", onClick: () => editor.chain().focus().addColumnBefore().run() },
    { label: "Add column after", onClick: () => editor.chain().focus().addColumnAfter().run() },
    { label: "Delete row", onClick: () => editor.chain().focus().deleteRow().run() },
    { label: "Delete column", onClick: () => editor.chain().focus().deleteColumn().run() },
    { label: "Delete table", onClick: () => editor.chain().focus().deleteTable().run() },
  ]

  function insertTemplate(templateId: string) {
    const template = noteTemplates.find(
      (noteTemplate) => noteTemplate.id === templateId
    )

    if (!template) {
      return
    }

    activeEditor
      .chain()
      .focus()
      .insertContentAt(activeEditor.state.selection.to, template.content)
      .run()

    toast.success(`${template.name} inserted`)
  }

  function calculateSelection() {
    const { from, to } = activeEditor.state.selection
    const selectedText = activeEditor.state.doc
      .textBetween(from, to, " ")
      .trim()
    const expression = selectedText.split("=")[0]?.trim()

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

  async function runSelectionAiAction(label: string, instruction: string) {
    const { from, to } = activeEditor.state.selection
    const selectedText = activeEditor.state.doc.textBetween(from, to, " ").trim()
    const previousContent = activeEditor.getHTML()

    if (!selectedText || from === to) {
      toast.info("Select text to edit with AI")
      return
    }

    try {
      setActiveAiAction(label)

      const edit = await runNoteSelectionAiCommand(noteId, {
        instruction,
        selectedText,
        noteContext: activeEditor.getText().slice(0, 4000),
      })

      const replacementHtml = normalizeSelectionReplacement(
        edit.replacementHtml,
        selectedText
      )
      const replacementText = trimHtmlTextNodes(edit.replacementHtml)
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()

      activeEditor
        .chain()
        .focus()
        .insertContentAt({ from, to }, replacementHtml)
        .run()

      const selectionEnd = Math.min(
        activeEditor.state.doc.content.size,
        Math.max(from, from + replacementText.length)
      )

      activeEditor
        .chain()
        .focus()
        .setTextSelection({ from, to: selectionEnd })
        .run()

      let toastId: string | number

      toastId = toast("AI selection edit", {
        description: edit.summaryOfChanges,
        duration: Infinity,
        action: {
          label: "Keep",
          onClick: () => toast.dismiss(toastId),
        },
        cancel: {
          label: "Undo",
          onClick: () => {
            activeEditor.commands.setContent(previousContent)
            toast.dismiss(toastId)
          },
        },
      })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to edit selection"
      )
    } finally {
      setActiveAiAction(null)
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
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b bg-background/95 px-4 py-2 shadow-sm backdrop-blur">
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Insert template"
            title="Insert template"
          >
            <LayoutTemplateIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>Note templates</DropdownMenuLabel>
          {noteTemplates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              className="flex-col items-start gap-0.5"
              onSelect={() => insertTemplate(template.id)}
            >
              <span>{template.name}</span>
              <span className="text-xs text-muted-foreground">
                {template.description}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Table options"
            title="Table options"
          >
            <Table2Icon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Tables</DropdownMenuLabel>
          {tableActions.map((action) => (
            <DropdownMenuItem key={action.label} onSelect={action.onClick}>
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="AI edit selection"
            title="AI edit selection"
            disabled={Boolean(activeAiAction)}
          >
            {activeAiAction ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SparklesIcon />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>AI selection edit</DropdownMenuLabel>
          {selectionAiActions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              onSelect={() =>
                runSelectionAiAction(action.label, action.instruction)
              }
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
