import { apiClient } from "@/lib/api-client";
import type { LoginPayload } from "@/app/login/types/login-payload";
import type { UserData } from "@/app/login/types/user-data";

export async function loginUser(payload: LoginPayload): Promise<UserData> {
    const { data } = await apiClient.post<{ user: UserData }>("/auth/login", payload)

    return data.user
}