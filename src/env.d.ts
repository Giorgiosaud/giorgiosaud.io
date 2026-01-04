/// <reference path="../.astro/types.d.ts" />

import type { Session, User } from 'better-auth/types'

declare namespace App {
  interface Locals {
    session: Session | null
    user: (User & {
      role?: string
      displayName?: string
      isBanned?: boolean
      bannedAt?: Date
      bannedReason?: string
    }) | null
  }
}
