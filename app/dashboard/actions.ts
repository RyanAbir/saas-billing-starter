"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateCurrentDbUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { FREE_PROJECT_LIMIT, hasProAccess } from "@/lib/subscription-access";

function toDashboardWithMessage(message: string): never {
  redirect(`/dashboard?message=${encodeURIComponent(message)}`);
}

export async function createProjectAction(formData: FormData) {
  const dbUser = await getOrCreateCurrentDbUser();
  if (!dbUser) {
    toDashboardWithMessage("Please sign in to create projects.");
  }

  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";

  if (!title) {
    toDashboardWithMessage("Project title is required.");
  }

  const projectCount = await prisma.project.count({
    where: { userId: dbUser.id },
  });

  if (!hasProAccess(dbUser) && projectCount >= FREE_PROJECT_LIMIT) {
    toDashboardWithMessage("Free plan limit reached. Upgrade to Pro for unlimited projects.");
  }

  await prisma.project.create({
    data: {
      userId: dbUser.id,
      title,
    },
  });

  revalidatePath("/dashboard");
}

export async function deleteProjectAction(formData: FormData) {
  const dbUser = await getOrCreateCurrentDbUser();
  if (!dbUser) {
    toDashboardWithMessage("Please sign in to manage projects.");
  }

  const rawProjectId = formData.get("projectId");
  const projectId = typeof rawProjectId === "string" ? rawProjectId : "";

  if (!projectId) {
    toDashboardWithMessage("Project ID is missing.");
  }

  await prisma.project.deleteMany({
    where: {
      id: projectId,
      userId: dbUser.id,
    },
  });

  revalidatePath("/dashboard");
}
