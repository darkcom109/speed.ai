import { redirect } from "react-router";
import { apiClient } from "@/lib/api-client";

export async function redirectAuthenticatedUser() {
  try {
    await apiClient.get("/auth/me");
    return redirect("/dashboard");
  } catch {
    return null;
  }
}
