import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"
import { OTPService, authenticateUser, getUserProfile, createUserProfile } from "@/lib/auth"

export const authOptions: NextAuthOptions = {
  providers: [
    // Standard email/password login
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const result = await authenticateUser(credentials.email, credentials.password)
          
          if (result.success && result.user) {
            return {
              id: result.user.id,
              email: result.user.email,
              name: result.user.full_name,
              image: result.user.avatar_url,
            }
          }
          
          return null
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),

    // OTP-based signup
    CredentialsProvider({
      id: "otp-signup",
      name: "OTP Signup",
      credentials: {
        email: { label: "Email", type: "email" },
        otpCode: { label: "OTP Code", type: "text" },
        fullName: { label: "Full Name", type: "text" },
        companyName: { label: "Company Name", type: "text" },
        phone: { label: "Phone", type: "text" },
        jobTitle: { label: "Job Title", type: "text" },
        companySize: { label: "Company Size", type: "text" },
        industry: { label: "Industry", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otpCode) {
          return null
        }

        try {
          // Verify OTP
          const otpResult = await OTPService.verifyOTP(
            credentials.email,
            credentials.otpCode,
            'signup'
          )

          if (!otpResult.success) {
            return null
          }

          // Check if user already exists
          const existingUser = await getUserProfile(credentials.email)
          if (existingUser) {
            return {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.full_name,
              image: existingUser.avatar_url,
            }
          }

          // Create new user profile
          const userData = {
            full_name: credentials.fullName,
            company_name: credentials.companyName,
            phone: credentials.phone,
            job_title: credentials.jobTitle,
            company_size: credentials.companySize,
            industry: credentials.industry,
          }

          const createResult = await createUserProfile(credentials.email, userData)
          
          if (createResult.success && createResult.user) {
            return {
              id: createResult.user.id,
              email: createResult.user.email,
              name: createResult.user.full_name,
              image: createResult.user.avatar_url,
            }
          }

          return null
        } catch (error) {
          console.error("OTP signup error:", error)
          return null
        }
      },
    }),

    // OTP-based login
    CredentialsProvider({
      id: "otp-login",
      name: "OTP Login",
      credentials: {
        email: { label: "Email", type: "email" },
        otpCode: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otpCode) {
          return null
        }

        try {
          // Verify OTP
          const otpResult = await OTPService.verifyOTP(
            credentials.email,
            credentials.otpCode,
            'login'
          )

          if (!otpResult.success) {
            return null
          }

          // Get user profile
          const user = await getUserProfile(credentials.email)
          
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.full_name,
              image: user.avatar_url,
            }
          }

          return null
        } catch (error) {
          console.error("OTP login error:", error)
          return null
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      // Persist user data to token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      // Fetch fresh user data on each request
      if (token.email) {
        const profile = await getUserProfile(token.email as string)
        if (profile) {
          token.id = profile.id
          token.name = profile.full_name
          token.picture = profile.avatar_url
          token.companyName = profile.company_name
          token.jobTitle = profile.job_title
        }
      }

      return token
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        const user = session.user as any
        user.id = token.id as string
        user.email = token.email as string
        user.name = token.name as string
        user.image = token.picture as string
        user.companyName = token.companyName as string
        user.jobTitle = token.jobTitle as string
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return baseUrl + url
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },

  events: {
    async signIn({ user }) {
      console.log("User signed in:", user.email)
    },
    async signOut({ token }) {
      console.log("User signed out:", token?.email)
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
