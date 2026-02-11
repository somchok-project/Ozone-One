import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { GoogleProfile } from "@/interface/GoogleProfile";
import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile: (profile: GoogleProfile) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "USER", // Default role for new users
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      if (account?.provider === "google" && profile) {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          // Check if specific fields are null/missing and update them
          if (existingUser) {
            const googleProfile = profile as unknown as GoogleProfile;
            const needsUpdate = !existingUser.name || !existingUser.image;

            if (needsUpdate) {
              await db.user.update({
                where: { id: existingUser.id },
                data: {
                  name: googleProfile.name,
                  image: googleProfile.picture,
                  emailVerified: new Date(),
                  phone_number: googleProfile.sub,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error updating user profile:", error);
        }
      }
      return true;
    },
    session: async ({ session, user }) => {
      // Fetch the actual role from DB since PrismaAdapter doesn't include custom fields
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: dbUser?.role ?? "USER",
        },
      };
    },
  },
  pages: {
    signIn: "/auth/login",
  },
} satisfies NextAuthConfig;
