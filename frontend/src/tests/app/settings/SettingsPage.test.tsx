import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import SettingsPage from "@/app/settings/SettingsPage"
import useSettings from "@/app/settings/hooks/useSettings"

vi.mock("@/components/app/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

vi.mock("@/app/settings/hooks/useSettings", () => ({
  default: vi.fn(),
}))

vi.mock("@/app/settings/components", () => ({
  SettingsHeader: () => <header>Settings header</header>,
  NotificationOptions: () => <section>Notification options</section>,
  AccountOptions: () => <section>Account options</section>,
}))

describe("SettingsPage", () => {
  it("renders settings sections and errors", () => {
    vi.mocked(useSettings).mockReturnValue({
      user: { name: "Alex Garcia", email: "alex@example.com" },
      error: "Unable to load settings",
      handleLogout: vi.fn(),
      handleDeleteAccount: vi.fn(),
    })

    render(<SettingsPage />)

    expect(screen.getByText("Settings header")).toBeInTheDocument()
    expect(screen.getByText("Notification options")).toBeInTheDocument()
    expect(screen.getByText("Account options")).toBeInTheDocument()
    expect(screen.getByText("Unable to load settings")).toBeInTheDocument()
  })
})
