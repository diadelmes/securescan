import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  // -------------------------
  // Providers
  // -------------------------
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // TODO: Replace with your actual DB user lookup
        // Example:
        // const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        // if (!user || !await bcrypt.compare(parsed.data.password, user.passwordHash)) return null;
        // return user;

        // Mock user for development
        if (parsed.data.email === "admin@example.com" && parsed.data.password === "password123") {
          return {
            id: "1",
            email: "admin@example.com",
            name: "Admin User",
            image: null,
          };
        }

        return null;
      },
    }),
  ],

  // -------------------------
  // Session
  // -------------------------
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // -------------------------
  // Pages
  // -------------------------
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // -------------------------
  // Callbacks
  // -------------------------
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // -------------------------
  // Events (optional hooks)
  // -------------------------
  events: {
    async signIn({ user }) {
      // Example: log sign-in events
      console.warn(`User signed in: ${user.email}`);
    },
  },

  debug: process.env.NODE_ENV === "development",
};
