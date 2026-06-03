import type { SavedChatMessage } from "../types/saved-assistant-message"

// Sends user message to backend and returns assistant response
export async function sendAssistantMessage(message: string): Promise<string> {
  const response = await fetch("http://localhost:3001/api/assistant/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      message,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Assistant failed")
  }

  if (data.event) {
    window.dispatchEvent(new Event(data.event))
  }

  return data.message
}

// Retrieves all saved messages stored if page refreshes during a conversation
export async function getAllSavedMessages(): Promise<SavedChatMessage[]> {
  const response = await fetch("http://localhost:3001/api/assistant/messages", {
    credentials: "include"
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to load messages")
  }

  return data.messages
}

// Deletes all saved messages and removes context
export async function deleteAllSavedMessages() {
  const response = await fetch("http://localhost:3001/api/assistant/messages", {
    method: "DELETE",
    credentials: "include"
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to clear chat")
  }
}
