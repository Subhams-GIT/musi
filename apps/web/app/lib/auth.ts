import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import prisma from "@repo/db";
import { randomUUID } from "crypto";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",          
    maxAge: 60 * 60 * 24 * 30, 
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {

      if (user) {
        token.uid = user.id;          
        token.sessionId = randomUUID();
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.uid as string;
      return session;
    },
    async signIn({ profile, user }) {
      if (!profile?.email) return false;
      const existingUser = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingUser) {
        user.id = existingUser.id;
        return true;
      }

      const newUser = await prisma.user.create({
        data: {
          email: profile.email,
          provider: "Google",
          role: "Streamer",
          name: profile.name ?? "Guest",
        },
      });
      user.id = newUser.id;
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
