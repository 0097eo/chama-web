import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { User, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) return null;

          const result = await response.json();
          const authData = result.data;
          
          if (authData && authData.accessToken) {
            return {
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user && user.accessToken) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;

        try {
          const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
            headers: { 
              'Authorization': `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json',
            }
          });

          if (!profileResponse.ok) {
            console.error("Failed to fetch profile:", profileResponse.status);
            return { ...token, error: "FetchProfileError" };
          }

          const result = await profileResponse.json();
          const profile = result.data;

          token.id = profile.id;
          token.firstName = profile.firstName;
          token.lastName = profile.lastName;
          token.role = profile.role;
          token.phone = profile.phone || '';

        } catch (fetchError) {
          console.error("Failed to fetch user profile for token:", fetchError);
          return { ...token, error: "FetchProfileError" };
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      
      if (session.user) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.role = token.role;
        session.user.phone = token.phone || '';
      }
      
      return session;
    },
  },
} satisfies NextAuthConfig;