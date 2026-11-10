import { prisma } from "@/lib/prisma";

const LOCAL_EMAIL = "local@notestack.invalid";

function isUniqueConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

async function localUserId(): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { email: LOCAL_EMAIL },
    select: { id: true },
  });
  if (existing) return existing.id;

  try {
    const created = await prisma.user.create({
      data: { email: LOCAL_EMAIL, name: "Local" },
      select: { id: true },
    });
    return created.id;
  } catch (error) {
    if (!isUniqueConflict(error)) throw error;
    const again = await prisma.user.findUnique({
      where: { email: LOCAL_EMAIL },
      select: { id: true },
    });
    if (!again) throw error;
    return again.id;
  }
}

export async function ownerId(): Promise<string | null> {
  return localUserId();
}
