export type SavedAssistantMessage = {
  id: string
  role: "assistant" | "user"
  content: string
}

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

export async function getAllSavedMessages(): Promise<SavedAssistantMessage[]> {
  const response = await fetch("http://localhost:3001/api/assistant/messages", {
    credentials: "include"
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to load messages")
  }

  return data.messages
}

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
