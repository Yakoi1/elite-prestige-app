import { getSessionWithFreshPermissions } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import Link from "next/link";
import InvoiceModal from "./InvoiceModal";
import PageSizeSelect from "./PageSizeSelect";
import { deleteInvoice } from "./actions";

const DURATION_LABELS: Record<string, string> = {
  "24h": "24 heures",
  "3j": "3 jours",
  "7j": "1 semaine"
};

const VALID_PAGE_SIZES = [15, 30, 50, 100];

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: { page?: string; pageSize?: string };
}) {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.INVOICES_VIEW)) redirect("/admin");
  const canCreate = hasPermission(perms, PERMISSIONS.INVOICES_CREATE);
  const canDelete = hasPermission(perms, PERMISSIONS.INVOICES_DELETE);

  const pageSize = VALID_PAGE_SIZES.includes(Number(searchParams.pageSize)) ? Number(searchParams.pageSize) : 15;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [total, invoices, vehicles] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    canCreate
      ? prisma.vehicle.findMany({
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            categoryLabel: true,
            licensePlate: true,
            vehicleUuid: true,
            price: true,
            price3d: true,
            price7d: true
          }
        })
      : Promise.resolve([])
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-jost text-2xl tracking-[0.1em] uppercase">Factures</h1>
        {canCreate && <InvoiceModal vehicles={vehicles} />}
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="text-sm text-gray1">
          {total} facture{total > 1 ? "s" : ""} au total
        </p>
        <div className="flex items-center gap-2">
          <span className="font-jost text-xs uppercase tracking-[0.1em] text-gray2">Afficher</span>
          <PageSizeSelect current={pageSize} />
        </div>
      </div>

      <div className="overflow-x-auto border border-white/10 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray1">
              <th className="p-4">Date</th>
              <th className="p-4">Créée par</th>
              <th className="p-4">Modèle</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">UUID</th>
              <th className="p-4">Plaque</th>
              <th className="p-4">Client</th>
              <th className="p-4">Durée</th>
              <th className="p-4">Montant</th>
              {canDelete && <th className="p-4">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-white/5">
                <td className="p-4 text-gray1 whitespace-nowrap">
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(inv.createdAt)}
                </td>
                <td className="p-4">{inv.createdByName}</td>
                <td className="p-4">{inv.vehicleName}</td>
                <td className="p-4 text-gray1">{inv.categoryLabel}</td>
                <td className="p-4 text-gray1">{inv.vehicleUuid || "—"}</td>
                <td className="p-4 text-gray1">{inv.licensePlate || "—"}</td>
                <td className="p-4 text-gray1">{inv.clientName || "—"}</td>
                <td className="p-4 text-gray1">{DURATION_LABELS[inv.duration] || inv.duration}</td>
                <td className="p-4 text-goldlight">{inv.amount.toLocaleString("fr-FR")}$</td>
                {canDelete && (
                  <td className="p-4">
                    <form action={deleteInvoice}>
                      <input type="hidden" name="id" value={inv.id} />
                      <button className="text-gray1 hover:text-red-400 transition text-xs">Supprimer</button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={canDelete ? 10 : 9} className="p-6 text-center text-gray2">
                  Aucune facture pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between font-jost text-xs uppercase tracking-[0.1em]">
          {page > 1 ? (
            <Link href={`?page=${page - 1}&pageSize=${pageSize}`} className="text-gray1 hover:text-goldlight transition">
              ← Précédent
            </Link>
          ) : (
            <span />
          )}
          <span className="text-gray2">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`?page=${page + 1}&pageSize=${pageSize}`} className="text-gray1 hover:text-goldlight transition">
              Suivant →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
