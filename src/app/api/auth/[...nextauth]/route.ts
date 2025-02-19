// app/api/auth/[...nextauth]/route.ts
import NextAuth, { User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: User & { id: string };
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
        // Replace with your custom authentication logic
        // Example authentication, replace with actual logic
        const user = { id: "1", name: "Test User", email: "test@example.com" }; // id is now a string

        if (user) {
          return user; // return user object on successful authentication
        } else {
          return null; // return null if authentication fails
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT for session management
    maxAge: 60 * 60,  // Session expiration (1 hour)
  },
  jwt: {
    maxAge: 60 * 60, // JWT expiration (1 hour)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
      // eslint-disable-next-line no-var, no-unused-vars
    async session({ session, token }: { session: Session; token: any }) {
      if (session.user) {
        session.user.id = token.id;
      }
      if (session.user) {
        session.user.email = token.email;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
