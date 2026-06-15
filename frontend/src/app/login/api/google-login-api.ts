import { apiClient } from "@/lib/api-client"
import type { UserData } from "@/app/login/types/user-data"

export async function loginWithGoogle(credential: string): Promise<UserData> {
    const { data } = await apiClient.post<{ user: UserData }>("/auth/google", credential)

    return data.user
}