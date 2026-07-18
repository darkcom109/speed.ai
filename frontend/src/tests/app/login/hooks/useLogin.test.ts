import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import useLogin from "@/app/login/hooks/useLogin"
import { loginUser, loginWithGoogle } from "@/app/login/api"
import { setSidebarUser } from "@/lib/sidebar-user-store"

const navigate = vi.fn()

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
}))

vi.mock("@/app/login/api", () => ({
  loginUser: vi.fn(),
  loginWithGoogle: vi.fn(),
}))

vi.mock("@/lib/sidebar-user-store", () => ({
  setSidebarUser: vi.fn(),
}))

function createLoginEvent() {
  const form = document.createElement("form")

  for (const [name, value] of [
    ["email", "alex@example.com"],
    ["password", "password123"],
  ]) {
    const input = document.createElement("input")
    input.name = name
    input.value = value
    form.append(input)
  }

  return {
    preventDefault: vi.fn(),
    currentTarget: form,
  } as unknown as React.FormEvent<HTMLFormElement>
}

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(loginUser).mockResolvedValue({
      id: 1,
      name: "Alex Garcia",
      email: "alex@example.com",
      createdAt: new Date("2026-06-16T09:00:00.000Z"),
    })
    vi.mocked(loginWithGoogle).mockResolvedValue({
      id: 1,
      name: "Alex Garcia",
      email: "alex@example.com",
      createdAt: new Date("2026-06-16T09:00:00.000Z"),
    })
  })

  it("logs in with email and navigates to the dashboard", async () => {
    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.handleLoginSubmit(createLoginEvent())
    })

    expect(loginUser).toHaveBeenCalledWith({
      email: "alex@example.com",
      password: "password123",
    })
    expect(setSidebarUser).toHaveBeenCalledWith({
      id: 1,
      name: "Alex Garcia",
      email: "alex@example.com",
      createdAt: new Date("2026-06-16T09:00:00.000Z"),
    })
    expect(navigate).toHaveBeenCalledWith("/dashboard")
    expect(result.current.isSubmitting).toBe(false)
  })

  it("shows an error when the Google credential is missing", async () => {
    const { result } = renderHook(() => useLogin())

    await act(async () => {
      await result.current.handleGoogleSuccess()
    })

    await waitFor(() =>
      expect(result.current.error).toBe("Google sign in failed")
    )
    expect(navigate).not.toHaveBeenCalled()
  })
})
