import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import PrintButton from "./PrintButton";

const DURATION_LABELS: Record<string, string> = {
  "24h": "24 heures",
  "3j": "3 jours",
  "7j": "1 semaine"
};

export default async function ArchivePrintPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.ARCHIVES_VIEW)) redirect("/admin");

  const archive = await prisma.accountingArchive.findUnique({
    where: { id: params.id },
    include: {
      invoices: { orderBy: { createdAt: "asc" } },
      expenses: { orderBy: { createdAt: "asc" } }
    }
  });
  if (!archive) notFound();

  const fmt = (n: number) => `${n.toLocaleString("fr-FR")}$`;
  const closingDate = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(
    archive.createdAt
  );

  return (
    <div className="min-h-screen bg-white text-[#0b1420] print:bg-white">
      <div className="max-w-3xl mx-auto px-8 py-10 print:px-0 print:py-0">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <p className="text-sm text-gray-500">Aperçu du rapport — utilise le bouton pour l'imprimer ou l'enregistrer en PDF.</p>
          <PrintButton />
        </div>

        <div className="border-b-2 border-[#c9a24c] pb-4 mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-gray-500">ELITE PRESTIGE</p>
          <h1 className="text-2xl font-semibold tracking-wide uppercase mt-1">Rapport de comptabilité</h1>
          <p className="text-sm text-gray-500 mt-2">
            Clôturé le {closingDate} par {archive.closedByName}
          </p>
        </div>

        {/* 1. Résumé financier */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">
            1. Résumé financier
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <Row label="Chiffre d'affaires (factures)" value={fmt(archive.totalRevenue)} />
              <Row label="Nombre de factures" value={String(archive.invoiceCount)} />
              <Row label="Coût d'achat de la flotte" value={fmt(archive.totalPurchaseCost)} />
              <Row label="Coût des customisations" value={fmt(archive.totalCustomCost)} />
              <Row label="Dépenses diverses" value={fmt(archive.totalExpenses)} />
              <Row label={`Impôts (${archive.taxRatePercent}%)`} value={fmt(archive.taxAmount)} />
              <Row label="Résultat net" value={fmt(archive.netResult)} bold />
              <Row label="Solde bancaire avant clôture" value={fmt(archive.bankBalanceBefore)} />
              <Row label="Solde bancaire après clôture" value={fmt(archive.bankBalanceAfter)} bold />
            </tbody>
          </table>
        </section>

        {/* 2. Détail des factures */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">
            2. Détail des factures ({archive.invoices.length})
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Créée par</th>
                <th className="py-2 pr-2">Véhicule</th>
                <th className="py-2 pr-2">Client</th>
                <th className="py-2 pr-2">Durée</th>
                <th className="py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {archive.invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-100">
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(inv.createdAt)}
                  </td>
                  <td className="py-2 pr-2">{inv.createdByName}</td>
                  <td className="py-2 pr-2">{inv.vehicleName}</td>
                  <td className="py-2 pr-2">{inv.clientName || "—"}</td>
                  <td className="py-2 pr-2">{DURATION_LABELS[inv.duration] || inv.duration}</td>
                  <td className="py-2 text-right">{fmt(inv.amount)}</td>
                </tr>
              ))}
              {archive.invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">
                    Aucune facture sur cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* 3. Détail des dépenses */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide mb-4 border-b border-gray-200 pb-2">
            3. Détail des dépenses ({archive.expenses.length})
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Intitulé</th>
                <th className="py-2 pr-2">Note</th>
                <th className="py-2 pr-2">Ajouté par</th>
                <th className="py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {archive.expenses.map((e) => (
                <tr key={e.id} className="border-b border-gray-100">
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(e.createdAt)}
                  </td>
                  <td className="py-2 pr-2">{e.label}</td>
                  <td className="py-2 pr-2">{e.note || "—"}</td>
                  <td className="py-2 pr-2">{e.createdByName}</td>
                  <td className="py-2 text-right">{fmt(e.amount)}</td>
                </tr>
              ))}
              {archive.expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">
                    Aucune dépense sur cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <p className="text-[10px] text-gray-400 mt-12">
          Document généré automatiquement par ELITE PRESTIGE à des fins de transmission comptable interne.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr className="border-b border-gray-100">
      <td className={`py-2 ${bold ? "font-semibold" : "text-gray-600"}`}>{label}</td>
      <td className={`py-2 text-right ${bold ? "font-semibold" : ""}`}>{value}</td>
    </tr>
  );
}
