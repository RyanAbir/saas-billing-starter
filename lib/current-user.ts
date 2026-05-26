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

  const existing = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (existing) {
    return existing;
  }

  let clerkUser: Awaited<ReturnType<typeof currentUser>>;
  try {
    clerkUser = await currentUser();
  } catch (error) {
    throw new Error(
      `Unable to load Clerk profile for first-time user creation: ${
        error instanceof Error ? error.message : "Unknown Clerk error"
      }`,
    );
  }

  const email = getPreferredEmail(clerkUser);
  if (!email) {
    throw new Error("Signed-in Clerk user is missing a primary email address.");
  }

  const name = getPreferredName(clerkUser);

  return prisma.user.create({
    data: {
      clerkUserId: userId,
      email,
      name,
    },
  });
}
