import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import axios from 'axios';
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
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const authData = response.data.data;
          
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

          const profileResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${user.accessToken}` }
          });

          const profile = profileResponse.data.data;

          // Add the profile data to the token
          token.id = profile.id;
          token.firstName = profile.firstName;
          token.lastName = profile.lastName;
          token.role = profile.role;

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
      }
      
      return session;
    },
  },
} satisfies NextAuthConfig;