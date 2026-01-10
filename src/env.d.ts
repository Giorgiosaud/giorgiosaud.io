/// <reference path="../.astro/types.d.ts" />

import type { Session, User } from 'better-auth/types'

type UserType =
  | (User & {
      role?: string
      displayName?: string
      isBanned?: boolean
      bannedAt?: Date
      bannedReason?: string
    })
  | null

declare global {
  namespace App {
    interface Locals {
      session: Session | null
      user: UserType | null
    }
  }
}
