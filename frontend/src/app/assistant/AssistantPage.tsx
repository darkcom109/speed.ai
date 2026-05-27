import { useEffect, useRef, useState } from "react"
import { BotIcon, SendIcon, UserIcon } from "lucide-react"
import type { FormEvent } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { sendAssistantMessage } from "@/app/assistant/api/assistant-api"

type Message = {
  id: number
  role: "assistant" | "user"
  content: string
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Ask me about your tasks, notes, calendar, or dashboard.",
  },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <style>
        {`
          @keyframes assistant-glow {
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
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Assistant" />

        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Assistant</h2>
            <p className="text-sm text-muted-foreground">
              A personal chat interface for speed.ai.
            </p>
          </div>

          <Card className="flex h-[min(40rem,calc(100vh-11rem))] min-h-96 flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <BotIcon className="size-4" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">
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
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <MessageIcon className="size-4" />
                      </div>
                      <div
                        className={
                          message.role === "assistant"
                            ? "max-w-[80%] rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                            : "max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                        }
                      >
                        {message.content}
                      </div>
                    </div>
                  )
                })}
                {isSending && (
                  <div className="flex items-start gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <BotIcon className="size-4" />
                    </div>
                    <div className="relative overflow-hidden rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground shadow-[0_0_18px_rgba(255,255,255,0.06)] before:absolute before:inset-y-0 before:-left-1/2 before:w-1/2 before:animate-[assistant-glow_1.4s_ease-in-out_infinite] before:bg-linear-to-r before:from-transparent before:via-primary/25 before:to-transparent">
                      <span className="relative">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 border-t pt-4"
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
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
