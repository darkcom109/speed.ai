import { useNavigate } from "react-router"
import { useState } from "react"
import { signupUser } from "@/app/signup/api/signup-api"

// Google specific imports
import { loginWithGoogle } from "@/app/login/api/google-login-api"

export default function useSignup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmitSignup(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        const name = formData.get('name')
        const email = formData.get("email")
        const password = formData.get("password")

        try {
            setIsSubmitting(true)
            setError("")

            if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
                setError("Email and password are required")
                return
            }

            await signupUser({ name, email, password})

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
        handleSubmitSignup,
        handleGoogleSuccess
    }
}
