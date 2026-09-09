"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

async function requireRolesManage() {
  const session = await auth();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!hasPermission(perms, PERMISSIONS.ROLES_MANAGE)) {
    throw new Error("Action non autorisée : permission 'roles.manage' requise.");
  }
}

export async function createRole(formData: FormData) {
  await requireRolesManage();
  const name = String(formData.get("name") || "").trim();
  const permissions = formData.getAll("permissions").map(String);

  if (!name) throw new Error("Le nom du rôle est obligatoire.");

  await prisma.role.create({ data: { name, permissions, isSystem: false } });
  revalidatePath("/admin/roles");
}

export async function updateRolePermissions(formData: FormData) {
  await requireRolesManage();
  const id = String(formData.get("id"));
  const permissions = formData.getAll("permissions").map(String);
  await prisma.role.update({ where: { id }, data: { permissions } });
  revalidatePath("/admin/roles");
}

export async function deleteRole(formData: FormData) {
  await requireRolesManage();
  const id = String(formData.get("id"));

  const role = await prisma.role.findUnique({ where: { id }, include: { users: true } });
  if (!role) return;
  if (role.isSystem) throw new Error("Ce rôle système ne peut pas être supprimé.");
  if (role.users.length > 0) {
    throw new Error("Réattribue d'abord les comptes de ce rôle avant de le supprimer.");
  }

  await prisma.role.delete({ where: { id } });
  revalidatePath("/admin/roles");
}
