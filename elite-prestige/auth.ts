import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Identifiant" },
        password: { label: "Mot de passe", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
          include: { role: true }
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.username,
          role: user.role.name,
          permissions: user.role.permissions,
          mustChangePassword: user.mustChangePassword
        } as any;
      }
    })
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      if (isAdminRoute && !isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.role = u.role;
        token.permissions = u.permissions;
        token.mustChangePassword = u.mustChangePassword;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).mustChangePassword = token.mustChangePassword;
      }
      return session;
    }
  }
});