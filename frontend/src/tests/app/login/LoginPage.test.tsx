import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import LoginPage from "@/app/login/LoginPage"

vi.mock("@/components/site-navbar", () => ({
  default: () => <nav>Site navigation</nav>,
}))

vi.mock("@/app/login/components", () => ({
  LoginLayout: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
  LoginForm: () => <section>Login form</section>,
}))

describe("LoginPage", () => {
  it("renders the navigation and login form", () => {
    render(<LoginPage />)

    expect(screen.getByText("Site navigation")).toBeInTheDocument()
    expect(screen.getByText("Login form")).toBeInTheDocument()
  })
})
