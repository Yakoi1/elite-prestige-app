"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function requireUsersManage() {
  const session = await auth();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!hasPermission(perms, PERMISSIONS.USERS_MANAGE)) {
    throw new Error("Action non autorisée : permission 'users.manage' requise.");
  }
  return session;
}

export async function createUser(formData: FormData) {
  await requireUsersManage();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const roleId = String(formData.get("roleId") || "");

  if (!username || !password || !roleId) {
    throw new Error("Identifiant, mot de passe et rôle sont obligatoires.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { username, passwordHash, roleId, mustChangePassword: true }
  });

  revalidatePath("/admin/users");
}

export async function updateUserRole(formData: FormData) {
  await requireUsersManage();
  const id = String(formData.get("id"));
  const roleId = String(formData.get("roleId"));
  await prisma.user.update({ where: { id }, data: { roleId } });
  revalidatePath("/admin/users");
}

export async function resetUserPassword(formData: FormData) {
  await requireUsersManage();
  const id = String(formData.get("id"));
  const newPassword = String(formData.get("newPassword") || "");
  if (newPassword.length < 6) {
    throw new Error("Le mot de passe temporaire doit faire au moins 6 caractères.");
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { passwordHash, mustChangePassword: true }
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const session = await requireUsersManage();
  const id = String(formData.get("id"));
  if (id === (session?.user as any)?.id) {
    throw new Error("Tu ne peux pas supprimer ton propre compte.");
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
