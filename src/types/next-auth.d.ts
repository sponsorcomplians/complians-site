// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      tenant_id: string
      company: string
      role?: 'Admin' | 'Manager' | 'Auditor' | 'Viewer'
      is_email_verified?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    tenant_id: string
    company: string
    role?: 'Admin' | 'Manager' | 'Auditor' | 'Viewer'
    is_email_verified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    tenant_id?: string
    company?: string
    role?: 'Admin' | 'Manager' | 'Auditor' | 'Viewer'
    is_email_verified?: boolean
  }
}