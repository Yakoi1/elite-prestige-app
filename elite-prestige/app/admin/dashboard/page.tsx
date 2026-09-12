import { getSessionWithFreshPermissions } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import {
  RevenueByCategoryChart,
  RevenueOverTimeChart,
  TopVehiclesChart,
  FleetAllocationChart
} from "./DashboardCharts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.DASHBOARD_VIEW)) redirect("/admin");

  const [invoices, vehicles, expenses, account, users, shifts] = await Promise.all([
    prisma.invoice.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.vehicle.findMany(),
    prisma.expense.findMany(),
    prisma.companyAccount.findUnique({ where: { id: "company" } }),
    prisma.user.findMany(),
    prisma.shiftLog.findMany()
  ]);

  const totalRevenue = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPurchaseCost = vehicles.reduce((sum, v) => sum + (v.purchasePrice ?? 0) + (v.customPrice ?? 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netResult = totalRevenue - totalPurchaseCost - totalExpenses;
  const bankBalance = account?.bankBalance ?? 0;

  // Chiffre d'affaires par catégorie
  const byCategory = new Map<string, number>();
  for (const inv of invoices) {
    byCategory.set(inv.categoryLabel, (byCategory.get(inv.categoryLabel) || 0) + inv.amount);
  }
  const revenueByCategory = Array.from(byCategory.entries()).map(([name, total]) => ({ name, total }));

  // Chiffre d'affaires sur les 14 derniers jours
  const days: { date: string; total: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    const dayTotal = invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return invDate.toDateString() === d.toDateString();
      })
      .reduce((sum, inv) => sum + inv.amount, 0);
    days.push({ date: key, total: dayTotal });
  }

  // Top véhicules par chiffre d'affaires
  const byVehicle = new Map<string, number>();
  for (const inv of invoices) {
    byVehicle.set(inv.vehicleName, (byVehicle.get(inv.vehicleName) || 0) + inv.amount);
  }
  const topVehicles = Array.from(byVehicle.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // Répartition de la flotte par catégorie
  const fleetByCategory = new Map<string, number>();
  for (const v of vehicles) {
    fleetByCategory.set(v.categoryLabel, (fleetByCategory.get(v.categoryLabel) || 0) + 1);
  }
  const fleetAllocation = Array.from(fleetByCategory.entries()).map(([name, value]) => ({ name, value }));

  // Classement temps de service
  const now2 = Date.now();
  const serviceMsByUser = new Map<string, number>();
  for (const s of shifts) {
    const end = s.endedAt ? s.endedAt.getTime() : now2;
    serviceMsByUser.set(s.userId, (serviceMsByUser.get(s.userId) || 0) + (end - s.startedAt.getTime()));
  }
  const serviceRanking = users
    .map((u) => ({ name: u.username, hours: (serviceMsByUser.get(u.id) || 0) / 1000 / 60 / 60 }))
    .sort((a, b) => b.hours - a.hours);

  return (
    <div>
      <h1 className="font-jost text-2xl tracking-[0.1em] uppercase mb-8">Tableau de bord</h1>

      {/* Indicateurs clés */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <KpiCard label="Chiffre d'affaires" value={totalRevenue} />
        <KpiCard label="Coût d'achat flotte" value={totalPurchaseCost} />
        <KpiCard label="Dépenses" value={totalExpenses} />
        <KpiCard label="Résultat net" value={netResult} highlight={netResult >= 0 ? "positive" : "negative"} />
        <KpiCard label="Solde bancaire" value={bankBalance} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Chiffre d'affaires — 14 derniers jours">
          <RevenueOverTimeChart data={days} />
        </ChartCard>
        <ChartCard title="Chiffre d'affaires par catégorie">
          <RevenueByCategoryChart data={revenueByCategory} />
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Véhicules les plus rentables">
          <TopVehiclesChart data={topVehicles} />
        </ChartCard>
        <ChartCard title="Répartition de la flotte">
          <FleetAllocationChart data={fleetAllocation} />
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Temps de service par employé">
          <div className="flex flex-col gap-2">
            {serviceRanking.map((u, i) => (
              <div key={u.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="flex items-center gap-3">
                  <span className="font-jost text-xs text-gray2 w-5">{i + 1}.</span>
                  <span className="text-sm">{u.name}</span>
                </span>
                <span className={`font-jost text-sm ${u.hours > 0 ? "text-goldlight" : "text-gray2"}`}>
                  {u.hours > 0 ? `${u.hours.toFixed(1)} h` : "Jamais en service"}
                </span>
              </div>
            ))}
            {serviceRanking.length === 0 && (
              <p className="text-sm text-gray2 text-center py-4">Aucun employé pour l'instant.</p>
            )}
          </div>
        </ChartCard>
      </div>

      <p className="text-xs text-gray2 mt-8">
        {invoices.length} facture{invoices.length > 1 ? "s" : ""} enregistrée{invoices.length > 1 ? "s" : ""} au
        total. Le résultat net est indicatif : chiffre d'affaires moins coût d'achat de la flotte (achat + custom)
        moins dépenses enregistrées en Comptabilité.
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  highlight
}: {
  label: string;
  value: number;
  highlight?: "positive" | "negative";
}) {
  const color = highlight === "positive" ? "text-emerald-400" : highlight === "negative" ? "text-red-400" : "text-goldlight";
  return (
    <div className="border border-white/10 bg-card p-5">
      <p className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2 mb-2">{label}</p>
      <p className={`font-jost text-xl ${color}`}>{value.toLocaleString("fr-FR")}$</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 bg-card p-6">
      <p className="font-jost text-xs tracking-[0.15em] uppercase text-gray1 mb-4">{title}</p>
      {children}
    </div>
  );
}
