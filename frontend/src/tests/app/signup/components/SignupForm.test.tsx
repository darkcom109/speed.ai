import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import SignupForm from "@/app/signup/components/SignupForm"
import useSignup from "@/app/signup/hooks/useSignup"

vi.mock("@/app/signup/hooks/useSignup", () => ({
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

const mockedUseSignup = vi.mocked(useSignup)

function renderSignupForm() {
  return render(
    <MemoryRouter>
      <SignupForm />
    </MemoryRouter>
  )
}

describe("SignupForm", () => {
  const handleSubmitSignup = vi.fn()
  const handleGoogleSuccess = vi.fn()
  const setError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseSignup.mockReturnValue({
      error: "",
      isSubmitting: false,
      setError,
      handleSubmitSignup,
      handleGoogleSuccess,
    })
  })

  it("renders the signup fields and submits the form", () => {
    renderSignupForm()

    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()

    fireEvent.submit(
      screen.getByRole("button", { name: "Create account" }).closest("form")!
    )

    expect(handleSubmitSignup).toHaveBeenCalledOnce()
  })

  it("shows errors and disables the button while submitting", () => {
    mockedUseSignup.mockReturnValue({
      error: "Email is already registered",
      isSubmitting: true,
      setError,
      handleSubmitSignup,
      handleGoogleSuccess,
    })

    renderSignupForm()

    expect(screen.getByText("Email is already registered")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Creating Account..." })
    ).toBeDisabled()
  })

  it("sets an error when Google authentication fails", () => {
    renderSignupForm()

    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" })
    )

    expect(setError).toHaveBeenCalledWith("Google sign in failed")
  })
})
