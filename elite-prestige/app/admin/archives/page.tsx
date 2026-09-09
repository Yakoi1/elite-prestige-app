import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import ArchivesTabs from "./ArchivesTabs";
import { deleteClient, deleteArchive } from "./actions";
import DownloadArchivePdf from "./DownloadArchivePdf";

export const dynamic = "force-dynamic";

export default async function ArchivesPage() {
  const session = await auth();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.ARCHIVES_VIEW)) redirect("/admin");
  const canManage = hasPermission(perms, PERMISSIONS.ARCHIVES_MANAGE);

  const [archives, clients] = await Promise.all([
    prisma.accountingArchive.findMany({
      orderBy: { createdAt: "desc" },
      include: { invoices: true, expenses: true }
    }),
    prisma.client.findMany({ orderBy: { updatedAt: "desc" } })
  ]);

  const accountingView = (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left font-jost text-xs tracking-[0.1em] uppercase text-gray1">
            <th className="p-4">Date de clôture</th>
            <th className="p-4">Clôturée par</th>
            <th className="p-4">Factures</th>
            <th className="p-4">CA</th>
            <th className="p-4">Impôts</th>
            <th className="p-4">Résultat net</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {archives.map((a) => (
            <tr key={a.id} className="border-b border-white/5">
              <td className="p-4 text-gray1 whitespace-nowrap">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(a.createdAt)}
              </td>
              <td className="p-4">{a.closedByName}</td>
              <td className="p-4 text-gray1">{a.invoiceCount}</td>
              <td className="p-4 text-gray1">{a.totalRevenue.toLocaleString("fr-FR")}$</td>
              <td className="p-4 text-gray1">{a.taxAmount.toLocaleString("fr-FR")}$</td>
              <td className={`p-4 ${a.netResult >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {a.netResult.toLocaleString("fr-FR")}$
              </td>
              <td className="p-4">
                <div className="flex gap-4">
                  <DownloadArchivePdf
                    archive={{
                      id: a.id,
                      createdAt: a.createdAt.toISOString(),
                      closedByName: a.closedByName,
                      totalRevenue: a.totalRevenue,
                      invoiceCount: a.invoiceCount,
                      totalPurchaseCost: a.totalPurchaseCost,
                      totalCustomCost: a.totalCustomCost,
                      totalExpenses: a.totalExpenses,
                      taxRatePercent: a.taxRatePercent,
                      taxAmount: a.taxAmount,
                      netResult: a.netResult,
                      bankBalanceBefore: a.bankBalanceBefore,
                      bankBalanceAfter: a.bankBalanceAfter,
                      invoices: a.invoices.map((inv) => ({
                        createdAt: inv.createdAt.toISOString(),
                        createdByName: inv.createdByName,
                        vehicleName: inv.vehicleName,
                        clientName: inv.clientName,
                        duration: inv.duration,
                        amount: inv.amount
                      })),
                      expenses: a.expenses.map((e) => ({
                        createdAt: e.createdAt.toISOString(),
                        label: e.label,
                        note: e.note,
                        createdByName: e.createdByName,
                        amount: e.amount
                      }))
                    }}
                  />
                  {canManage && (
                    <form action={deleteArchive}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="text-gray1 hover:text-red-400 transition text-xs">Supprimer</button>
                    </form>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {archives.length === 0 && (
            <tr>
              <td colSpan={7} className="p-6 text-center text-gray2">
                Aucune comptabilité clôturée pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const clientsView = (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left font-jost text-xs tracking-[0.1em] uppercase text-gray1">
            <th className="p-4">Nom</th>
            <th className="p-4">Téléphone</th>
            <th className="p-4">Permis</th>
            <th className="p-4">Dernière activité</th>
            {canManage && <th className="p-4">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-b border-white/5">
              <td className="p-4">{c.name}</td>
              <td className="p-4 text-gray1">{c.phone}</td>
              <td className="p-4">
                {c.driverLicenseImage ? (
                  <a href={c.driverLicenseImage} target="_blank" rel="noreferrer">
                    <img src={c.driverLicenseImage} alt="Permis" className="h-10 border border-white/10" />
                  </a>
                ) : (
                  <span className="text-gray2">—</span>
                )}
              </td>
              <td className="p-4 text-gray1 whitespace-nowrap">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(c.updatedAt)}
              </td>
              {canManage && (
                <td className="p-4">
                  <form action={deleteClient}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-gray1 hover:text-red-400 transition text-xs">Supprimer</button>
                  </form>
                </td>
              )}
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan={canManage ? 5 : 4} className="p-6 text-center text-gray2">
                Aucun client enregistré pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h1 className="font-jost text-2xl tracking-[0.1em] uppercase mb-8">Archives</h1>
      <ArchivesTabs accounting={accountingView} clients={clientsView} />
    </div>
  );
}
