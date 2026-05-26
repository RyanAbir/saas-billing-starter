import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function getPreferredEmail(user: Awaited<ReturnType<typeof currentUser>>): string | null {
  return user?.primaryEmailAddress?.emailAddress ?? null;
}

function getPreferredName(user: Awaited<ReturnType<typeof currentUser>>): string | null {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return fullName || user?.username || null;
}

export async function getOrCreateCurrentDbUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  const email = getPreferredEmail(clerkUser);
  if (!email) {
    throw new Error("Signed-in Clerk user is missing a primary email address.");
  }

  const name = getPreferredName(clerkUser);

  const existing = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (existing) {
    if (existing.email !== email || existing.name !== name) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          email,
          name,
        },
      });
    }

    return existing;
  }

  return prisma.user.create({
    data: {
      clerkUserId: userId,
      email,
      name,
    },
  });
}
