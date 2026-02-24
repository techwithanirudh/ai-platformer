import { createAuthClient } from 'better-auth/react'

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {}
)

export const signIn: typeof authClient.signIn = authClient.signIn
export const signOut: typeof authClient.signOut = authClient.signOut
export const useSession: typeof authClient.useSession = authClient.useSession

export type User = (typeof authClient.$Infer.Session)['user']

export const getLoginUrl = (redirectTo?: string): string => {
  if (!redirectTo) {
    return '/login'
  }
  const safe = redirectTo.startsWith('/') ? redirectTo : '/'
  return `/login?redirectTo=${encodeURIComponent(safe)}`
}
