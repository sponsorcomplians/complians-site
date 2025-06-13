// src/lib/auth.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get the current session on the server
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getServerSession(authOptions)
  return !!session
}

// Get session with type safety
export async function getSession() {
  return await getServerSession(authOptions)
}