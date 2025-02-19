// app/api/auth/[...nextauth]/route.ts
import NextAuth, { User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: User & { id: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        const user = { id: "1", name: "Test User", email: "test@example.com" };
        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 2,
  },
  jwt: {
    maxAge: 2,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? '';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id ?? ''; // Provide default empty string if null/undefined
        session.user.email = token.email ?? session.user.email ?? ''; // Use existing email or empty string as fallback
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };