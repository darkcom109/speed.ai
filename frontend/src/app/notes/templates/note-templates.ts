import type { JSONContent } from "@tiptap/core"

export type NoteTemplate = {
  id: string
  name: string
  description: string
  content: JSONContent[]
}

function paragraph(text = ""): JSONContent {
  return {
    type: "paragraph",
    content: text ? [{ type: "text", text }] : undefined,
  }
}

function heading(text: string, level: 1 | 2 | 3): JSONContent {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  }
}

function bulletList(items: string[]): JSONContent {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [paragraph(item)],
    })),
  }
}

function taskList(items: string[]): JSONContent {
  return {
    type: "taskList",
    content: items.map((item) => ({
      type: "taskItem",
      attrs: { checked: false },
      content: [paragraph(item)],
    })),
  }
}

export function getNoteTemplates(date = new Date()): NoteTemplate[] {
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)

  return [
    {
      id: "daily-plan",
      name: "Daily plan",
      description: "Priorities, schedule and tasks for today",
      content: [
        heading(`Daily plan - ${formattedDate}`, 1),
        heading("Top priorities", 2),
        taskList(["Priority one", "Priority two", "Priority three"]),
        heading("Schedule", 2),
        bulletList(["Morning:", "Afternoon:", "Evening:"]),
        heading("Notes", 2),
        paragraph(),
      ],
    },
    {
      id: "meeting-notes",
      name: "Meeting notes",
      description: "Agenda, decisions and follow-up actions",
      content: [
        heading("Meeting notes", 1),
        paragraph(`Date: ${formattedDate}`),
        paragraph("Attendees: "),
        heading("Agenda", 2),
        bulletList(["Topic one", "Topic two"]),
        heading("Discussion", 2),
        paragraph(),
        heading("Decisions", 2),
        bulletList(["Decision"]),
        heading("Action items", 2),
        taskList(["Action - owner - due date"]),
      ],
    },
    {
      id: "project-plan",
      name: "Project plan",
      description: "Scope, milestones, risks and next actions",
      content: [
        heading("Project plan", 1),
        heading("Objective", 2),
        paragraph("Describe the outcome this project should achieve."),
        heading("Scope", 2),
        bulletList(["Included:", "Not included:"]),
        heading("Milestones", 2),
        taskList(["Milestone one", "Milestone two", "Milestone three"]),
        heading("Risks", 2),
        bulletList(["Risk - impact - mitigation"]),
        heading("Next actions", 2),
        taskList(["Next action"]),
      ],
    },
    {
      id: "finance-review",
      name: "Finance review",
      description: "Review spending, savings and next steps",
      content: [
        heading(`Finance review - ${formattedDate}`, 1),
        heading("Current position", 2),
        paragraph("Record your current savings and monthly balance."),
        heading("Spending observations", 2),
        bulletList([
          "Largest expense:",
          "Unexpected expense:",
          "Possible saving:",
        ]),
        heading("Goals", 2),
        taskList(["Review subscriptions", "Set next savings target"]),
        heading("Notes", 2),
        paragraph(),
      ],
    },
  ]
}
