import { googleLogout } from "@react-oauth/google"

export function clearGoogleSession() {
  googleLogout()
  document.cookie = "g_state=; Max-Age=0; path=/"
}
