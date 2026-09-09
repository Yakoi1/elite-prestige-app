import { auth } from "@/auth";
import Link from "next/link";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

export default async function AdminDashboard() {
  const session = await auth();
  const perms = (session?.user as any)?.permissions as string[];

  return (
    <div>
      <h1 className="font-jost text-xl tracking-[0.1em] uppercase mb-8">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hasPermission(perms, PERMISSIONS.VEHICLES_VIEW) && (
          <Link
            href="/admin/vehicles"
            className="border border-white/10 bg-card p-6 hover:border-gold/50 transition"
          >
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-gold mb-2">Flotte</p>
            <p className="text-sm text-gray1">Consulter et gérer les véhicules du catalogue.</p>
          </Link>
        )}

        {hasPermission(perms, PERMISSIONS.INVOICES_VIEW) && (
          <Link
            href="/admin/invoices"
            className="border border-white/10 bg-card p-6 hover:border-gold/50 transition"
          >
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-gold mb-2">Factures</p>
            <p className="text-sm text-gray1">Enregistrer une location et consulter l'historique.</p>
          </Link>
        )}

        {hasPermission(perms, PERMISSIONS.DASHBOARD_VIEW) && (
          <Link
            href="/admin/dashboard"
            className="border border-white/10 bg-card p-6 hover:border-gold/50 transition"
          >
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-gold mb-2">Tableau de bord</p>
            <p className="text-sm text-gray1">Chiffre d'affaires, tendances et véhicules les plus rentables.</p>
          </Link>
        )}

        {hasPermission(perms, PERMISSIONS.ACCOUNTING_VIEW) && (
          <Link
            href="/admin/accounting"
            className="border border-white/10 bg-card p-6 hover:border-gold/50 transition"
          >
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-gold mb-2">Comptabilité</p>
            <p className="text-sm text-gray1">Achats véhicules, solde bancaire et dépenses de l'entreprise.</p>
          </Link>
        )}

        {hasPermission(perms, PERMISSIONS.ARCHIVES_VIEW) && (
          <Link
            href="/admin/archives"
            className="border border-white/10 bg-card p-6 hover:border-gold/50 transition"
          >
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-gold mb-2">Archives</p>
            <p className="text-sm text-gray1">Comptabilités clôturées (export PDF) et fiches clients.</p>
          </Link>
        )}

        {hasPermission(perms, PERMISSIONS.YACHT_VIEW) && (
          <Link
            href="/admin/yacht"
            className="border border-white/10 bg-card p-6 hover:border-gold/50 transition"
          >
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-gold mb-2">Configurateur Mega Yacht</p>
            <p className="text-sm text-gray1">Forfaits, options, galerie et photo de présentation.</p>
          </Link>
        )}

        {hasPermission(perms, PERMISSIONS.THEME_VIEW) && (
          <Link
            href="/admin/theme"
            className="border border-white/10 bg-card p-6 hover:border-gold/50 transition"
          >
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-gold mb-2">Couleurs du site</p>
            <p className="text-sm text-gray1">Fond, boutons, texte et titres — sur tout le site.</p>
          </Link>
        )}

        {hasPermission(perms, PERMISSIONS.USERS_MANAGE) && (
          <Link
            href="/admin/users"
            className="border border-white/10 bg-card p-6 hover:border-gold/50 transition"
          >
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-gold mb-2">Comptes</p>
            <p className="text-sm text-gray1">Créer des accès collaborateurs et leur attribuer un rôle.</p>
          </Link>
        )}

        {hasPermission(perms, PERMISSIONS.ROLES_MANAGE) && (
          <Link
            href="/admin/roles"
            className="border border-white/10 bg-card p-6 hover:border-gold/50 transition"
          >
            <p className="font-jost text-xs tracking-[0.15em] uppercase text-gold mb-2">Rôles</p>
            <p className="text-sm text-gray1">Créer des rôles personnalisés et définir leurs droits.</p>
          </Link>
        )}
      </div>
    </div>
  );
}
