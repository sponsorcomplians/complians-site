// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Temporary hardcoded login for testing
        const user = {
          id: "1",
          name: "Test User",
          email: credentials?.email,
        };

        if (credentials?.email && credentials?.password) {
          return user;
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Temporarily remove 'pages' and 'callbacks' to simplify
  /*
  pages: {
    signIn: 
'/
auth/signin',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  */
  debug: true, // Keep this for debugging
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
