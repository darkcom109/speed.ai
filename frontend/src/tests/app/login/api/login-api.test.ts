import { describe, expect, it, vi } from "vitest"

import { loginUser } from "@/app/login/api/login-api"
import { loginWithGoogle } from "@/app/login/api/google-login-api"
import { apiClient } from "@/lib/api-client"

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

describe("login-api", () => {
  it("returns the user for email login", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        user: {
          id: 1,
          name: "Alex Garcia",
          email: "alex@example.com",
          createdAt: new Date("2026-06-16T09:00:00.000Z"),
        },
      },
    })

    const user = await loginUser({
      email: "alex@example.com",
      password: "password123",
    })

    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "alex@example.com",
      password: "password123",
    })
    expect(user.email).toBe("alex@example.com")
  })

  it("returns the user for Google login", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        user: {
          id: 1,
          name: "Alex Garcia",
          email: "alex@example.com",
          createdAt: new Date("2026-06-16T09:00:00.000Z"),
        },
      },
    })

    const user = await loginWithGoogle("credential-token")

    expect(apiClient.post).toHaveBeenCalledWith(
      "/auth/google",
      "credential-token"
    )
    expect(user.name).toBe("Alex Garcia")
  })
})
