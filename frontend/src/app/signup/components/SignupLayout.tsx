import type { ReactNode } from "react";

export default function SignupLayout({ children } : { children: ReactNode}) {
  return (
    <main className="min-h-screen bg-dark">
      { children }
    </main>
  )
}
