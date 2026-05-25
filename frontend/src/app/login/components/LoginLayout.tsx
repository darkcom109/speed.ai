import type { ReactNode } from "react"

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-dark">{children}</main>
}
