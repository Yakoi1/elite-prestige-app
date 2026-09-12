"use server";

import { getSessionWithFreshPermissions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

async function requireManage() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!hasPermission(perms, PERMISSIONS.ARCHIVES_MANAGE)) {
    throw new Error("Action non autorisée : permission 'archives.manage' requise.");
  }
}

export async function deleteClient(formData: FormData) {
  await requireManage();
  const id = String(formData.get("id"));
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin/archives");
}

export async function deleteArchive(formData: FormData) {
  await requireManage();
  const id = String(formData.get("id"));
  await prisma.accountingArchive.delete({ where: { id } });
  revalidatePath("/admin/archives");
}
