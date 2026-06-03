// Message type returned by the backend for either assistant or user
export type SavedChatMessage = {
  id: string
  role: "assistant" | "user"
  content: string
}