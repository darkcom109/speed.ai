import type { SavedChatMessage } from "@/app/assistant/types/saved-assistant-message"
import { apiClient } from "@/lib/api-client"

// Sends user message to backend and returns assistant response
export async function sendAssistantMessage(message: string): Promise<string> {
  const { data } = await apiClient.post<{ message: string, event: string }>("/assistant/chat", message)

  if (data.event) {
    window.dispatchEvent(new Event(data.event))
  }

  return data.message
}

// Retrieves all saved messages stored if page refreshes during a conversation
export async function getAllSavedMessages(): Promise<SavedChatMessage[]> {
  const { data } = await apiClient.get<{ messages: SavedChatMessage[]}>("/assistant/messages")

  return data.messages
}

// Deletes all saved messages and removes context
export async function deleteAllSavedMessages() {
  await apiClient.delete("/assistant/messages")
}
