import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import axios, { isAxiosError } from 'axios';

export const authConfig = {
  // --- ADD THIS LINE ---
  // Explicitly tell NextAuth.js to use the JWT session strategy.
  // This is required for the callbacks to work correctly with a Credentials provider.
  session: { strategy: "jwt" },

  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const authData = response.data.data;
          
          if (authData && authData.accessToken) {
            return {
              id: '',
              email: credentials.email as string,
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
            };
          }
          return null;
        } catch (error) {
          if (isAxiosError(error)) {
            console.error("Login Error:", error.response?.data);
          } else {
            console.error("Login Error:", error);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },
  // The 'secret' property is automatically read from the AUTH_SECRET
  // environment variable, so you don't need to explicitly add it here,
  // but this is where it would go if you named your variable something else.
  // secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;