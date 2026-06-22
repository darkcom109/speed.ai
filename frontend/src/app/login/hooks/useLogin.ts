import { useNavigate } from "react-router"
import { useState } from "react"
import { loginUser, loginWithGoogle } from "@/app/login/api"

export default function useLogin() {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault()

      const formData = new FormData(event.currentTarget)

      const email = formData.get("email")
      const password = formData.get("password")

      try {
        setIsSubmitting(true)
        setError("")

        if (typeof email !== "string" || typeof password !== "string") {
          setError("Name, email and password are required")
          return
        }

        await loginUser({email, password})

        navigate("/dashboard")
      }
      catch(error) {
        setError(error instanceof Error ? error.message : "Unable to sign in")
        console.log(error)
      }
      finally {
        setIsSubmitting(false)
      }
  }

  async function handleGoogleSuccess(credential?: string) {
    if (!credential) {
      setError("Google sign in failed")
      return
    }

    try {
      setError("")
      setIsSubmitting(true)

      await loginWithGoogle(credential)

      navigate("/dashboard")
    }
    catch(error) {
      setError(error instanceof Error ? error.message : "Unable to sign in")
      console.log(error)
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return {
    error,
    isSubmitting,
    setError,
    handleLoginSubmit,
    handleGoogleSuccess,
  }
}