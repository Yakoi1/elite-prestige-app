import { getSessionWithFreshPermissions } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import WeeklyServiceLive from "./WeeklyServiceLive";

async function changeOwnPassword(formData: FormData) {
  "use server";
  const session = await getSessionWithFreshPermissions();
  if (!session?.user) throw new Error("Non connecté.");

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (newPassword.length < 6) {
    throw new Error("Le nouveau mot de passe doit faire au moins 6 caractères.");
  }
  if (newPassword !== confirmPassword) {
    throw new Error("La confirmation ne correspond pas au nouveau mot de passe.");
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Compte introuvable.");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("Mot de passe actuel incorrect.");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false }
  });

  revalidatePath("/admin/profile");
}

export default async function ProfilePage() {
  const session = await getSessionWithFreshPermissions();
  const userId = (session?.user as any)?.id as string | undefined;
  const perms = (session?.user as any)?.permissions as string[] | undefined;

  let personalRevenue = 0;
  let weeklyBaseHours = 0;
  let activeStartedAt: string | null = null;

  if (userId) {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay() || 7; // lundi = 1 ... dimanche = 7
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - (day - 1));

    const [invoiceSum, weekShifts, activeShift] = await Promise.all([
      prisma.invoice.aggregate({ where: { createdById: userId }, _sum: { amount: true } }),
      prisma.shiftLog.findMany({ where: { userId, startedAt: { gte: startOfWeek } } }),
      prisma.shiftLog.findFirst({ where: { userId, endedAt: null } })
    ]);

    personalRevenue = invoiceSum._sum.amount ?? 0;
    activeStartedAt = activeShift?.startedAt.toISOString() ?? null;
    weeklyBaseHours = weekShifts.reduce((sum, s) => {
      const end = s.endedAt ?? (s.id === activeShift?.id ? new Date() : s.endedAt);
      if (!end) return sum; // service en cours, comptabilisé en direct côté client
      return sum + (end.getTime() - s.startedAt.getTime()) / 1000 / 60 / 60;
    }, 0);
  }

  return (
    <div>
      <h1 className="font-jost text-xl tracking-[0.1em] uppercase mb-8">Mon profil</h1>

      {userId && (
        <div className="grid sm:grid-cols-2 gap-4 mb-8 max-w-md">
          <div className="border border-white/10 bg-card p-5">
            <p className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2 mb-2">
              Mon chiffre d'affaires
            </p>
            <p className="font-jost text-xl text-goldlight">{personalRevenue.toLocaleString("fr-FR")}$</p>
          </div>
          <div className="border border-white/10 bg-card p-5">
            <p className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2 mb-2">
              Service cette semaine
            </p>
            <p className="font-jost text-xl text-goldlight">
              <WeeklyServiceLive baseHours={weeklyBaseHours} activeStartedAt={activeStartedAt} />
            </p>
          </div>
        </div>
      )}

      <div className="border border-white/10 bg-card p-6 max-w-md">
        <p className="text-sm text-gray1 mb-6">
          Connecté en tant que <span className="text-cream">{session?.user?.name}</span> ·{" "}
          <span className="text-goldlight">{(session?.user as any)?.role}</span>
        </p>

        <form action={changeOwnPassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
              Mot de passe actuel
            </label>
            <input
              name="currentPassword"
              type="password"
              required
              className="bg-bg border border-white/10 px-4 py-3 text-sm focus:border-gold transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
              Nouveau mot de passe
            </label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={6}
              className="bg-bg border border-white/10 px-4 py-3 text-sm focus:border-gold transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="bg-bg border border-white/10 px-4 py-3 text-sm focus:border-gold transition"
            />
          </div>
          <button className="justify-self-start bg-gold text-bg py-3 px-8 font-jost text-[0.65rem] tracking-[0.2em] uppercase hover:bg-goldlight transition w-fit mt-2">
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
