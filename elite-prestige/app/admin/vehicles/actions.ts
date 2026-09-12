"use server";

import { getSessionWithFreshPermissions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireEditPermission() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!hasPermission(perms, PERMISSIONS.VEHICLES_EDIT)) {
    throw new Error("Action non autorisée : permission 'vehicles.edit' requise.");
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  air: "Aérien",
  land: "Terrestre",
  sea: "Maritime"
};

function readVehicleForm(formData: FormData) {
  const priceRaw = formData.get("price");
  const price3dRaw = formData.get("price3d");
  const price7dRaw = formData.get("price7d");
  const purchasePriceRaw = formData.get("purchasePrice");
  const customPriceRaw = formData.get("customPrice");
  const subCategory = String(formData.get("subCategory") || "");
  const licensePlate = String(formData.get("licensePlate") || "").trim();
  const vehicleUuid = String(formData.get("vehicleUuid") || "").trim();
  return {
    name: String(formData.get("name") || ""),
    category: String(formData.get("category") || "air"),
    categoryLabel: String(formData.get("categoryLabel") || ""),
    subCategory: subCategory || null,
    model: String(formData.get("model") || ""),
    imageUrl: String(formData.get("imageUrl") || ""),
    imageUrl2: String(formData.get("imageUrl2") || "").trim() || null,
    imageUrl3: String(formData.get("imageUrl3") || "").trim() || null,
    imageUrl4: String(formData.get("imageUrl4") || "").trim() || null,
    imageAspect: String(formData.get("imageAspect") || "video"),
    price: priceRaw && priceRaw !== "" ? Number(priceRaw) : null,
    price3d: price3dRaw && price3dRaw !== "" ? Number(price3dRaw) : null,
    price7d: price7dRaw && price7dRaw !== "" ? Number(price7dRaw) : null,
    priceLabel: String(formData.get("priceLabel") || "Sur devis"),
    durationLabel: String(formData.get("durationLabel") || "24h"),
    description: String(formData.get("description") || ""),
    badgePromotion: formData.get("badgePromotion") === "on",
    badgeNew: formData.get("badgeNew") === "on",
    badgeTrending: formData.get("badgeTrending") === "on",
    licensePlate: licensePlate || null,
    vehicleUuid: vehicleUuid || null,
    purchasePrice: purchasePriceRaw && purchasePriceRaw !== "" ? Number(purchasePriceRaw) : null,
    customPrice: customPriceRaw && customPriceRaw !== "" ? Number(customPriceRaw) : null
  };
}

// Création rapide : seuls Nom / Catégorie / Sous-catégorie / Image / Format / Prix / Étiquettes sont demandés.
// Les champs comptables (achat, custom, plaque, UUID, tarifs 3j/7j) sont facultatifs ici et peuvent
// toujours être ajoutés ou modifiés ensuite depuis la page de modification du véhicule.
// Libellé catégorie et référence interne sont déduits automatiquement.
export async function createVehicleQuick(formData: FormData) {
  await requireEditPermission();
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "air");
  const subCategory = String(formData.get("subCategory") || "");
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imageAspect = String(formData.get("imageAspect") || "video");
  const priceRaw = formData.get("price");
  const price = priceRaw && priceRaw !== "" ? Number(priceRaw) : null;
  const price3dRaw = formData.get("price3d");
  const price7dRaw = formData.get("price7d");
  const purchasePriceRaw = formData.get("purchasePrice");
  const customPriceRaw = formData.get("customPrice");
  const licensePlate = String(formData.get("licensePlate") || "").trim();
  const vehicleUuid = String(formData.get("vehicleUuid") || "").trim();
  const durationLabel = "24h";

  await prisma.vehicle.create({
    data: {
      name,
      category,
      categoryLabel: CATEGORY_LABELS[category] || category,
      subCategory: subCategory || null,
      model: name.toUpperCase(),
      imageUrl,
      imageUrl2: String(formData.get("imageUrl2") || "").trim() || null,
      imageUrl3: String(formData.get("imageUrl3") || "").trim() || null,
      imageUrl4: String(formData.get("imageUrl4") || "").trim() || null,
      imageAspect,
      price,
      price3d: price3dRaw && price3dRaw !== "" ? Number(price3dRaw) : null,
      price7d: price7dRaw && price7dRaw !== "" ? Number(price7dRaw) : null,
      priceLabel: price !== null ? `${price.toLocaleString("fr-FR")}$ / ${durationLabel}` : "Sur devis",
      durationLabel,
      description: "",
      badgePromotion: formData.get("badgePromotion") === "on",
      badgeNew: formData.get("badgeNew") === "on",
      badgeTrending: formData.get("badgeTrending") === "on",
      licensePlate: licensePlate || null,
      vehicleUuid: vehicleUuid || null,
      purchasePrice: purchasePriceRaw && purchasePriceRaw !== "" ? Number(purchasePriceRaw) : null,
      customPrice: customPriceRaw && customPriceRaw !== "" ? Number(customPriceRaw) : null
    }
  });
  revalidatePath("/admin/vehicles");
  revalidatePath("/");
  redirect("/admin/vehicles?added=1");
}

export async function createVehicle(formData: FormData) {
  await requireEditPermission();
  await prisma.vehicle.create({ data: readVehicleForm(formData) });
  revalidatePath("/admin/vehicles");
  revalidatePath("/");
}

export async function updateVehicle(id: string, formData: FormData) {
  await requireEditPermission();
  await prisma.vehicle.update({ where: { id }, data: readVehicleForm(formData) });
  revalidatePath("/admin/vehicles");
  revalidatePath("/");
  redirect("/admin/vehicles");
}

export async function deleteVehicle(formData: FormData) {
  await requireEditPermission();
  const id = String(formData.get("id"));
  await prisma.vehicle.delete({ where: { id } });
  revalidatePath("/admin/vehicles");
  revalidatePath("/");
}
