"use server";

import { getSessionWithFreshPermissions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

async function requireYachtEdit() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!hasPermission(perms, PERMISSIONS.YACHT_EDIT)) {
    throw new Error("Action non autorisée : permission 'yacht.edit' requise.");
  }
}

function revalidateAll() {
  revalidatePath("/admin/yacht");
  revalidatePath("/");
}

/* ---------------- FORFAITS (Prix basique, Prix second, ...) ---------------- */

export async function createPackage(formData: FormData) {
  await requireYachtEdit();
  await prisma.yachtPackage.create({
    data: {
      label: String(formData.get("label") || ""),
      price: Number(formData.get("price") || 0),
      imageUrl: String(formData.get("imageUrl") || ""),
      sortOrder: Number(formData.get("sortOrder") || 0)
    }
  });
  revalidateAll();
}

export async function updatePackage(formData: FormData) {
  await requireYachtEdit();
  await prisma.yachtPackage.update({
    where: { id: String(formData.get("id")) },
    data: {
      label: String(formData.get("label") || ""),
      price: Number(formData.get("price") || 0),
      imageUrl: String(formData.get("imageUrl") || ""),
      sortOrder: Number(formData.get("sortOrder") || 0)
    }
  });
  revalidateAll();
}

export async function deletePackage(formData: FormData) {
  await requireYachtEdit();
  await prisma.yachtPackage.delete({ where: { id: String(formData.get("id")) } });
  revalidateAll();
}

export async function updatePackageStepOrder(formData: FormData) {
  await requireYachtEdit();
  const order = Number(formData.get("packageStepOrder"));
  await prisma.yachtSettings.upsert({
    where: { id: "yacht" },
    update: { packageStepOrder: Number.isFinite(order) ? order : -1 },
    create: { id: "yacht", packageStepOrder: Number.isFinite(order) ? order : -1 }
  });
  revalidateAll();
  revalidatePath("/yacht");
}

/* ---------------- CATÉGORIES D'OPTIONS (Couleur, Nom, Sous Nom, Drapeau, ...) ---------------- */

export async function createCategory(formData: FormData) {
  await requireYachtEdit();
  const key = String(formData.get("label") || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await prisma.yachtOptionCategory.create({
    data: {
      key: key || `option-${Date.now()}`,
      label: String(formData.get("label") || ""),
      description: String(formData.get("description") || "") || null,
      type: String(formData.get("type") || "choice"),
      multiple: formData.get("multiple") === "on",
      price: Number(formData.get("price") || 0),
      imageAspect: String(formData.get("imageAspect") || "video"),
      textPositionX: Number(formData.get("textPositionX") || 50),
      textPositionY: Number(formData.get("textPositionY") || 50),
      textFontFamily: String(formData.get("textFontFamily") || "") || null,
      textItalic: formData.get("textItalic") === "on",
      textFontSize: Number(formData.get("textFontSize") || 32),
      textColor: String(formData.get("textColor") || "#f3eee5"),
      sortOrder: Number(formData.get("sortOrder") || 0)
    }
  });
  revalidateAll();
}

export async function updateCategory(formData: FormData) {
  await requireYachtEdit();
  await prisma.yachtOptionCategory.update({
    where: { id: String(formData.get("id")) },
    data: {
      label: String(formData.get("label") || ""),
      description: String(formData.get("description") || "") || null,
      multiple: formData.get("multiple") === "on",
      price: Number(formData.get("price") || 0),
      imageAspect: String(formData.get("imageAspect") || "video"),
      textPositionX: Number(formData.get("textPositionX") || 50),
      textPositionY: Number(formData.get("textPositionY") || 50),
      textFontFamily: String(formData.get("textFontFamily") || "") || null,
      textItalic: formData.get("textItalic") === "on",
      textFontSize: Number(formData.get("textFontSize") || 32),
      textColor: String(formData.get("textColor") || "#f3eee5"),
      sortOrder: Number(formData.get("sortOrder") || 0)
    }
  });
  revalidateAll();
}

export async function deleteCategory(formData: FormData) {
  await requireYachtEdit();
  await prisma.yachtOptionCategory.delete({ where: { id: String(formData.get("id")) } });
  revalidateAll();
}

/* ---------------- CHOIX (les images/valeurs possibles dans une catégorie "choice") ---------------- */

export async function createChoice(formData: FormData) {
  await requireYachtEdit();
  const priceRaw = formData.get("price");
  await prisma.yachtOptionChoice.create({
    data: {
      categoryId: String(formData.get("categoryId")),
      label: String(formData.get("label") || ""),
      imageUrl: String(formData.get("imageUrl") || "") || null,
      price: priceRaw && priceRaw !== "" ? Number(priceRaw) : null,
      sortOrder: Number(formData.get("sortOrder") || 0)
    }
  });
  revalidateAll();
}

export async function updateChoice(formData: FormData) {
  await requireYachtEdit();
  const priceRaw = formData.get("price");
  await prisma.yachtOptionChoice.update({
    where: { id: String(formData.get("id")) },
    data: {
      label: String(formData.get("label") || ""),
      imageUrl: String(formData.get("imageUrl") || "") || null,
      price: priceRaw && priceRaw !== "" ? Number(priceRaw) : null
    }
  });
  revalidateAll();
}

export async function deleteChoice(formData: FormData) {
  await requireYachtEdit();
  await prisma.yachtOptionChoice.delete({ where: { id: String(formData.get("id")) } });
  revalidateAll();
}

/* ---------------- PHOTO DE PRÉSENTATION (page d'accueil + haut de page Yacht) ---------------- */

export async function updatePresentationImage(formData: FormData) {
  await requireYachtEdit();
  const data = {
    presentationImageUrl: String(formData.get("presentationImageUrl") || ""),
    presentationImageUrl2: String(formData.get("presentationImageUrl2") || "")
  };
  await prisma.yachtSettings.upsert({
    where: { id: "yacht" },
    update: data,
    create: { id: "yacht", ...data }
  });
  revalidateAll();
  revalidatePath("/yacht");
}

export async function updateTextBackgroundImage(formData: FormData) {
  await requireYachtEdit();
  await prisma.yachtSettings.upsert({
    where: { id: "yacht" },
    update: {
      textBackgroundImageUrl: String(formData.get("textBackgroundImageUrl") || ""),
      textBackgroundAspect: String(formData.get("textBackgroundAspect") || "video")
    },
    create: {
      id: "yacht",
      textBackgroundImageUrl: String(formData.get("textBackgroundImageUrl") || ""),
      textBackgroundAspect: String(formData.get("textBackgroundAspect") || "video")
    }
  });
  revalidateAll();
  revalidatePath("/yacht");
}

/* ---------------- GALERIE (page Yacht) ---------------- */

export async function createGalleryImage(formData: FormData) {
  await requireYachtEdit();
  await prisma.yachtGalleryImage.create({
    data: {
      imageUrl: String(formData.get("imageUrl") || ""),
      caption: String(formData.get("caption") || "") || null,
      sortOrder: Number(formData.get("sortOrder") || 0)
    }
  });
  revalidateAll();
  revalidatePath("/yacht");
}

export async function deleteGalleryImage(formData: FormData) {
  await requireYachtEdit();
  await prisma.yachtGalleryImage.delete({ where: { id: String(formData.get("id")) } });
  revalidateAll();
  revalidatePath("/yacht");
}
