import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { signupUser } from "@/app/signup/api/signup-api"
import useSignup from "@/app/signup/hooks/useSignup"
import { setSidebarUser } from "@/lib/sidebar-user-store"

const navigate = vi.fn()

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
}))

vi.mock("@/app/signup/api/signup-api", () => ({
  signupUser: vi.fn(),
}))

vi.mock("@/app/login/api/google-login-api", () => ({
  loginWithGoogle: vi.fn(),
}))

vi.mock("@/lib/sidebar-user-store", () => ({
  setSidebarUser: vi.fn(),
}))

function createSignupEvent() {
  const form = document.createElement("form")

  for (const [name, value] of [
    ["name", "Alex Garcia"],
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

describe("useSignup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(signupUser).mockResolvedValue({
      id: 1,
      name: "Alex Garcia",
      email: "alex@example.com",
      createdAt: new Date("2026-06-14T10:00:00.000Z"),
    })
  })

  it("creates an account and navigates to the dashboard", async () => {
    const { result } = renderHook(() => useSignup())
    const event = createSignupEvent()

    await act(async () => {
      await result.current.handleSubmitSignup(event)
    })

    expect(signupUser).toHaveBeenCalledWith({
      name: "Alex Garcia",
      email: "alex@example.com",
      password: "password123",
    })
    expect(setSidebarUser).toHaveBeenCalledWith({
      id: 1,
      name: "Alex Garcia",
      email: "alex@example.com",
      createdAt: new Date("2026-06-14T10:00:00.000Z"),
    })
    expect(navigate).toHaveBeenCalledWith("/dashboard")
    expect(result.current.isSubmitting).toBe(false)
  })

  it("shows an error when a Google credential is missing", async () => {
    const { result } = renderHook(() => useSignup())

    await act(async () => {
      await result.current.handleGoogleSuccess()
    })

    await waitFor(() =>
      expect(result.current.error).toBe("Google sign in failed")
    )
    expect(navigate).not.toHaveBeenCalled()
  })
})
