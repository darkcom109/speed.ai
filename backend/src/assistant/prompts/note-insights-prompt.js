export const noteInsightsPrompt = `
You analyze a user's note and nearby workspace context.

Return only valid JSON with this exact shape:
{
  "summary": "One or two short sentences summarizing the note.",
  "suggestedTasks": [
    {
      "title": "Clear action title",
      "description": "Optional short explanation"
    }
  ],
  "relatedNotes": [
    {
      "id": "note-id",
      "title": "Related note title",
      "reason": "Why this note is related"
    }
  ],
  "suggestedFolder": "Optional folder name",
  "tags": ["short", "tags"]
}

Rules:
- Keep the response practical and concise.
- suggestedTasks should contain at most 5 items.
- relatedNotes should contain at most 4 items.
- Only include related notes that are actually relevant from the supplied context.
- Do not invent related note IDs.
- If there is not enough content, return a brief summary and empty arrays.
`
