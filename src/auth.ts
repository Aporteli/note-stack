import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email) return false;

      const named = user.name ?? null;
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existing) {
        if (named) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { name: named },
          });
        }
        return true;
      }

      const total = await prisma.user.count();
      const demo = await prisma.user.findUnique({
        where: { email: "demo@example.com" },
        select: { id: true, name: true },
      });
      if (demo && total === 1) {
        await prisma.user.update({
          where: { id: demo.id },
          data: { email, name: named ?? demo.name },
        });
        return true;
      }

      await prisma.user.create({
        data: { email, name: named },
      });
      return true;
    },
  },
});
