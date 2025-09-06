import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@repo/db";


const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    // Persist user id and token in JWT
    async jwt({ token, user, account }) {
      if (user) {
        console.log(user);
        token.id = user.id;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    // Make the id and token available in the session
    async session({ session, token, user }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.token = token.accessToken as string;
      }
      return session;
    },

    // Handle user sign-in and creation
    async signIn({ account, profile, user }) {
      if (!profile?.email) return false;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (existingUser) {
          user.id = existingUser.id;
          return true;
        }

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: profile.email,
              provider: "Google", // or Provider.Google if it's an enum
              role: "Streamer",
              name: profile.name ?? "Guest",
            },
          });
          user.id = newUser.id;
        }
      } catch (error) {
        console.error("SignIn Error:", error);
        return false;
      }

      return true;
    },

  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
