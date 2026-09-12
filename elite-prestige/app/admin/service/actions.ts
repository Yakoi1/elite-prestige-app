"use server";

import { getSessionWithFreshPermissions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

async function requireServiceUse() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!hasPermission(perms, PERMISSIONS.SERVICE_USE)) {
    throw new Error("Action non autorisée : permission 'service.use' requise.");
  }
  return session;
}

export async function startShift() {
  const session = await requireServiceUse();
  const userId = (session?.user as any).id as string;

  const active = await prisma.shiftLog.findFirst({ where: { userId, endedAt: null } });
  if (active) return; // déjà en service

  await prisma.shiftLog.create({
    data: { userId, userName: session?.user?.name || "Inconnu" }
  });

  revalidatePath("/admin/service");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/profile");
}

export async function endShift() {
  const session = await requireServiceUse();
  const userId = (session?.user as any).id as string;

  const active = await prisma.shiftLog.findFirst({ where: { userId, endedAt: null } });
  if (!active) return;

  await prisma.shiftLog.update({
    where: { id: active.id },
    data: { endedAt: new Date() }
  });

  revalidatePath("/admin/service");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/profile");
}
