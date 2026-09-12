"use server";

import { getSessionWithFreshPermissions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

async function requireAccountingEdit() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[] | undefined;
  if (!hasPermission(perms, PERMISSIONS.ACCOUNTING_EDIT)) {
    throw new Error("Action non autorisée : permission 'accounting.edit' requise.");
  }
  return session;
}

export async function updateBankBalance(formData: FormData) {
  await requireAccountingEdit();
  const bankBalance = Number(formData.get("bankBalance") || 0);
  await prisma.companyAccount.upsert({
    where: { id: "company" },
    update: { bankBalance },
    create: { id: "company", bankBalance }
  });
  revalidatePath("/admin/accounting");
  revalidatePath("/admin/dashboard");
}

export async function updateTaxRate(formData: FormData) {
  await requireAccountingEdit();
  const taxRatePercent = Number(formData.get("taxRatePercent") || 0);
  await prisma.companyAccount.upsert({
    where: { id: "company" },
    update: { taxRatePercent },
    create: { id: "company", taxRatePercent }
  });
  revalidatePath("/admin/accounting");
  revalidatePath("/admin/dashboard");
}

export async function createExpense(formData: FormData) {
  const session = await requireAccountingEdit();
  const label = String(formData.get("label") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const note = String(formData.get("note") || "").trim();
  if (!label || !amount) return;

  await prisma.expense.create({
    data: {
      label,
      amount,
      note: note || null,
      createdByName: session?.user?.name || "Inconnu"
    }
  });
  revalidatePath("/admin/accounting");
  revalidatePath("/admin/dashboard");
}

export async function deleteExpense(formData: FormData) {
  await requireAccountingEdit();
  const id = String(formData.get("id"));
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/admin/accounting");
  revalidatePath("/admin/dashboard");
}

export async function closeAccounting() {
  const session = await requireAccountingEdit();

  const [invoices, expenses, vehicles, account] = await Promise.all([
    prisma.invoice.findMany(),
    prisma.expense.findMany(),
    prisma.vehicle.findMany({ select: { purchasePrice: true, customPrice: true } }),
    prisma.companyAccount.findUnique({ where: { id: "company" } })
  ]);

  const totalRevenue = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPurchaseCost = vehicles.reduce((sum, v) => sum + (v.purchasePrice ?? 0), 0);
  const totalCustomCost = vehicles.reduce((sum, v) => sum + (v.customPrice ?? 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const taxRatePercent = account?.taxRatePercent ?? 0;
  const taxAmount = Math.round((totalRevenue * taxRatePercent) / 100);
  const netResult = totalRevenue - totalPurchaseCost - totalCustomCost - totalExpenses - taxAmount;
  const bankBalanceBefore = account?.bankBalance ?? 0;
  const bankBalanceAfter = bankBalanceBefore + netResult;

  await prisma.$transaction(async (tx) => {
    const archive = await tx.accountingArchive.create({
      data: {
        totalRevenue,
        totalPurchaseCost,
        totalCustomCost,
        totalExpenses,
        taxRatePercent,
        taxAmount,
        netResult,
        bankBalanceBefore,
        bankBalanceAfter,
        invoiceCount: invoices.length,
        closedByName: session?.user?.name || "Inconnu"
      }
    });

    if (invoices.length > 0) {
      await tx.archivedInvoice.createMany({
        data: invoices.map((inv) => ({
          archiveId: archive.id,
          vehicleName: inv.vehicleName,
          categoryLabel: inv.categoryLabel,
          vehicleUuid: inv.vehicleUuid,
          licensePlate: inv.licensePlate,
          duration: inv.duration,
          amount: inv.amount,
          clientName: inv.clientName,
          clientPhone: inv.clientPhone,
          createdByName: inv.createdByName,
          createdAt: inv.createdAt
        }))
      });
    }

    if (expenses.length > 0) {
      await tx.archivedExpense.createMany({
        data: expenses.map((e) => ({
          archiveId: archive.id,
          label: e.label,
          amount: e.amount,
          note: e.note,
          createdByName: e.createdByName,
          createdAt: e.createdAt
        }))
      });
    }

    await tx.invoice.deleteMany({});
    await tx.expense.deleteMany({});

    await tx.companyAccount.upsert({
      where: { id: "company" },
      update: { bankBalance: bankBalanceAfter },
      create: { id: "company", bankBalance: bankBalanceAfter, taxRatePercent }
    });
  });

  revalidatePath("/admin/accounting");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/archives");
}
