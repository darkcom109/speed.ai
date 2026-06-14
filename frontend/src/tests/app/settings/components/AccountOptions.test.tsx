import type { ReactNode } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import AccountOptions from "@/app/settings/components/AccountOptions"

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogMedia: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogCancel: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
  }: {
    children: ReactNode
    onClick?: () => void
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

describe("AccountOptions", () => {
  it("renders user details and handles account actions", () => {
    const handleLogout = vi.fn()
    const handleDeleteAccount = vi.fn()

    render(
      <AccountOptions
        user={{ name: "Alex Garcia", email: "alex@example.com" }}
        handleLogout={handleLogout}
        handleDeleteAccount={handleDeleteAccount}
      />
    )

    expect(screen.getByText("Alex Garcia")).toBeInTheDocument()
    expect(screen.getByText("alex@example.com")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Log out" }))
    fireEvent.click(
      screen.getAllByRole("button", { name: "Delete account" }).at(-1)!
    )

    expect(handleLogout).toHaveBeenCalledOnce()
    expect(handleDeleteAccount).toHaveBeenCalledOnce()
  })
})
