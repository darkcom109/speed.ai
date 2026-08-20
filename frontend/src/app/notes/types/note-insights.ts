export type NoteInsightTask = {
  title: string
  description?: string
}

export type RelatedNoteInsight = {
  id: string
  title: string
  reason: string
}

export type NoteInsights = {
  summary: string
  suggestedTasks: NoteInsightTask[]
  relatedNotes: RelatedNoteInsight[]
  suggestedFolder?: string
  tags: string[]
}

export type NoteAiEditRequest = {
  instruction: string
  title: string
  folder: string
  content: string
}

export type NoteAiEdit = {
  title: string
  folder: string
  content: string
  summaryOfChanges: string
}

export type NoteSelectionAiEditRequest = {
  instruction: string
  selectedText: string
  noteContext: string
}

export type NoteSelectionAiEdit = {
  replacementHtml: string
  summaryOfChanges: string
}
