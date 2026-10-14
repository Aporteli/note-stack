import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function ownerId() {
  const session = await auth();
  const email = session?.user?.email;
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (user) return user.id;
  }

  const existing = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: { email: "demo@example.com", name: "Demo User" },
    select: { id: true },
  });
  return created.id;
}
