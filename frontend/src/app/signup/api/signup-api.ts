import { type SignupPayload } from "../types/signup-payload"

export async function signupUser(payload: SignupPayload) {
    const response = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Unable to sign in")
    }

    return data
}