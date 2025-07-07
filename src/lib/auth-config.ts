// src/lib/auth-config.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { logLoginSuccess, logLoginFailure } from "./audit-service";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();
        console.log('Auth attempt:', normalizedEmail);

        try {
          // Find user by email
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

          console.log('User found:', user);

          if (error || !user) {
            // Log failed login attempt
            try {
              await logLoginFailure(normalizedEmail, 'User not found');
            } catch (auditError) {
              console.warn('Failed to log login failure:', auditError);
            }
            return null;
          }

          // Verify password with bcrypt
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log('Password valid:', isPasswordValid);
          
          if (!isPasswordValid) {
            // Log failed login attempt
            try {
              await logLoginFailure(normalizedEmail, 'Invalid password');
            } catch (auditError) {
              console.warn('Failed to log login failure:', auditError);
            }
            return null;
          }

          // Check if email is verified
          if (!user.is_email_verified) {
            // Log failed login attempt
            try {
              await logLoginFailure(normalizedEmail, 'Email not verified');
            } catch (auditError) {
              console.warn('Failed to log login failure:', auditError);
            }
            return null;
          }

          // Log successful login
          try {
            await logLoginSuccess(normalizedEmail);
          } catch (auditError) {
            console.warn('Failed to log login success:', auditError);
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            company: user.company,
            tenant_id: user.tenant_id,
            role: user.role,
            is_email_verified: user.is_email_verified,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.tenant_id = user.tenant_id;
        token.company = user.company;
        token.role = user.role;
        token.is_email_verified = user.is_email_verified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.tenant_id = token.tenant_id as string;
        session.user.company = token.company as string;
        session.user.role = token.role as 'Admin' | 'Manager' | 'Auditor' | 'Viewer';
        session.user.is_email_verified = token.is_email_verified as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};