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
