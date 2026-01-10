/// <reference path="../.astro/types.d.ts" />

import type { Session, User } from 'better-auth/types'

type UserType =
  | (User & {
      role?: string | null | undefined
      displayName?: string | undefined
      isBanned?: boolean | undefined
      bannedAt?: Date | undefined
      bannedReason?: string | undefined
    })
  | null

declare global {
  namespace App {
    interface Locals {
      session: Session | null
      user: UserType | null | undefined
    }
  }
}
