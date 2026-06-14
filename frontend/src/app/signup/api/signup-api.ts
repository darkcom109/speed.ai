import { type SignupPayload } from "../types/signup-payload"
import { apiClient } from "@/lib/api-client"

type SignupResponse = {
    id: number
    name: string
    email: string
    createdAt: Date
}

export async function signupUser(payload: SignupPayload): Promise<SignupResponse> {
    const { data } = await apiClient.post<{ user: SignupResponse }>("/auth/signup", payload)

    return data.user
}