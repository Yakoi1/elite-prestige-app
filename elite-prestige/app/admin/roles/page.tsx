import { getSessionWithFreshPermissions } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, ALL_PERMISSIONS, hasPermission } from "@/lib/permissions";
import { createRole, updateRolePermissions, deleteRole } from "./actions";

export default async function RolesPage() {
  const session = await getSessionWithFreshPermissions();
  const perms = (session?.user as any)?.permissions as string[];
  if (!hasPermission(perms, PERMISSIONS.ROLES_MANAGE)) redirect("/admin");

  const roles = await prisma.role.findMany({
    include: { users: true },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div>
      <h1 className="font-jost text-xl tracking-[0.1em] uppercase mb-8">Rôles &amp; permissions</h1>

      <div className="flex flex-col gap-6 mb-10">
        {roles.map((role) => (
          <div key={role.id} className="border border-white/10 bg-card p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <p className="font-jost text-sm tracking-[0.08em] uppercase">
                  {role.name}
                  {role.isSystem && (
                    <span className="ml-3 text-[0.6rem] text-gray2 tracking-[0.1em]">rôle système</span>
                  )}
                </p>
                <p className="text-xs text-gray2 mt-1">{role.users.length} compte(s) avec ce rôle</p>
              </div>
              {!role.isSystem && (
                <form action={deleteRole}>
                  <input type="hidden" name="id" value={role.id} />
                  <button className="text-xs text-gray1 hover:text-red-400 transition">Supprimer le rôle</button>
                </form>
              )}
            </div>

            {role.isSystem ? (
              <ul className="grid sm:grid-cols-2 gap-2 text-xs text-gray1">
                {ALL_PERMISSIONS.filter((p) => role.permissions.includes(p.key)).map((p) => (
                  <li key={p.key}>— {p.label}</li>
                ))}
              </ul>
            ) : (
              <form action={updateRolePermissions} className="flex flex-col gap-4">
                <input type="hidden" name="id" value={role.id} />
                <div className="grid sm:grid-cols-2 gap-3">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-xs text-gray1">
                      <input
                        type="checkbox"
                        name="permissions"
                        value={p.key}
                        defaultChecked={role.permissions.includes(p.key)}
                        className="accent-gold"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
                <button className="justify-self-start bg-gold text-bg py-2 px-6 font-jost text-[0.6rem] tracking-[0.18em] uppercase hover:bg-goldlight transition w-fit">
                  Enregistrer les droits
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

      <div className="border border-white/10 bg-card p-6">
        <p className="font-jost text-sm tracking-[0.08em] uppercase mb-6">Créer un nouveau rôle</p>
        <form action={createRole} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 max-w-sm">
            <label className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-gray2">Nom du rôle</label>
            <input
              name="name"
              required
              placeholder="ex : Commercial, Pilote..."
              className="bg-bg border border-white/10 px-4 py-3 text-sm focus:border-gold transition"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {ALL_PERMISSIONS.map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-xs text-gray1">
                <input type="checkbox" name="permissions" value={p.key} className="accent-gold" />
                {p.label}
              </label>
            ))}
          </div>
          <button className="justify-self-start bg-gold text-bg py-3 px-8 font-jost text-[0.65rem] tracking-[0.2em] uppercase hover:bg-goldlight transition w-fit">
            Créer le rôle
          </button>
        </form>
      </div>
    </div>
  );
}
