/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extend the built-in session.user object to include our custom properties.
   */
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
    } & DefaultSession['user'];
  }

  // Extend the user object passed during the authorize callback
  interface User {
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  /** Extend the token to hold our custom properties. */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  }
}