import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import SignupPage from "@/app/signup/SignupPage"

vi.mock("@/components/site-navbar", () => ({
  default: () => <nav>Site navigation</nav>,
}))

vi.mock("@/app/signup/components", () => ({
  SignupLayout: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
  SignupForm: () => <section>Signup form</section>,
}))

describe("SignupPage", () => {
  it("renders the navigation and signup form", () => {
    render(<SignupPage />)

    expect(screen.getByText("Site navigation")).toBeInTheDocument()
    expect(screen.getByText("Signup form")).toBeInTheDocument()
  })
})
