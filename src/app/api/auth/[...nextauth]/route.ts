// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"
import bcrypt from "bcryptjs"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Auth attempt for:', credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null
          }

          console.log('Fetching user from Supabase...');
          
          // Fetch user from Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email.toLowerCase())
            .single()

          console.log('Supabase response:', { 
            found: !!user, 
            error: error?.message 
          });

          if (error || !user) {
            console.log("User not found:", credentials.email)
            return null
          }

          // Check if account is locked
          if (user.locked_until && new Date(user.locked_until) > new Date()) {
            console.log("Account locked:", credentials.email)
            return null
          }

          console.log('Verifying password...');
          
          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          console.log('Password valid:', isValidPassword);

          if (!isValidPassword) {
            // Increment login attempts
            const attempts = (user.login_attempts || 0) + 1
            const maxAttempts = 5
            
            let updateData: any = { login_attempts: attempts }
            
            if (attempts >= maxAttempts) {
              updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString()
              updateData.login_attempts = 0
            }
            
            await supabase
              .from('users')
              .update(updateData)
              .eq('id', user.id)

            return null
          }

          // Reset login attempts and update last login
          await supabase
            .from('users')
            .update({ 
              login_attempts: 0,
              last_login: new Date().toISOString(),
              locked_until: null
            })
            .eq('id', user.id)

          console.log('Login successful for:', user.email);

          // Return user object for NextAuth
          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            image: user.avatar_url || null,
          }

        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }