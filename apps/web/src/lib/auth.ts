import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

// In production you'd pull these from a database.
// For now we use env vars so you can deploy immediately.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@smartshopper.app';
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ??
  // bcrypt hash of "smartshopper2024" (12 rounds)
  '$2b$12$m794wrYenStwS1yzYAB/xOpXZmjuJn43XjBAgLKD76fu90ZXIaMhy';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (credentials.email !== ADMIN_EMAIL) return null;

        const valid = await compare(credentials.password, ADMIN_PASSWORD_HASH);
        if (!valid) return null;

        return {
          id: '1',
          name: 'Admin',
          email: ADMIN_EMAIL,
          role: 'admin',
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-secret-change-in-production',
};
