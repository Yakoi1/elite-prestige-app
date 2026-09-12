import { getSessionWithFreshPermissions } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import ServiceClock from "./ServiceClock";

export const dynamic = "force-dynamic";

function formatHours(ms: number) {
  const hours = ms / 1000 / 60 / 60;
  return `${hours.toFixed(1)} h`;
}

export default async function ServicePage() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.SERVICE_USE)) redirect("/admin");
  const userId = (session?.user as any).id as string;

  const [active, recentShifts] = await Promise.all([
    prisma.shiftLog.findFirst({ where: { userId, endedAt: null } }),
    prisma.shiftLog.findMany({
      where: { userId, endedAt: { not: null } },
      orderBy: { startedAt: "desc" },
      take: 10
    })
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-jost text-2xl tracking-[0.1em] uppercase mb-8">Service</h1>

      <ServiceClock activeStartedAt={active?.startedAt.toISOString() ?? null} />

      <section className="mt-10">
        <p className="font-jost text-sm tracking-[0.1em] uppercase text-gray1 mb-4">Mes derniers services</p>
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left font-jost text-xs tracking-[0.1em] uppercase text-gray1">
                <th className="p-4">Début</th>
                <th className="p-4">Fin</th>
                <th className="p-4">Durée</th>
              </tr>
            </thead>
            <tbody>
              {recentShifts.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="p-4 text-gray1 whitespace-nowrap">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(s.startedAt)}
                  </td>
                  <td className="p-4 text-gray1 whitespace-nowrap">
                    {s.endedAt
                      ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(s.endedAt)
                      : "—"}
                  </td>
                  <td className="p-4 text-goldlight">
                    {s.endedAt ? formatHours(s.endedAt.getTime() - s.startedAt.getTime()) : "—"}
                  </td>
                </tr>
              ))}
              {recentShifts.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray2">
                    Aucun service terminé pour l'instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
