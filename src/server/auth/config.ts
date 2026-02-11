import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { GoogleProfile } from "@/interface/GoogleProfile";
import { db } from "@/server/db";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations/auth";
import { type DefaultJWT } from "next-auth/jwt";

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
      phoneNumber?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    phone_number?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    phoneNumber?: string | null;
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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
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
                  phone_number: googleProfile.sub, // using sub as phone number placeholder if needed? or maybe just updating verified phone if available.
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
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id!;
        token.role = user.role ?? "USER";
        token.phoneNumber = user.phone_number;
      }

      // If updating the session (e.g. changing role), we can handle that here
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phoneNumber = token.phoneNumber;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
} satisfies NextAuthConfig;
