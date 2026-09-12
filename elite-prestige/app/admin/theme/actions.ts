"use server";

import { getSessionWithFreshPermissions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

async function requireThemeEdit() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!hasPermission(perms, PERMISSIONS.THEME_EDIT)) {
    throw new Error("Action non autorisée : permission 'theme.edit' requise.");
  }
}

export async function updateSiteTheme(formData: FormData) {
  await requireThemeEdit();

  const data = {
    bg: String(formData.get("bg") || "#02121F"),
    card: String(formData.get("card") || "#0a2a4a"),
    gold: String(formData.get("gold") || "#c9a24c"),
    goldlight: String(formData.get("goldlight") || "#e7d19a"),
    cream: String(formData.get("cream") || "#f3eee5"),
    gray1: String(formData.get("gray1") || "#949399"),
    gray2: String(formData.get("gray2") || "#5f5f65")
  };

  await prisma.siteTheme.upsert({
    where: { id: "site" },
    update: data,
    create: { id: "site", ...data }
  });

  // Le thème est lu dans le layout racine : on revalide toutes les pages.
  revalidatePath("/", "layout");
}

export async function resetSiteTheme() {
  await requireThemeEdit();
  const defaults = {
    bg: "#02121F",
    card: "#0a2a4a",
    gold: "#c9a24c",
    goldlight: "#e7d19a",
    cream: "#f3eee5",
    gray1: "#949399",
    gray2: "#5f5f65",
    effect: "none"
  };
  await prisma.siteTheme.upsert({
    where: { id: "site" },
    update: defaults,
    create: { id: "site", ...defaults }
  });
  revalidatePath("/", "layout");
}

export async function updateThemeEffect(formData: FormData) {
  await requireThemeEdit();
  const effect = String(formData.get("effect") || "none");
  await prisma.siteTheme.upsert({
    where: { id: "site" },
    update: { effect },
    create: { id: "site", effect }
  });
  revalidatePath("/", "layout");
}
