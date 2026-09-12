"use server";

import { getSessionWithFreshPermissions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

async function requireCreatePermission() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!hasPermission(perms, PERMISSIONS.INVOICES_CREATE)) {
    throw new Error("Action non autorisée : permission 'invoices.create' requise.");
  }
  return session;
}

async function requireDeletePermission() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!hasPermission(perms, PERMISSIONS.INVOICES_DELETE)) {
    throw new Error("Action non autorisée : permission 'invoices.delete' requise.");
  }
}

export async function searchClients(query: string) {
  await requireCreatePermission();
  const q = query.trim();
  if (!q) return [];
  return prisma.client.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: { id: true, name: true, phone: true }
  });
}

export async function createInvoice(formData: FormData) {
  const session = await requireCreatePermission();

  const vehicleId = String(formData.get("vehicleId") || "");
  const duration = String(formData.get("duration") || "24h");
  const clientName = String(formData.get("clientName") || "").trim();
  const clientPhone = String(formData.get("clientPhone") || "").trim();
  const driverLicenseImage = String(formData.get("driverLicenseImage") || "").trim();

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new Error("Véhicule introuvable.");

  const amount = duration === "3j" ? vehicle.price3d : duration === "7j" ? vehicle.price7d : vehicle.price;
  if (amount == null) {
    throw new Error("Aucun tarif n'est défini pour cette durée sur ce véhicule.");
  }

  // Client : même nom + même téléphone => même fiche (mise à jour du permis si fourni).
  // Même nom mais téléphone différent => nouvelle fiche distincte.
  let clientId: string | null = null;
  if (clientName && clientPhone) {
    const existing = await prisma.client.findUnique({
      where: { name_phone: { name: clientName, phone: clientPhone } }
    });
    if (existing) {
      const updated = await prisma.client.update({
        where: { id: existing.id },
        data: driverLicenseImage ? { driverLicenseImage } : {}
      });
      clientId = updated.id;
    } else {
      const created = await prisma.client.create({
        data: { name: clientName, phone: clientPhone, driverLicenseImage: driverLicenseImage || null }
      });
      clientId = created.id;
    }
  }

  await prisma.invoice.create({
    data: {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      categoryLabel: vehicle.categoryLabel,
      vehicleUuid: vehicle.vehicleUuid,
      licensePlate: vehicle.licensePlate,
      duration,
      amount,
      clientId,
      clientName: clientName || null,
      clientPhone: clientPhone || null,
      createdById: (session?.user as any)?.id ?? null,
      createdByName: session?.user?.name || "Inconnu"
    }
  });

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/archives");
}

export async function deleteInvoice(formData: FormData) {
  await requireDeletePermission();
  const id = String(formData.get("id"));
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/dashboard");
}
