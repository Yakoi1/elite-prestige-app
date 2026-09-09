import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { updateBankBalance, updateTaxRate, createExpense, deleteExpense } from "./actions";
import CloseAccountingButton from "./CloseAccountingButton";

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
  const session = await auth();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.ACCOUNTING_VIEW)) redirect("/admin");
  const canEdit = hasPermission(perms, PERMISSIONS.ACCOUNTING_EDIT);

  const [vehicles, account, expenses, invoices] = await Promise.all([
    prisma.vehicle.findMany({
      where: { OR: [{ purchasePrice: { not: null } }, { customPrice: { not: null } }] },
      orderBy: { name: "asc" }
    }),
    prisma.companyAccount.findUnique({ where: { id: "company" } }),
    prisma.expense.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.invoice.findMany({ select: { amount: true } })
  ]);

  const totalPurchase = vehicles.reduce((sum, v) => sum + (v.purchasePrice ?? 0), 0);
  const totalCustom = vehicles.reduce((sum, v) => sum + (v.customPrice ?? 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = invoices.reduce((sum, i) => sum + i.amount, 0);
  const bankBalance = account?.bankBalance ?? 0;
  const taxRatePercent = account?.taxRatePercent ?? 0;
  const taxAmount = Math.round((totalRevenue * taxRatePercent) / 100);
  const netResult = totalRevenue - totalPurchase - totalCustom - totalExpenses - taxAmount;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-jost text-2xl tracking-[0.1em] uppercase">Comptabilité</h1>
        {!canEdit && (
          <span className="font-jost text-sm tracking-[0.1em] uppercase text-gray2 border border-white/10 px-3 py-1.5">
            Lecture seule
          </span>
        )}
      </div>

      {/* Vue d'ensemble */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Chiffre d'affaires (factures)" value={totalRevenue} />
        <SummaryCard label="Prix d'achat flotte" value={totalPurchase} />
        <SummaryCard label="Prix custom flotte" value={totalCustom} />
        <SummaryCard label="Dépenses diverses" value={totalExpenses} />
        <SummaryCard label={`Impôts estimés (${taxRatePercent}%)`} value={taxAmount} />
        <SummaryCard
          label="Résultat net estimé"
          value={netResult}
          className={netResult >= 0 ? "text-emerald-400" : "text-red-400"}
        />
      </div>

      {/* Impôts */}
      <section className="mb-12">
        <p className="font-jost text-lg tracking-[0.06em] uppercase mb-2">Impôts sur le chiffre d'affaires</p>
        <p className="text-sm text-gray1 mb-5">
          Le taux change régulièrement — mets-le à jour ici. L'impôt est recalculé en temps réel sur le chiffre
          d'affaires actuel, et figé dans l'archive à chaque clôture.
        </p>
        <div className="border border-white/10 bg-card p-6 flex items-center gap-6 flex-wrap">
          <p className="font-jost text-3xl text-goldlight">{taxRatePercent}%</p>
          <p className="text-sm text-gray1">
            soit <span className="text-goldlight">{taxAmount.toLocaleString("fr-FR")}$</span> sur le chiffre
            d'affaires actuel
          </p>
          {canEdit && (
            <form action={updateTaxRate} className="flex items-end gap-3 ml-auto">
              <div className="flex flex-col gap-2">
                <label className="font-jost text-xs tracking-[0.1em] uppercase text-gray1">Taux (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="taxRatePercent"
                  defaultValue={taxRatePercent}
                  className="bg-bg border border-white/10 px-4 py-2.5 text-sm w-32"
                />
              </div>
              <button className="bg-gold text-bg px-5 py-2.5 font-jost text-xs tracking-[0.15em] uppercase hover:bg-goldlight transition">
                Mettre à jour
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Solde bancaire */}
      <section className="mb-12">
        <p className="font-jost text-lg tracking-[0.06em] uppercase mb-2">Compte bancaire de l'entreprise</p>
        <p className="text-sm text-gray1 mb-5">Le solde actuel disponible pour l'entreprise.</p>
        <div className="border border-white/10 bg-card p-6 flex items-center gap-6 flex-wrap">
          <p className="font-jost text-3xl text-goldlight">{bankBalance.toLocaleString("fr-FR")}$</p>
          {canEdit && (
            <form action={updateBankBalance} className="flex items-end gap-3 ml-auto">
              <div className="flex flex-col gap-2">
                <label className="font-jost text-xs tracking-[0.1em] uppercase text-gray1">Nouveau solde ($)</label>
                <input
                  type="number"
                  name="bankBalance"
                  defaultValue={bankBalance}
                  className="bg-bg border border-white/10 px-4 py-2.5 text-sm w-48"
                />
              </div>
              <button className="bg-gold text-bg px-5 py-2.5 font-jost text-xs tracking-[0.15em] uppercase hover:bg-goldlight transition">
                Mettre à jour
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Détail achats / custom par véhicule */}
      <section className="mb-12">
        <p className="font-jost text-lg tracking-[0.06em] uppercase mb-2">Prix d'achat & custom par véhicule</p>
        <p className="text-sm text-gray1 mb-5">
          Seuls les véhicules avec un prix d'achat ou custom renseigné apparaissent ici.
        </p>
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left font-jost text-xs tracking-[0.1em] uppercase text-gray1">
                <th className="p-4">Véhicule</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Prix d'achat</th>
                <th className="p-4">Prix custom</th>
                <th className="p-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-white/5">
                  <td className="p-4">{v.name}</td>
                  <td className="p-4 text-gray1">{v.categoryLabel}</td>
                  <td className="p-4 text-gray1">
                    {v.purchasePrice != null ? `${v.purchasePrice.toLocaleString("fr-FR")}$` : "—"}
                  </td>
                  <td className="p-4 text-gray1">
                    {v.customPrice != null ? `${v.customPrice.toLocaleString("fr-FR")}$` : "—"}
                  </td>
                  <td className="p-4 text-goldlight">
                    {((v.purchasePrice ?? 0) + (v.customPrice ?? 0)).toLocaleString("fr-FR")}$
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray2">
                    Aucun véhicule avec un prix d'achat renseigné pour l'instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dépenses diverses */}
      <section>
        <p className="font-jost text-lg tracking-[0.06em] uppercase mb-2">Dépenses & achats divers</p>
        <p className="text-sm text-gray1 mb-5">Tout ce qui n'est pas un achat de véhicule : loyers, matériel, etc.</p>

        <div className="overflow-x-auto border border-white/10 mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left font-jost text-xs tracking-[0.1em] uppercase text-gray1">
                <th className="p-4">Date</th>
                <th className="p-4">Intitulé</th>
                <th className="p-4">Note</th>
                <th className="p-4">Ajouté par</th>
                <th className="p-4">Montant</th>
                {canEdit && <th className="p-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-white/5">
                  <td className="p-4 text-gray1 whitespace-nowrap">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(e.createdAt)}
                  </td>
                  <td className="p-4">{e.label}</td>
                  <td className="p-4 text-gray1">{e.note || "—"}</td>
                  <td className="p-4 text-gray1">{e.createdByName}</td>
                  <td className="p-4 text-goldlight">{e.amount.toLocaleString("fr-FR")}$</td>
                  {canEdit && (
                    <td className="p-4">
                      <form action={deleteExpense}>
                        <input type="hidden" name="id" value={e.id} />
                        <button className="text-gray1 hover:text-red-400 transition text-xs">Supprimer</button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="p-6 text-center text-gray2">
                    Aucune dépense enregistrée pour l'instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {canEdit && (
          <form action={createExpense} className="border border-white/10 bg-card p-5 grid gap-4 sm:grid-cols-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="font-jost text-xs tracking-[0.1em] uppercase text-gray1">Intitulé</label>
              <input
                name="label"
                required
                placeholder="ex : Loyer garage"
                className="bg-bg border border-white/10 px-4 py-3 text-sm focus:border-gold transition"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-jost text-xs tracking-[0.1em] uppercase text-gray1">Montant ($)</label>
              <input
                type="number"
                name="amount"
                required
                className="bg-bg border border-white/10 px-4 py-3 text-sm focus:border-gold transition"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-jost text-xs tracking-[0.1em] uppercase text-gray1">Note (optionnel)</label>
              <input
                name="note"
                className="bg-bg border border-white/10 px-4 py-3 text-sm focus:border-gold transition"
              />
            </div>
            <button className="bg-gold text-bg px-5 py-3 font-jost text-xs tracking-[0.15em] uppercase hover:bg-goldlight transition h-fit">
              Ajouter la dépense
            </button>
          </form>
        )}
      </section>

      {canEdit && (
        <section className="mt-12 border-t border-white/10 pt-10">
          <p className="font-jost text-lg tracking-[0.06em] uppercase mb-2">Clôturer la période</p>
          <p className="text-sm text-gray1 mb-5">
            Archive toutes les factures et dépenses actuelles, remet la comptabilité à zéro, et met à jour le solde
            bancaire avec le résultat net (impôts déduits). Consultable ensuite dans Archives.
          </p>
          <CloseAccountingButton />
        </section>
      )}
    </div>
  );
}

function SummaryCard({ label, value, className = "text-goldlight" }: { label: string; value: number; className?: string }) {
  return (
    <div className="border border-white/10 bg-card p-5">
      <p className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2 mb-2">{label}</p>
      <p className={`font-jost text-xl ${className}`}>{value.toLocaleString("fr-FR")}$</p>
    </div>
  );
}
