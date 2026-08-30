import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import useSettings from "@/app/settings/hooks/useSettings"
import { clearGoogleSession } from "@/app/login/utils/clear-google-session"
import { apiClient } from "@/lib/api-client"

const navigate = vi.fn()

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
}))

vi.mock("@/app/login/utils/clear-google-session", () => ({
  clearGoogleSession: vi.fn(),
}))

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe("useSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        user: { name: "Alex Garcia", email: "alex@example.com" },
      },
    })
    vi.mocked(apiClient.post).mockResolvedValue({ data: {} })
    vi.mocked(apiClient.delete).mockResolvedValue({ data: {} })
  })

  it("loads the current user", async () => {
    const { result } = renderHook(() => useSettings())

    await waitFor(() =>
      expect(result.current.user?.email).toBe("alex@example.com")
    )

    expect(apiClient.get).toHaveBeenCalledWith("/auth/me")
  })

  it("logs out and navigates to login", async () => {
    const { result } = renderHook(() => useSettings())

    await act(async () => {
      await result.current.handleLogout()
    })

    expect(apiClient.post).toHaveBeenCalledWith("/auth/logout")
    expect(clearGoogleSession).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledWith("/login")
  })

  it("deletes the account and navigates to signup", async () => {
    const { result } = renderHook(() => useSettings())

    await act(async () => {
      await result.current.handleDeleteAccount()
    })

    expect(apiClient.delete).toHaveBeenCalledWith("/auth/me")
    expect(clearGoogleSession).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledWith("/signup")
  })
})
