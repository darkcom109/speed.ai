import type { UserData } from "@/app/login/types/user-data"
import { apiClient } from "@/lib/api-client"

export type SidebarUser = {
  name: string
  email: string
  avatar: string
}

type UserIdentity = Pick<UserData, "name" | "email">

const fallbackUser: SidebarUser = {
  name: "Guest",
  email: "Not signed in",
  avatar: "/avatars/shadcn.jpg",
}

const listeners = new Set<() => void>()

let cachedUser: SidebarUser | undefined
let pendingUser: Promise<SidebarUser> | null = null
let cacheVersion = 0

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function toSidebarUser(user: UserIdentity): SidebarUser {
  return {
    name: user.name || fallbackUser.name,
    email: user.email || fallbackUser.email,
    avatar: fallbackUser.avatar,
  }
}

export function getSidebarUserSnapshot() {
  return cachedUser ?? fallbackUser
}

export function subscribeToSidebarUser(listener: () => void) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

export function setSidebarUser(user: UserIdentity) {
  cacheVersion += 1
  cachedUser = toSidebarUser(user)
  pendingUser = null
  notifyListeners()
}

export function clearSidebarUser() {
  cacheVersion += 1
  cachedUser = fallbackUser
  pendingUser = null
  notifyListeners()
}

export async function loadSidebarUser() {
  if (cachedUser) {
    return cachedUser
  }

  const requestVersion = cacheVersion

  pendingUser ??= apiClient
    .get<{ user: UserData }>("/auth/me")
    .then(({ data }) => {
      if (requestVersion === cacheVersion) {
        cachedUser = toSidebarUser(data.user)
        notifyListeners()
      }

      return getSidebarUserSnapshot()
    })
    .catch(() => {
      if (requestVersion === cacheVersion) {
        cachedUser = fallbackUser
        notifyListeners()
      }

      return getSidebarUserSnapshot()
    })
    .finally(() => {
      pendingUser = null
    })

  return pendingUser
}
