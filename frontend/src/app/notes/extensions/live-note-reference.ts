import { mergeAttributes, Node } from "@tiptap/core"

export const noteReferenceTypes = [
  "savings-total",
  "monthly-spend",
  "monthly-balance",
  "tasks-due-today",
  "open-tasks",
] as const

export type NoteReferenceType = (typeof noteReferenceTypes)[number]

export const LiveNoteReference = Node.create({
  name: "liveNoteReference",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      reference: {
        default: "savings-total",
        parseHTML: (element) => element.getAttribute("data-note-reference"),
      },
      value: {
        default: "Unavailable",
        parseHTML: (element) =>
          element.getAttribute("data-note-reference-value"),
      },
    }
  },

  parseHTML() {
    return [{ tag: "span[data-note-reference]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-note-reference": HTMLAttributes.reference,
        "data-note-reference-value": HTMLAttributes.value,
        class:
          "inline-flex cursor-default items-center rounded border border-border bg-muted px-1.5 py-0.5 text-sm font-medium text-foreground",
        contenteditable: "false",
      }),
      HTMLAttributes.value,
    ]
  },
})
