import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { BotIcon, RotateCcwIcon, SendIcon, UserIcon, XIcon } from "lucide-react"

import { sendAssistantMessage } from "@/app/assistant/api/assistant-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AssistantMessage = {
  id: number
  role: "assistant" | "user"
  content: string
}

const initialMessages: AssistantMessage[] = [
  {
    id: 1,
    role: "assistant",
    content: "Ask me about your workspace.",
  },
]

export function GlobalAssistantSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    })
  }, [messages, isSending])

  useEffect(() => {
    if (isOpen) {
      document.body.dataset.assistantOpen = "true"
    } else {
      delete document.body.dataset.assistantOpen
    }

    return () => {
      delete document.body.dataset.assistantOpen
    }
  }, [isOpen])

  function handleClearChat() {
    setMessages(initialMessages)
    setMessage("")
    setError("")
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage || isSending) {
      return
    }

    const messageId = Date.now()

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: messageId,
        role: "user",
        content: trimmedMessage,
      },
    ])
    setMessage("")
    setError("")
    setIsSending(true)

    try {
      const reply = await sendAssistantMessage(trimmedMessage)

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: messageId + 1,
          role: "assistant",
          content: reply,
        },
      ])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Assistant failed")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        title={isOpen ? "Close assistant" : "Open assistant"}
        data-state={isOpen ? "open" : "closed"}
        className="data-[state=open]:bg-muted"
        onClick={() => setIsOpen((current) => !current)}
      >
        <BotIcon />
      </Button>

      {isOpen && (
        <aside
          className="fixed inset-y-0 right-0 z-40 flex w-[min(var(--assistant-sidebar-width),calc(100vw-1rem))] flex-col border-l bg-sidebar text-sidebar-foreground shadow-sm md:z-20 md:w-(--assistant-sidebar-width)"
          aria-label="Assistant sidebar"
        >
          <style>
            {`
            @keyframes global-assistant-glow {
              0% {
                transform: translateX(0);
                opacity: 0;
              }

              30% {
                opacity: 1;
              }

              100% {
                transform: translateX(300%);
                opacity: 0;
              }
            }
          `}
          </style>

          <div className="border-b p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-medium">
                  <BotIcon className="size-4" />
                  Assistant
                </h2>
                <p className="text-sm text-muted-foreground">
                  Chat with speed.ai from anywhere.
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Clear assistant chat"
                  title="Clear chat"
                  onClick={handleClearChat}
                  disabled={isSending}
                >
                  <RotateCcwIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close assistant"
                  title="Close assistant"
                  onClick={() => setIsOpen(false)}
                >
                  <XIcon />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
              {messages.map((message) => {
                const MessageIcon =
                  message.role === "assistant" ? BotIcon : UserIcon

                return (
                  <div
                    key={message.id}
                    className={
                      message.role === "assistant"
                        ? "flex items-start gap-2"
                        : "flex flex-row-reverse items-start gap-2"
                    }
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <MessageIcon className="size-3.5" />
                    </div>
                    <div
                      className={
                        message.role === "assistant"
                          ? "max-w-[85%] rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                          : "max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                      }
                    >
                      {message.content}
                    </div>
                  </div>
                )
              })}

              {isSending && (
                <div className="flex items-start gap-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <BotIcon className="size-3.5" />
                  </div>
                  <div className="relative overflow-hidden rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground before:absolute before:inset-y-0 before:-left-1/2 before:w-1/2 before:animate-[global-assistant-glow_1.4s_ease-in-out_infinite] before:bg-linear-to-r before:from-transparent before:via-primary/25 before:to-transparent">
                    <span className="relative">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 border-t pt-3"
            >
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask something..."
                disabled={isSending}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send message"
                disabled={isSending}
              >
                <SendIcon className="size-4" />
              </Button>
            </form>
          </div>
        </aside>
      )}
    </>
  )
}
