import { signOut } from "@/auth";
import { getSessionWithFreshPermissions } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithFreshPermissions();
  if (!session?.user) redirect("/login");

  const perms = (session.user as any).permissions as string[];
  const role = (session.user as any).role as string;
  const mustChangePassword = (session.user as any).mustChangePassword as boolean;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-6 flex md:flex-col gap-6 justify-between md:justify-start">
        <div>
          <Link href="/" className="font-jost text-xs tracking-[0.3em] uppercase text-gold">
            Elite Prestige
          </Link>
          <p className="text-xs text-gray1 mt-2">
            {session.user.name} <span className="text-gray2">· {role}</span>
          </p>
        </div>

        <nav className="flex md:flex-col gap-4 md:gap-3 text-sm flex-wrap">
          {hasPermission(perms, PERMISSIONS.VEHICLES_VIEW) && (
            <Link href="/admin/vehicles" className="text-gray1 hover:text-gold transition">
              Véhicules
            </Link>
          )}
          {hasPermission(perms, PERMISSIONS.SERVICE_USE) && (
            <Link href="/admin/service" className="text-gray1 hover:text-gold transition">
              Service
            </Link>
          )}
          {hasPermission(perms, PERMISSIONS.INVOICES_VIEW) && (
            <Link href="/admin/invoices" className="text-gray1 hover:text-gold transition">
              Factures
            </Link>
          )}
          {hasPermission(perms, PERMISSIONS.DASHBOARD_VIEW) && (
            <Link href="/admin/dashboard" className="text-gray1 hover:text-gold transition">
              Tableau de bord
            </Link>
          )}
          {hasPermission(perms, PERMISSIONS.ACCOUNTING_VIEW) && (
            <Link href="/admin/accounting" className="text-gray1 hover:text-gold transition">
              Comptabilité
            </Link>
          )}
          {hasPermission(perms, PERMISSIONS.ARCHIVES_VIEW) && (
            <Link href="/admin/archives" className="text-gray1 hover:text-gold transition">
              Archives
            </Link>
          )}
          {hasPermission(perms, PERMISSIONS.YACHT_VIEW) && (
            <Link href="/admin/yacht" className="text-gray1 hover:text-gold transition">
              Configurateur Mega Yacht
            </Link>
          )}
          {hasPermission(perms, PERMISSIONS.THEME_VIEW) && (
            <Link href="/admin/theme" className="text-gray1 hover:text-gold transition">
              Couleurs du site
            </Link>
          )}
          {hasPermission(perms, PERMISSIONS.USERS_MANAGE) && (
            <Link href="/admin/users" className="text-gray1 hover:text-gold transition">
              Comptes
            </Link>
          )}
          {hasPermission(perms, PERMISSIONS.ROLES_MANAGE) && (
            <Link href="/admin/roles" className="text-gray1 hover:text-gold transition">
              Rôles
            </Link>
          )}
          <Link href="/admin/profile" className="text-gray1 hover:text-gold transition">
            Mon profil
          </Link>
        </nav>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="md:mt-auto"
        >
          <button className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2 hover:text-gold transition">
            Se déconnecter
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        {mustChangePassword && (
          <div className="mb-8 border border-gold/40 bg-gold/10 text-goldlight text-sm px-5 py-4">
            Ton mot de passe est temporaire.{" "}
            <Link href="/admin/profile" className="underline">
              Change-le dès maintenant
            </Link>
            .
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
