import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import LoginForm from "@/app/login/components/LoginForm"
import useLogin from "@/app/login/hooks/useLogin"

vi.mock("@/app/login/hooks/useLogin", () => ({
  default: vi.fn(),
}))

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onError }: { onError: () => void }) => (
    <button type="button" onClick={onError}>
      Continue with Google
    </button>
  ),
}))

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input type="checkbox" {...props} />
  ),
}))

const mockedUseLogin = vi.mocked(useLogin)

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  )
}

describe("LoginForm", () => {
  const handleLoginSubmit = vi.fn()
  const handleGoogleSuccess = vi.fn()
  const setError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseLogin.mockReturnValue({
      error: "",
      isSubmitting: false,
      setError,
      handleLoginSubmit,
      handleGoogleSuccess,
    })
  })

  it("renders login fields and submits the form", () => {
    renderLoginForm()

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!
    )

    expect(handleLoginSubmit).toHaveBeenCalledOnce()
  })

  it("shows errors and disables the button while submitting", () => {
    mockedUseLogin.mockReturnValue({
      error: "Invalid credentials",
      isSubmitting: true,
      setError,
      handleLoginSubmit,
      handleGoogleSuccess,
    })

    renderLoginForm()

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Signing in..." })).toBeDisabled()
  })

  it("sets an error when Google authentication fails", () => {
    renderLoginForm()

    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" })
    )

    expect(setError).toHaveBeenCalledWith("Google sign in failed")
  })
})
