import { type LoginPayload } from "../types/login-payload";

export async function loginUser(payload: LoginPayload) {
    const response = await fetch("http://localhost:3001/api/auth/login", {
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